FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl postgresql-client tzdata
ENV TZ=Pacific/Majuro

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN tr -d '\r' < docker-entrypoint.sh > docker-entrypoint.sh.tmp \
  && mv docker-entrypoint.sh.tmp docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh

RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
