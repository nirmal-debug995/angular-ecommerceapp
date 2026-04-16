# ---------- Build Stage ----------
FROM node:14 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ---------- Run Stage ----------
FROM nginx:alpine

# IMPORTANT FIX 👇 Angular output path
COPY --from=build /app/dist/client/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
