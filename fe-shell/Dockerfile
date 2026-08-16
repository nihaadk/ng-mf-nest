FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Prod-Build lädt mfe-1 von der öffentlichen Railway-Domain statt localhost:4201.
RUN cp public/federation.manifest.prod.json public/federation.manifest.json
RUN npm run build

FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/fe-shell/browser ./browser
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s browser -l $PORT"]
