import { NextAuthOptions, Profile, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { BASE_PATH } from "@/lib/base-path";
import { resolveCallbackUrl } from "@/lib/callback-url";
import { currentRequest } from "@/lib/request-context";
import { getClientIp, writeAuditEvent } from "@/lib/server/audit";

type GoogleProfile = Profile & {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type SessionUser = User & {
  role?: string;
  mustChangePassword?: boolean;
};

function allowedDomain(): string | null {
  const domain = process.env.ALLOWED_GOOGLE_DOMAIN?.trim().toLowerCase();
  return domain ? domain : null;
}

function onDomain(email: string, domain: string): boolean {
  return email.toLowerCase().endsWith(`@${domain}`);
}

async function recordAuth(params: {
  eventType: "SIGN_IN" | "SIGN_IN_DENIED" | "ADMIN_LOGIN";
  email?: string | null;
  name?: string | null;
  reason?: string;
}) {
  try {
    const req = currentRequest();
    await writeAuditEvent({
      eventType: params.eventType,
      actorEmail: params.email?.toLowerCase() ?? null,
      actorName: params.name ?? null,
      ipAddress: req ? getClientIp(req) : null,
      metadata: params.reason ? { reason: params.reason } : undefined,
    });
  } catch (error) {
    console.error("[AUTH] audit write failed", error);
  }
}

const providers: NextAuthOptions["providers"] = [];

const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const domain = allowedDomain();

if (googleId && googleSecret && domain) {
  providers.push(
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
          hd: domain,
        },
      },
      httpOptions: {
        timeout: 30000,
      },
    }),
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toString().trim().toLowerCase();
      const password = credentials?.password?.toString();
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.password) return null;
      if (!user.isActive || user.deletedAt) {
        await recordAuth({
          eventType: "SIGN_IN_DENIED",
          email,
          name: user.name,
          reason: user.deletedAt ? "deleted" : "inactive",
        });
        return null;
      }

      const matches = await bcrypt.compare(password, user.password);
      if (!matches) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      };
    },
  }),
);

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    // NextAuth sends this path to the browser unchanged. A leading slash
    // replaces the path on NEXTAUTH_URL, so the base path belongs in the value.
    signIn: `${BASE_PATH}/login`,
    error: `${BASE_PATH}/login`,
  },
  callbacks: {
    async redirect({ url }) {
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      if (!nextAuthUrl) return "/dashboard";
      return resolveCallbackUrl(url, nextAuthUrl);
    },
    async signIn({ account, profile, credentials }) {
      if (account?.provider === "google") {
        const googleProfile = profile as GoogleProfile | undefined;
        const email = googleProfile?.email?.trim().toLowerCase();
        const name = googleProfile?.name?.trim() || null;
        const configuredDomain = allowedDomain();

        if (!email) {
          await recordAuth({ eventType: "SIGN_IN_DENIED", name, reason: "missing_email" });
          return false;
        }
        if (googleProfile?.email_verified !== true) {
          await recordAuth({ eventType: "SIGN_IN_DENIED", email, name, reason: "unverified" });
          return false;
        }
        if (!configuredDomain || !onDomain(email, configuredDomain)) {
          await recordAuth({ eventType: "SIGN_IN_DENIED", email, name, reason: "wrong_domain" });
          return false;
        }

        try {
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing?.deletedAt) {
            await recordAuth({ eventType: "SIGN_IN_DENIED", email, name, reason: "deleted" });
            return false;
          }
          if (existing && !existing.isActive) {
            await recordAuth({ eventType: "SIGN_IN_DENIED", email, name, reason: "inactive" });
            return false;
          }
          if (!existing) {
            await prisma.user.create({
              data: {
                email,
                name: name || email.split("@")[0],
                image: googleProfile?.picture,
                role: "USER",
                mustChangePassword: false,
              },
            });
          }
          await recordAuth({ eventType: "SIGN_IN", email, name });
          return true;
        } catch (error) {
          console.error("[AUTH] Google sign-in failed", error);
          await recordAuth({ eventType: "SIGN_IN_DENIED", email, name, reason: "error" });
          return false;
        }
      }

      if (credentials) {
        const email = credentials.email?.toString().trim().toLowerCase();
        if (!email) return false;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive || user.deletedAt) return false;
        await recordAuth({ eventType: "ADMIN_LOGIN", email, name: user.name });
        return true;
      }

      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        if (token.email) session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const row = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (row) {
          token.id = row.id;
          token.role = row.role;
          token.mustChangePassword = row.mustChangePassword;
          token.name = row.name;
          token.email = row.email;
        } else {
          const signedIn = user as SessionUser;
          token.role = signedIn.role;
          token.id = signedIn.id;
          token.mustChangePassword = signedIn.mustChangePassword;
        }
      } else if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (fresh) {
          token.role = fresh.role;
          token.mustChangePassword = fresh.mustChangePassword;
          token.name = fresh.name;
          token.email = fresh.email;
        }
      }
      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
