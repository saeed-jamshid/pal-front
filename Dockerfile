FROM oven/bun:1.4.2 AS bun

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build
COPY . .
# Rewrites are baked at build time; browser requests stay same-origin.
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_API_BASE_URL="" PAL_BACKEND_URL=http://pal-back:8000
RUN bun test lib/*.test.ts && bun run lint && bun run typecheck && bun run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Next tracing must never ship env files; reject unhydrated LFS video pointers.
RUN find . -type f -name '.env*' -delete \
    && ! grep -rl '^version https://git-lfs.github.com/spec/v1$' public \
    && mkdir -p .next/cache && chown node:node .next/cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
