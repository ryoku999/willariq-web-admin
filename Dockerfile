# ==================================================
# BUILD STAGE
# ==================================================

FROM node:24-bookworm-slim AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@12.23.0

# Instalar dependencias
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Variables de entorno de Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Compilar aplicación
RUN test -n "$VITE_API_URL" && pnpm run build


# ==================================================
# PRODUCTION STAGE
# ==================================================

FROM nginx:stable-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 7000

CMD ["nginx", "-g", "daemon off;"]