# Gebeya frontend

The web app for [Gebeya](https://github.com/SukGebeya/Backend), an escrow marketplace for Ethiopian social sellers. A seller lists a product and shares its link in a Telegram or TikTok post; the buyer pays with Telebirr, CBE Birr or card through Chapa; the money is held until the buyer confirms delivery; the seller is paid into a wallet and withdraws it.

Built with **SvelteKit 3** and **Svelte 5**, mobile-first, in **Amharic and English**.

## What's here

| Who      | Pages                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buyer    | product link `/p/[slug]`, shop `/s/[shop]`, cart, checkout (subcity and woreda addresses), Chapa return page, orders with confirm delivery, dispute and cancel |
| Seller   | onboarding, overview, products (options, prices, stock, images, share link), orders (accept, ship, cancel), wallet and payouts, shop settings                  |
| Everyone | phone sign-up with SMS code, log in, password reset by SMS, language switch                                                                                    |

Admin work (KYC, shop verification, disputes, payout approval) stays in the API's Swagger UI for now.

## How it works

SvelteKit is a **backend-for-frontend**: the browser only talks to SvelteKit, and SvelteKit's server talks to the Go API.

- **Tokens never reach browser JavaScript.** Access and refresh tokens live in httpOnly cookies. `src/lib/server/api.ts` attaches them to API calls, refreshes an expired access token once (shared across parallel calls, since refresh tokens rotate) and stores the rotated pair.
- **Guest carts** use the API's `X-Session-ID`, kept in the app's own cookie and merged into the account cart at sign-in.
- **Forms work without JavaScript.** Every change is a form action; `use:enhance` adds progress and keeps the page in place. Inputs use `defaultValue`, so text typed before hydration on a slow connection is never overwritten.
- **Money is integer santim** end to end (`src/lib/money.ts`), as in the API. No floats.
- **Idempotency:** checkout and payout forms carry a key generated per render, so a double submit replays the same request instead of creating a second order or payout.
- **Typed API:** `src/lib/api/schema.ts` is generated from the API's Swagger file. `scripts/gen-api.mjs` converts it to OpenAPI 3 and marks every response field required unless the Go struct says `omitempty`.

## Run it

You need Node 22.17+ and the API running locally (see the [backend quick start](https://github.com/SukGebeya/Backend#quick-start)).

```bash
npm ci
cp .env.example .env     # API_URL defaults to http://localhost:8080/api/v1
npm run dev              # http://localhost:3000
```

With `CHAPA_MODE=mock`, "Continue to payment" opens the API's mock Chapa checkout. There you pay with Telebirr, CBE Birr or a test card, or decline or cancel. It then returns to `/payment/complete`; port 3000 matches the API's development `CHAPA_RETURN_URL`. Payouts settle on the mock a few seconds after an admin approves them, and an account number ending in `0000` fails. The mock's dashboard is at http://localhost:8080/mock-chapa/. Use code `123456` for SMS verification (`OTP_DEV_CODE`).

Start the API with `TRUSTED_PROXY_COUNT=1`. Every request reaches the API through this server, which forwards the buyer's address in `X-Forwarded-For`; without it, all users share one rate-limit bucket.

## Commands

```bash
npm run dev          # dev server on :3000
npm run check        # svelte-check (types)
npm run lint         # prettier + eslint
npm run test:unit    # vitest
npm run test:e2e     # playwright: the full money flow through the UI (needs the API)
npm run gen:api      # regenerate src/lib/api/schema.ts from ../Backend/docs/swagger.json
npm run build        # production build (adapter-node) into build/
```

`npm run test:e2e` builds the app and drives a seller and a buyer through sign-up, onboarding, listing, a Telebirr payment on the mock checkout, shipping, delivery, settlement, a declined payment, and two payouts: one sent, one that fails at the provider. It needs the API and its Postgres container (it promotes an admin user to approve KYC). Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome, or run `npx playwright install chromium` once. `SCREENSHOT_DIR=…` saves a screenshot of each step. Locally every request comes from one address, so start the API with `RATE_LIMIT_REQUESTS=1000` for test runs. The API's `.env.example` also sets `AUTH_RATE_LIMIT_REQUESTS=60` and `PAYOUT_RECHECK_INTERVAL=10s`, which the payout steps rely on.

## Deploy

```bash
docker build -t gebeya-frontend .
docker run -p 3000:3000 -e API_URL=https://api.example.com/api/v1 \
  -e PROTOCOL_HEADER=x-forwarded-proto -e HOST_HEADER=x-forwarded-host \
  -e ADDRESS_HEADER=X-Forwarded-For -e XFF_DEPTH=1 gebeya-frontend
```

Behind a TLS-terminating proxy, `PROTOCOL_HEADER` and `HOST_HEADER` let SvelteKit see its public origin (needed for its CSRF check), and `ADDRESS_HEADER`/`XFF_DEPTH` give it the buyer's real address to forward to the API.

## Layout

```
src/hooks.server.ts        language, API client and current user for every request
src/lib/server/            API client, cookies, error mapping, form parsing (server-only)
src/lib/api/               generated schema and DTO type aliases
src/lib/i18n/              en.ts (source) and am.ts (type-checked to have every key)
src/lib/components/        Header, Footer, SellerNav, Field, Submit, Alert, OrderItems, Icon, …
src/app.css                the design system (from docs/design/claude-design/gebeya.css)
src/routes/                buyer pages, auth pages, seller/(app)/… behind a shop guard
e2e/money-flow.e2e.ts      the end-to-end test
docs/design/BRIEF.md       design brief: every screen, field, action and state (for Claude Design)
docs/design/claude-design/ the approved design exported from Claude Design (gebeya.css + one file per screen)
```

## License

MIT
