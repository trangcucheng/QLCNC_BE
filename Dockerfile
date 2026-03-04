# lts-gallium refers to v16
# Using this instead of node:16 to avoid dependabot updates
FROM node:14.19.1 as builder

WORKDIR /usr/src/vnu_backend
COPY package*.json ./
RUN npm install
RUN npm i -g @nestjs/cli

# RUN chown -R root:root /usr/src/vnu_backend
COPY . .

# RUN npm run build

EXPOSE ${APP_PORT}

# Run the application in development mode
ENTRYPOINT ["sh", "-c", "npm run build && npm run start:prod"]


