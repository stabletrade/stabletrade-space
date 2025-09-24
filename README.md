# StableTrade — OTC Trading Frontend (Aptos)

StableTrade is a Next.js 14 application for OTC-style token trading on the Aptos blockchain (testnet). It integrates Aptos wallets, backend REST APIs, and a modern UI with Tailwind CSS and Ant Design. The app provides token discovery, price quotes, order books, user activity, and on-chain actions (create/cancel/accept orders) via Aptos transactions.

## Getting Started

- **Node**: v18+ recommended
- **Package manager**: Yarn

### Quick start

```bash
# Install
yarn

# Development
yarn dev

# Lint / Format
yarn lint
yarn format

# Production build and start
yarn build
yarn start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript, React 18
- **Styling**: Tailwind CSS 3, custom SCSS, CSS Modules
- **UI Library**: Ant Design 5
- **State Management**: Zustand
- **Data Fetching**: @tanstack/react-query
- **HTTP Client**: Axios
- **Realtime**: socket.io-client (for live activity/updates; wiring available)
- **Blockchain**: Aptos
  - @aptos-labs/ts-sdk
  - @aptos-labs/wallet-adapter-react & wallet-adapter-ant-design
  - On-chain calls assembled in hooks (e.g. `useAptos`, `useAptosExecuteTxs`)
- **Utilities**: moment, jwt-decode, bignumber.js, react-infinite-scroll-component, react-number-format, react-fast-marquee
- **Images**: next/image with remote patterns, sharp

## Project Structure

```
src/
  app/                    # Next.js app router pages and routes
    api/health/route.ts   # Healthcheck endpoint
    ...
  assets/                 # Fonts, icons
  components/             # Reusable UI components (custom + modals + tables)
  constant/               # Enums, constants, env bindings
  containers/             # Page-level containers (home, tokenDetail)
  hook/                   # React hooks (queries, wallet, UI helpers)
  Layouts/                # Layout components
  service/                # API clients (Axios) for BE endpoints
  store/                  # Zustand store
  styles/                 # Global and custom styles (Tailwind/SCSS)
  utils/                  # Utilities (storage, message, toast)
```

Notable routes/components:
- `app/page.tsx`: landing/home
- `app/explore/page.tsx`: token discovery
- `app/token/[id]/page.tsx`: token detail with orders/activity
- `components/modal/*`: wallet connect, create offer, trade token, etc.
- `app/api/health/route.ts`: FE health endpoint

## Environment Variables

Frontend reads environment variables via `process.env` in `src/constant/index.ts`.

- `NEXT_PUBLIC_FE_URL` — frontend base URL (optional)
- `NEXT_PUBLIC_BE_URL` — backend API base URL (required)
- `NEXT_PUBLIC_DISCORD_CLIENT_ID` — OAuth client ID for Discord (optional; default fallback present)
- `NEXT_PUBLIC_TWITTER_CLIENT_ID` — OAuth client ID for Twitter (optional; default fallback present)

Create a `.env.local` for local development:

```bash
NEXT_PUBLIC_BE_URL=https://your-backend.example.com
NEXT_PUBLIC_FE_URL=http://localhost:3000
NEXT_PUBLIC_DISCORD_CLIENT_ID=xxxxxxxx
NEXT_PUBLIC_TWITTER_CLIENT_ID=xxxxxxxx
```

Note: This repo’s `.env` is git-ignored. Use `.env.local` for local dev, `.env.production` for production overrides.

## API Layer and Endpoints

All API calls use a configured Axios instance with `baseURL = NEXT_PUBLIC_BE_URL` and optional `Authorization: Bearer <token>` header (via `setToken`). See `src/service/api.ts`.

- Pools and orders (`src/service/pool.ts`, `src/service/token.ts`):
  - `GET /pool/list-pool`
  - `GET /orders/all-activity`
  - `GET /orders/new-activity`
  - `GET /token/get-list`
  - `GET /token/get-token-info/:tokenAddress`
  - `GET /token/get-token-price/:tokenAddress`
  - `GET /pool/detail-pool`
  - `GET /token/quote-token`
  - `POST /token/import-token`
  - `GET /orders/get-list/:tokenAddress`
  - `GET /users/orders`
  - `GET /orders/order-activity`
  - `GET /users/transactions`
- User/profile/reward (`src/service/event.ts`):
  - `GET /task/get-all`
  - `POST /task/check-task/:id`
  - `GET /users/reward`
  - `POST /reward/sign-claim-reward`
  - `POST /reward/sign-claim-staking-reward`
- Auth/connect (`src/service/connect.ts`):
  - `POST /auth/login`
  - `POST /user/login-by-discord`
  - `POST /user/login-by-twitter`

## Aptos Integration

On-chain actions are assembled in `src/hook/useAptos.tsx` and executed via wallet adapter:
- `createOfferBuyAptos`
- `createOfferSellAptos`
- `cancelOfferAptos`
- `acceptOfferAptos`

They target a Move contract address defined inline (see `CONTRACT_ADDRESS` in `useAptos`). Network defaults to `Network.TESTNET`. `APTOS_OFFSET = 10 ** 8` is used for price precision; amounts are adjusted by token decimals.

To use wallets, the app integrates `@aptos-labs/wallet-adapter-react` and the Ant Design wallet selector.

## State and Data

- **Zustand store** in `src/store/index.tsx` for UI and session flags
- **React Query** for data fetching and caching in hooks under `src/hook/queries/*`

## Styling

- Tailwind is configured in `tailwind.config.ts` with custom colors, fonts, and backgrounds
- Global styles in `src/styles/globals.css`, custom overrides in `src/styles/customantd.scss` and `src/styles/custom.css`

## Development Workflow

- Use `yarn dev` to run at `http://localhost:3000`
- Ensure `NEXT_PUBLIC_BE_URL` is reachable; the FE health endpoint is at `/api/health`
- Wallet interactions require an Aptos-compatible wallet on Testnet

## Deployment

- The app builds with `yarn build` and serves with `yarn start`
- `next.config.mjs` enables remote images and sets security headers (`X-Frame-Options: SAMEORIGIN`)
- Dockerfile provided for containerized deployment

## Possibilities and Extensions

- Add more chains by extending `CHAIN` enum and wallet integrations
- Stream live order/activity via socket.io to power real-time tables
- Support additional auth providers; wire up Discord/Twitter OAuth flows end-to-end
- Expose more on-chain interactions via `useAptosExecuteTxs`
- Internationalization, theming, and accessibility enhancements

## Backend and Contract

Read more at `backend/README.md` and `contract/README.md`

## License

See `LICENSE`.
