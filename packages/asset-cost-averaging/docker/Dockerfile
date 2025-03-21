###################################################################################################
# BUILD PROJECT
###################################################################################################

FROM node:18.20-alpine3.18 AS builder

# get init service
RUN apk update && apk add dumb-init

# Copy meta files
COPY .eslintignore .
COPY .eslintrc.json .
COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY prepare.typecheck.js .

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy source files
COPY src ./src

# Remove unit tests
RUN find ./src -type d -name "__test__" -exec rm -rf {} +

# Build app
RUN yarn build


###################################################################################################
# BUILD IMAGE
###################################################################################################

FROM node:18.20-alpine3.18 AS runner

# Setup execution environment
WORKDIR /usr/app/
USER node
ENV NODE_ENV=production

# get init process so node doesn't run on PID 1
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init

# Copy distribution files
COPY --chown=node:node --from=builder dist ./dist

# Set start command
CMD ["dumb-init", "node", "./dist/main.js"]