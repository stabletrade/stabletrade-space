# Stabletrade Backend

NestJS backend providing authentication, token/pool/orders services, tasks/rewards, caching, and API docs. Built with PostgreSQL, TypeORM, Redis cache, and optional Kafka, MinIO, and WebSocket gateway.

## Tech Stack

- **Runtime/Framework**: NestJS 10, TypeScript 5
- **HTTP**: `@nestjs/platform-express`, `@nestjs/axios`
- **Auth**: `@nestjs/jwt`, Passport (JWT, Local)
- **Persistence**: PostgreSQL, TypeORM (0.2.x)
- **Cache**: `cache-manager` with Redis (`cache-manager-ioredis-yet`)
- **Validation/Transform**: `class-validator`, `class-transformer`, global `ValidationPipe`
- **API Docs**: Swagger (`@nestjs/swagger`, `swagger-ui-express`) at `/docs`
- **Messaging (optional)**: Kafka (via `kafkajs`)
- **Object Storage (optional)**: MinIO (`nestjs-minio-client`)
- **Scheduling**: `@nestjs/schedule`
- **WebSockets**: `@nestjs/websockets`, Socket.IO gateway

## Project Structure

```
src/
  app.module.ts
  main.ts
  filters/*
  kafka/* (optional)
  minio-client/* (optional)
  modules/
    auth|users|token|pool|orders|activity|tasks|reward|health|events
  utils/* (common functions, interceptors, enums)
entities/* (TypeORM entities)
```

## Main Modules

- **Auth**: login, JWT access/refresh, guards and strategies
- **Users**: user CRUD and cron jobs
- **Token**: token list and transactions endpoints
- **Pool**: pool listing and details
- **Orders**: order placement and activity
- **Activity**: activity feed
- **Tasks**: background task management
- **Reward/Stake**: reward logic and staking entities
- **Health**: liveness endpoints
- **Events (WebSocket)**: Socket.IO gateway to join rooms and receive events

## Utilities and Middleware

- Global exception filter: `AllExceptionsFilter`
- Global response interceptor: `TransformInterceptor`
- Global validation pipe with whitelist/transform/forbid non-whitelisted
- Redis-backed cache via `CacheModule`

## Local Development

Prerequisites: Node.js 18+, Docker, Yarn or npm.

1. Start PostgreSQL locally via Docker:
   - `yarn infra:up` (starts `postgres` at `localhost:5432`)
2. Configure environment variables: copy one of `.env`, `.env.test`, `.stag.env`, `.prod.env` or create `.env`.
3. Install dependencies: `yarn` (or `npm install`)
4. Run migrations and seeds (optional):
   - `yarn migration:run`
   - `yarn seed:run`
5. Start the server:
   - Dev: `yarn start:dev`
   - Prod: `yarn build && yarn start:prod`

Default CORS is enabled for all origins. API docs available at `/docs` once running.

## Environment Variables

The app loads env by `NODE_ENV` using `src/environments.ts`:

- `dev -> .env`, `test -> .env.test`, `stag -> .stag.env`, `prod -> .prod.env`

Required (validated at boot):

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRATION`
- `REFRESH_TOKEN_EXPIRATION`

Database / App:

- `DATABASE_PORT` (HTTP listen port)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_NAME`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Redis cache:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

Optional services:

- Kafka: configure module as needed
- MinIO: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESSKEY`, `MINIO_SECRETKEY`, `useSSL`

## Docker Compose

Included `docker-compose.yml` provides:

- `postgres` at `localhost:5432` (user: `templateUser`, db: `template`)
- `postgresTest` at `localhost:5433`

Use scripts:

- `yarn infra:up` / `yarn infra:down`

## NPM/Yarn Scripts

- Infra: `infra:up`, `infra:down`
- Build: `build`, `prebuild`
- Start: `start`, `start:dev`, `start:debug`, `start:prod`
- Lint/Format: `lint`, `format`
- Tests: `test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e`
- DB: `migration:generate`, `migration:run`, `migration:revert`, `seed:run`, `seed:one`
- Utilities: `prepare` (Husky), `reinstall` (reset DB and reseed)

## API Documentation

- Swagger UI is served at `/docs`.
- Adds two bearer auth schemes: `access-token` and `refresh-token`.

## WebSocket Events

- Socket.IO gateway enabled via `EventsGateway` with CORS. Clients can join rooms using a `JOIN_ROOM` event and receive room-scoped messages.

## Possibilities / Extensibility

- Enable Kafka by importing `KafkaModule` and wiring producers/consumers
- Enable MinIO for file operations by importing `MinioClientModule`
- Extend caching using Redis keys and TTLs via `CacheModule`
- Add new modules following the NestJS module structure under `src/modules/*`

## License

See `LICENSE`.
