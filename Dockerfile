FROM node:22-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV VITE_KEYGEN_HOST=api.keygen.localhost
ENV VITE_KEYGEN_VERSION=1.8
ENV VITE_KEYGEN_ACCOUNT_ID=00000000-0000-0000-0000-000000000000
ENV VITE_KEYGEN_EDITION=CE
ENV VITE_KEYGEN_MODE=singleplayer
ENV VITE_SENTRY_DSN=
ENV VITE_SENTRY_ENVIRONMENT=production

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm generate:routes && pnpm build


FROM nginx:1.27-alpine AS runner

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./docker/entrypoint.sh /docker-entrypoint.d/99-config.sh
RUN chmod +x /docker-entrypoint.d/99-config.sh

EXPOSE 5678

CMD ["nginx", "-g", "daemon off;"]