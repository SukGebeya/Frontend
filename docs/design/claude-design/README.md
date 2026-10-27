# Gebeya design (Claude Design export)

This folder is the **approved visual design** for the web app, exported from Claude Design on 2026-10-22. It was made from `../BRIEF.md` and is the reference for restyling every page. The functional spec is still `../BRIEF.md`: the design changes how pages look, not what they do.

- **Source canvas:** "Gebeya — web platform", https://claude.ai/artifact/ca90227d-aa65-4b5c-98ef-adfc5774b933 (version `1792675694-dc91`). It's private to the owner's claude.ai account. Claude Code can re-read it with the Artifact tool (`action: "read"`, then `scope: "files"` and `paths: ["project/…"]`) to check for a newer version.
- **Status:** implemented (2026-10-27). `src/app.css` is `gebeya.css` adapted for the app, and every page follows its screen. Where the app differs from the design:
  - **Left out, as new functions rather than restyling:** the compare-at price field in the option editor (buyers still see a compare-at price when one is set through the API), and the "Make this my default address" checkbox at checkout (a new address still always becomes the default).
  - **Waiting on the API:** product thumbnails and prices in the seller's products list, the items and the shop or buyer on order list rows, the shop on the buyer's order page, and the shop name and item photos in the cart. These rows show a placeholder icon until the API returns the data.
  - **Seller orders:** the "N orders need you" line uses the dashboard's `orders_action_required`, since that count covers both `paid` and `processing` and the list returns one page at a time.

## What's here

| File | What it is |
| --- | --- |
| `gebeya.css` | **The design system as real CSS**: tokens (light and dark), type for Latin and Ethiopic, layout, and every component class. Implementation should use it nearly as is. |
| `canvas.json` | Canvas index: artboard positions, pages, and the designer's notes (summarized below). |
| `Main.dc.html` | Foundations: tokens, colors, type scale, spacing, radius. |
| `Controls.dc.html`, `Commerce.dc.html` (+ `…Dark`) | Component sheets: every component and state, light and dark. |
| `Header`, `Footer`, `SellerNav` `.dc.html` | Shared chrome. |
| One `.dc.html` per screen | See the route map below. Files named `…Desktop`, `…Dark` or with a state suffix (e.g. `PayFailed`, `BuyerOrderPaid`) are thin wrappers. They import the phone screen with different props. |

## Reading a `.dc.html` file

These are Claude Design component pages, not plain HTML, and they don't render on their own in a browser: the editor runtime `support.js` is not exported.

- The markup is inside `<x-dc>…</x-dc>`. Inline `style="…"` is layout specific to that screen. Classes come from `gebeya.css`.
- `{{name}}` is a value computed in the `<script type="text/x-dc">` block at the bottom (`renderVals()`). The `data-props` attribute on that script lists each screen's **state tweaks**, e.g. `status`, `state`, `error`, `theme`: these are the states the page must support.
- `<sc-if value="{{x}}">` is a conditional block, and `<sc-for list="{{xs}}" as="x">` is a loop. These map to Svelte `{#if}` and `{#each}`.
- `<dc-import name="Header" …>` includes `Header.dc.html` with those props. In Svelte this becomes a component.
- Links like `href="BuyerOrders.dc.html"` are prototype links. The real route is in the map below.
- Form `action="#…"` values are placeholders. The real actions are the existing SvelteKit form actions (`?/pay`, `?/dispute`, …).

## Route map

| Route | Phone artboard | States and variants |
| --- | --- | --- |
| `/` | `Home` | `HomeDesktop` |
| `/login` | `Login` | `LoginDesktop`; tweak `notice` (password reset, wrong details) |
| `/register` | `Signup` | `SignupDesktop`; tweak `error` (phone taken, invalid phone) |
| `/verify-phone` | `VerifyPhone` | `VerifyPhoneDesktop`; tweak `state` (not sent, sent, wrong code, expired) |
| `/reset-password` | `ResetRequest` (step 1), `ResetSet` (step 2) | `ResetDesktop` |
| `+error.svelte` | `NotFound` | `ServerError`, `NotFoundDesktop` |
| `/p/[slug]` | `BuyerProduct` | `ProductOutOfStock`, `ProductDark`, `BuyerProductDesktop` |
| `/s/[shop]` | `BuyerShop` | `BuyerShopDesktop` |
| `/cart` | `BuyerCart` | `BuyerCartDesktop` |
| `/checkout` | `BuyerCheckout` | `CheckoutDark`, `CheckoutAm`, `BuyerCheckoutDesktop` |
| `/payment/complete` | `PayResult` (received) | `PayChecking`, `PayWaiting`, `PayFailed`, `PayUnknown`, `PayResultDesktop` |
| `/orders/[id]` | `BuyerOrder` (shipped) | `BuyerOrderPaid`, `BuyerOrderReport`, `BuyerOrderDelivered`, `BuyerOrderDispute`, `BuyerOrderAm`, `BuyerOrderDesktop` |
| `/orders` | `BuyerOrders` | `BuyerOrdersDesktop` |
| `/seller/onboard` | `SellerOnboarding` | `SellerOnboardingDesktop` |
| `/seller` | `SellerOverview` | `OverviewDark`, `SellerOverviewDesktop` |
| `/seller/products` | `SellerProducts` | `SellerProductsDesktop` |
| `/seller/products/new` | `SellerNewProduct` | `SellerNewProductDesktop` |
| `/seller/products/[id]` | `SellerProductEditor` | `ProductEditorNew`, `ProductEditorAm`, `SellerProductEditorDesktop` |
| `/seller/orders` | `SellerOrders` | `SellerOrdersDesktop` |
| `/seller/orders/[id]` | `SellerOrder` (paid) | `SellerOrderPreparing`, `SellerOrderShipped`, `SellerOrderAm`, `SellerOrderDesktop` |
| `/seller/wallet` | `SellerWallet` | `WalletLocked`, `WalletAm`, `SellerWalletDesktop` |
| `/seller/settings` | `SellerSettings` | `SellerSettingsDesktop` |
| layout | `Header`, `Footer` | the seller layout adds `SellerNav` |

## Designer's notes (from the canvas)

**How the canvas works**
- Tokens and every component class live in `gebeya.css`. Change a token there and every screen follows.
- Every screen is one responsive page. The 360 px frame and the 1280 px desktop frame render the same file. The layout switches at a **768 px container query** on `.g`.
- Look: "Apple-like restraint". White and near-black do most of the work. One green accent (`--accent`) marks links, focus, progress and buyer protection. Primary buttons are near-black pills.

**Buyer flow**
- **Product link:** price, options, quantity and Buy now come first, and the protection block sits right under the buttons. The gallery swipes on phones; its thumbnails are plain `#anchors`, so it works without JavaScript.
- **Header on phones:** guests always see Log in. Signed-in links (My orders, My shop) move into a menu built on `<details>`. Log out stays in the footer.
- **Checkout:** saved addresses and the note belong to the pay form through the HTML `form="…"` attribute. That lets "Add a new address" be its own form (Save address) without nesting forms. The pay button shows a busy state that prevents double orders.
- **Report a problem** is a `<details>` disclosure with Open dispute and Cancel, and it posts without JavaScript.

**Seller flow**
- **Seller tabs:** a five-up segmented bar under the header on phones, which fits 360 px in English and Amharic. A left sidebar on desktop.
- **Product editor:** split into cards (Share, Options, Details, Images, Delete). Each option has three small forms (Save, Set stock, Hide/Remove), so every action is its own submit and reports back at the top.
- **Products list:** shows a thumbnail and price per row. The `GET /merchant/products` API doesn't return these yet. It needs the `min_price_cents` and `primary_image_url` subqueries the public product list already has (`sqlc/queries/products.sql` in Backend).
- **Cancel and refund buyer** and **Delete product** sit behind a `<details>` confirmation.

**Auth**
- Verify phone uses one code field with `autocomplete="one-time-code"`, so Android fills it from the SMS.
- Reset password keeps two steps. Log in shows a "password changed" notice after step 2.
- Desktop auth pages keep the same narrow centred column.

**Amharic:** the designer couldn't read `src/lib/i18n/am.ts`, so apart from status labels and the tagline, **the Amharic copy in these files is a layout draft**. Use the real strings from `am.ts`. New strings need Amharic written for them, reviewed by a native speaker if possible. Ethiopic uses Noto Sans Ethiopic with taller line heights and no negative letter-spacing; `gebeya.css` handles this through `:lang(am)`.

## Implementation notes

- **Restyle only.** Keep `+page.server.ts`, `src/lib/server/*`, the form actions, `use:enhance`, `defaultValue` inputs and the i18n keys. The English copy in the design is sometimes new, e.g. "Welcome back." and "That didn't work". Add it as new keys in both `en.ts` and `am.ts`.
- **Theme:** the design toggles dark mode with a `.dark` class. The app follows `prefers-color-scheme`, so apply the `.g.dark` token block inside a media query too.
- **Fonts:** the design loads Inter and Noto Sans Ethiopic from Google Fonts. Self-host subset versions instead, for slow networks.
- **Icons:** inline stroke SVGs (`svg.i`, 24×24 viewBox, `stroke-width` 1.75). Collect the paths used in these files into one `Icon` component.
- **Header cart count:** the cart icon shows a badge with the number of items. That needs the cart in the root layout's data.
- **Without JavaScript:** the quantity stepper's − and + buttons need JS, so keep a working number input as the base.
