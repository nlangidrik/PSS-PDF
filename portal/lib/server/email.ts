import crypto from "crypto";

export function getEncryptionKey(): string {
  const key = process.env.EMAIL_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error("EMAIL_ENCRYPTION_KEY must be exactly 32 characters");
  }
  return key;
}

export function encryptSecret(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(getEncryptionKey()), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, encryptedHex] = payload.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Stored SMTP password is not encrypted");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(getEncryptionKey()),
    Buffer.from(ivHex, "hex"),
  );
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
