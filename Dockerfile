FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/custom_dictionary.json ./custom_dictionary.json
COPY --from=build /app/word_cache.json ./word_cache.json
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "dist/server.cjs"]
