# CLAUDE.md

Guidance for AI coding sessions and contributors in this repository. The API lives in `../Backend` (its `CLAUDE.md` and `docs/` explain the money flow).

`docs/design/BRIEF.md` lists every screen's fields, actions and states. Keep it in step when a page gains or loses a function.

**The approved visual design is in `docs/design/claude-design/`** (exported from Claude Design). Start with its `README.md`, which covers the route map, how to read `.dc.html` files and the designer's notes. `gebeya.css` there is the design system as CSS. Pages should match it; the placeholder styles in `src/app.css` are to be replaced.

## Stack

SvelteKit 3 + Svelte 5 (runes), TypeScript 6, Vite 8, adapter-node. SvelteKit 3 differs from 2: config is in `vite.config.ts` (no `svelte.config.js`), imports use `#lib/…` with `.js` extensions, env vars are declared in `src/env.ts` and read from `$app/env/private`, `$app/state` replaces `$app/stores`, `refreshAll` replaces `invalidateAll`, and internal links go through `resolve()` from `$app/paths` (lint enforces it).

## Commands

```bash
npm run dev          # :3000 (matches the API's CHAPA_RETURN_URL)
npm run check        # types
npm run lint         # prettier + eslint
npm run test:unit
npm run test:e2e     # needs the API running with CHAPA_MODE=mock, OTP_DEV_CODE=123456, PAYOUT_RECHECK_INTERVAL=10s
npm run gen:api      # after the API's swagger changes
```

If `npm install` fails with "Cannot read properties of null (reading 'edgesOut')", that is an npm 10 bug; use `npx npm@11 install`.

## Conventions

- **All API calls are server-side**, through `locals.api` (typed `openapi-fetch`). Never call the API from the browser or expose tokens.
- **Loads** use `must(result)`, which returns data or shows the error page. Pages that need a user call `requireUser(locals, url)`.
- **Actions** return `failure(result, form)` on API errors (keeps typed values and per-field errors) or `{ notice: '<i18n key>' }` on success. Pages read them with `formState(form)` and show `<FormMessage>`.
- **Forms**: `use:enhance={submitting().submit}`; pass `{ reset: true }` only for forms that add something new. Editable inputs use `defaultValue`, not `value`. Regex `pattern` attributes with `{n}` must be string expressions (`pattern={'[0-9]{6}'}`), or Svelte reads `{6}` as an expression.
- **Money** is integer santim: parse with `money()`/`parseMoney`, show with `formatMoney(cents, lang())`.
- **Text** goes through `t('key')`. Add new keys to `en.ts` and `am.ts`; the type checker and `i18n.spec.ts` fail if Amharic is missing a key or a placeholder.
- **Destructive actions** (cancel and refund, delete product) sit behind a `<details class="disclose danger">` that holds the real form, so the confirmation works without JavaScript. Don't use `confirm()`.
- **Comments:** sparse, explaining why.
