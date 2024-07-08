FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i --frozen-lockfile
ENV NODE_ENV production
RUN touch /app/config.js
RUN pnpm build

FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]