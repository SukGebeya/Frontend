# Gebeya design brief

> **The design made from this brief is in [`claude-design/`](claude-design/README.md), and the app now follows it.** This brief stays the functional spec: when a page gains or loses a field, action or state, update it here.

This document gives a designer (human or Claude Design) everything the web app does, so the visual design can be redone without losing any function. It describes **what each screen must contain and do**, not how it should look.

- Screenshots of every screen as it works today are in `docs/design/screens/` (phone width, English `.en.png` and Amharic `.am.png`). Use them to see **content and states**, not styling.
- Regenerate them with the API running: `SCREENSHOT_DIR=$PWD/docs/design/screens PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`.
- Everything here is implemented and tested. A design may rearrange, regroup, rename or restyle anything, but every field, action and state listed below must still have a place.

---

## How to use this with Claude Design

1. **Start with a design system, not screens.** In Claude (claude.ai), open Claude Design and create a design system project for Gebeya. Give it section 3 (constraints) and section 9 (components), and ask for:
   - color tokens for light and dark, including the status tones in section 6
   - a type scale that pairs a Latin face with **Noto Sans Ethiopic**
   - spacing and radius scales
   - every component in section 9
2. **Then design the screens.** Start a design project that uses that design system. Attach this file and the `screens/` folder. Work one flow at a time:
   - a. **Buyer:** product link → cart → checkout → payment result → order (paid, shipped, delivered, dispute) → my orders.
   - b. **Seller:** onboarding → overview → products → new product → product editor → orders → order (paid, preparing, shipped) → wallet → settings.
   - c. **Auth and public:** home, log in, create account, verify phone, reset password, not found.

   Ask for **phone frames (360 px) first**, then a desktop variant of each screen.

3. **Check Amharic early.** Ask for the Amharic version of checkout, the seller order page and the wallet. Ge'ez text is wider and taller, and these screens break first.
4. **Hand off.** Share the finished design (or design system) link with Claude Code, or use Claude Design's hand-off-to-code option if offered. Claude Code then rebuilds the Svelte pages to match, keeping all behavior.

Prompt you can paste to start step 2a:

> Design the buyer flow for Gebeya, a mobile-first escrow checkout for Ethiopian social-media sellers, using the attached brief (sections 1–8) and the Gebeya design system. The screenshots show what each screen must contain today; don't copy their look. Phone frames at 360 px first: product link, cart, checkout (with and without saved addresses), payment result (checking, paid, failed), order detail in each status, my orders. Show English and Amharic for checkout and order detail.

---

## 1. The product

Gebeya is an **escrow checkout for people who sell on Telegram, TikTok and Instagram** in Ethiopia. A seller lists a product and pastes its link into a post or chat. The buyer opens the link, pays with **Telebirr, CBE Birr or card** through Chapa (a local payment gateway; its payment page is hosted by Chapa, not by us), and the money is **held by Gebeya until the buyer confirms delivery**. The seller is then credited, minus a **5% fee**, and withdraws to Telebirr, CBE Birr or a bank account.

The problem it solves is **trust**. Buyers fear paying for things that never arrive, and sellers fear cash-on-delivery no-shows. Gebeya is not a destination marketplace: there is **no search, browsing or category page**. Buyers arrive from a link.

## 2. Who uses it

| Who        | Device and context                                                                                  | Main jobs                                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Buyer**  | Cheap Android phone, mobile data, opened from a Telegram or TikTok link, often a first-time visitor | Understand what they're buying and that their money is safe, pay, track the order, confirm delivery or report a problem |
| **Seller** | Same phones; small shop, often one person; posts products on social media                           | Open a shop, list products quickly, copy links, see who paid and where to deliver, ship, see earnings, withdraw         |
| Admin      | Out of scope (uses the API's Swagger UI)                                                            | —                                                                                                                       |

The same account can buy and sell. A user becomes a seller by completing onboarding.

## 3. Hard constraints

- **Mobile first.** Design at **360 px** wide, then desktop up to about 1100 px. No horizontal scrolling at 360 px.
- **Two languages, equal footing:** English and Amharic (አማርኛ). A switch is always available in the header. Amharic uses the Ge'ez script; use **Noto Sans Ethiopic** and allow for longer labels and larger line heights. All copy lives in `src/lib/i18n/en.ts` and `am.ts`.
- **Light and dark mode**, following the phone setting.
- **Slow networks.**
  - Pages are server-rendered and **work before (or without) JavaScript**. Every action is a normal form submit.
  - Avoid designs that depend on client-side interaction for core tasks: no custom dropdowns that need JS, no drag and drop, no infinite scroll.
  - Keep images and fonts light; a subset Ethiopic font is fine.
- **Money:**
  - always Ethiopian birr with two decimals and a thousands separator: `2,525.00 ETB` in English, `2,525.00 ብር` in Amharic
  - right-aligned in lists, tabular figures preferred
  - negative amounts use a real minus sign: `−125.00 ETB`
- **Phones** are shown as `0911 234 567`. **Dates and times** are Addis Ababa time, e.g. `22 Oct 2026, 13:37`.
- **Accessibility:**
  - WCAG AA contrast
  - tap targets of at least 44 px
  - visible labels on every input; placeholders are never the only label
  - status shown with text, not color alone
- **Trust has to be visible.** The "money is held until you confirm delivery" message appears on the product link, at checkout, on the payment result and on the order page.

## 4. Brand

- **Name:** Gebeya (ገበያ, "market"). The current mark is the Ge'ez letter **ገ** in a rounded square; it can change.
- **Tagline:** "Safe payments for social sellers" / "ለማኅበራዊ ሚዲያ ሻጮች አስተማማኝ ክፍያ".
- **Tone:** plain, reassuring, short sentences.
- **Open:** colors, type and personality are open to the designer. Today's placeholder is a green (`#0f6b4f`) on warm off-white; it does not need to be kept.

## 5. Screens

Each entry lists what the screen shows, its actions, and its states. "Field: hint" means the field has that hint text under it. Screenshot names are in brackets.

### Layout (all pages)

- **Header:**
  - the logo, linking home
  - **My orders** when logged in
  - **My shop** when the user is a seller
  - **Log in** when logged out; it returns to the current page afterwards
  - **Cart**, with a badge counting the items in it
  - the language switch, which shows the _other_ language's name: "አማርኛ" or "English"
  - On phones, My orders and My shop move into a menu (a `<details>` element, so it opens without JS).
- **Footer:** the tagline, plus **Log out** when logged in.
- **Seller area:** adds the shop name, "Verified shop" or "Not verified yet", a **View shop** link and a tab bar: **Overview · Products · Orders · Wallet · Settings**. All five tabs must fit at 360 px in both languages.
- **Messages:** form errors and success notices appear above the form. Per-field errors appear under the field.
- **Errors and not found** [public-02-not-found]: a title ("Page not found" or "Something went wrong"), an optional message, and **Go home**.

### Public and auth

**Home `/`** [public-01-home]

- Headline "Sell online. Get paid safely.", plus a lead paragraph.
- Buttons:
  - **Open a shop**, or **Go to my shop** for sellers
  - **Track my orders**
- Three steps:
  1. Share a link
  2. Buyer pays into escrow
  3. Get paid on delivery (minus 5%)
- This is the only marketing page. Most traffic lands on product links, not here.

**Log in `/login`** [auth-01-login]

- Fields: **Phone number or email**, **Password**.
- Links: **Forgot your password?**, and "New to Gebeya? **Create account**".
- States:
  - a success notice after a password reset
  - an "invalid credentials" error
- After login, the user returns to the page they came from (e.g. checkout).

**Create account `/register`** [auth-02-register]

- Fields:
  - **Phone number**, hint "For example 0911 234 567"; Ethiopian mobile numbers only, 09… or 07…
  - **Email (optional)**
  - **Password**, hint "At least 8 characters"
- Link to log in.
- Error example: "Enter an Ethiopian mobile number, like 0911 234 567."; also "phone already registered".
- On success an SMS code is sent and the user goes to Verify phone.

**Verify phone `/verify-phone`** [auth-03-verify-phone]

- Why it's needed: "A verified phone is needed to pay or to open a shop."
- "We sent a 6-digit code by SMS to 0911 234 567."
- **Code** field: 6 digits, numeric keyboard, one-time-code autofill.
- Buttons: **Verify**, and **Send a new code** (secondary).
- States:
  - code not sent yet: only "Send code" shows
  - code sent: a notice, plus the code field
  - wrong or expired code: an error (codes expire after 5 minutes)

**Reset password `/reset-password`** [auth-04-reset-password]

- Step 1: **Phone number**, then **Send code**. The notice "If the number is registered, a code was sent." is deliberately vague.
- Step 2: **Code from SMS** and **New password**, then **Set new password**. Afterwards the user goes to Log in with a success notice.

### Buyer

**Product link `/p/[slug]`**, the most important screen [buyer-01-product-link]

- This is what a buyer sees after tapping a link in Telegram. It must make the buyer trust it and buy within seconds. It also produces the link preview: title, price and image are used for the Telegram or WhatsApp card.
- **Images:** zero or more, main image first. With several, they form a swipeable gallery. Images may be missing or broken (they're external links), so plan a fallback.
- **Product name**, **price** of the selected option, and an optional **compare-at price** shown struck through (a discount).
- **Description:** optional, can be long, plain text.
- **Option picker:** shown only when there is more than one option.
  - Each option shows a name (e.g. "Size M", "128 GB, Red") and its price.
  - Out-of-stock options are disabled.
  - Typically 1–6 options.
- **Quantity:** 1 up to the stock left (max 100). When 5 or fewer are left, show "3 left".
- Buttons:
  - **Buy now** (primary): empties the cart, adds this item and goes to checkout
  - **Add to cart** (secondary): shows a notice "Added to your cart."
- **Sold by:**
  - the shop name, linking to the shop page
  - a **✓ Verified shop** badge if verified
  - the **delivery fee**
  - "Free delivery over 3,000.00 ETB" when the shop sets a threshold
- **Buyer protection** block: "Your payment is held until you confirm you received the item. If something goes wrong, open a dispute and get a refund."
- States:
  - out of stock: buttons replaced by "Out of stock"
  - no options yet: "This product is not available to order yet."
  - product not found: 404

**Shop `/s/[shop]`** [buyer-02-shop]

- **Shop name**, plus the ✓ Verified shop badge if verified.
- Description, if any.
- City and delivery fee: "Addis Ababa · Delivery 150.00 ETB".
- Product grid. Each tile shows the image (or a placeholder), the name, "from 2,500.00 ETB" (lowest option price), and "Out of stock" when none is left.
- Pagination: 24 per page.
- Empty state: "This shop has no products yet."

**Cart `/cart`** [buyer-03-cart]

- Works for guests and is kept when they sign up or log in.
- Each line shows:
  - the product name
  - the option name and unit price
  - the line total
  - a quantity input with an **Update** button (no-JS friendly)
  - a **Remove** button
- Then the **Subtotal**, "The shop's delivery fee is added on the payment page.", and "Items are reserved for you until 29 Oct 2026, 13:37." (carts hold stock for 7 days).
- **Checkout** button. Empty state: "Your cart is empty."
- An order can contain items from **one shop only**. Mixing shops gives an error at checkout.
- The design groups the cart under the shop's name and shows item photos, but the cart doesn't return the shop or images yet (a backend change), so lines show a placeholder icon.

**Checkout `/checkout`** [buyer-04-checkout-new-address, buyer-05-checkout]

- Requires login; logged-out buyers go to Log in and come back.
- **Phone not verified:** a warning, "Verify your phone to pay", with a **Verify now** link. The pay button is disabled until then.
- **Order summary:** each line shows the product name, "Size M × 1" under it and the line total, then the items total and the delivery-fee note.
- **Delivery address:**
  - **Saved addresses** are radio cards showing:
    - name and phone
    - "line1, line2, Woreda 03, Bole, Addis Ababa"
    - the default is preselected
  - **+ Add a new address** opens the form. The form is shown directly when there are no saved addresses. Fields:
    - **Full name**
    - **Phone for delivery**, prefilled with the buyer's phone
    - **Address**, hint "For example: Bole, near Edna Mall, house 12"
    - **More details (optional)**
    - **City**, default "Addis Ababa"
    - **Sub-city**, suggestions: Addis Ketema, Akaky Kaliti, Arada, Bole, Gullele, Kirkos, Kolfe Keranio, Lemi Kura, Lideta, Nifas Silk-Lafto, Yeka
    - **Woreda**
    - **Save address** button
- **Note for the seller (optional)**: up to 500 characters.
- **Continue to payment** (primary), with "You will pay on Chapa with Telebirr, CBE Birr or card." The buyer leaves for Chapa's page.
- Errors:
  - "Choose or add a delivery address."
  - out of stock since adding
  - items from more than one shop
  - Chapa unavailable
- A double tap never creates two orders.

**Payment result `/payment/complete`** [buyer-06-payment-complete]

- Where Chapa sends the buyer back. It checks the payment and updates on its own every 3 seconds, for up to 30 seconds.
- States:
  - **Checking your payment…**: a spinner, "Chapa has not confirmed the payment yet. This can take a minute.", plus **Check again** and **View order**
  - **Waiting for confirmation**: same as above, after polling stops
  - **Payment received**: a success mark, "Your money is held safely until you confirm delivery.", and **View order** (primary)
  - **Payment was not completed**: "No money was taken. You can order again.", and **View order**
  - **Unknown order**: "We could not tell which order this payment was for.", with a link to My orders

**Order detail `/orders/[id]`** [buyer-07-order-paid, buyer-08-order-shipped, buyer-09-order-dispute-form, buyer-10-order-delivered]

- **Title:** "Order #3eb05c7c", where the ID is the first 8 characters of the order's UUID. Below it, "Placed 22 Oct 2026, 13:37" and a **status badge**.
- **Progress tracker:** Paid → Preparing → Shipped → Delivered. It is shown only for those four statuses; see section 6 for the rest.
- **Next step:** a card under the tracker with a title and lead for the status (e.g. "Payment received", "On its way") and that status's actions.
- **Items:** each line shows the name, "option × qty" under it and the line total. Then **Items**, **Delivery** and **Total paid**. Then the buyer's **note**, if any.
- **Deliver to:** name, phone (a tap-to-call link) and full address. Fallback: "The delivery address was removed."
- **Shipment**, when the seller entered it: **Carrier**, **Tracking number**, **Estimated delivery**.
- Actions by status:
  - `pending_payment`:
    - **Check payment** (re-checks with Chapa)
    - **Cancel order**
    - unpaid orders cancel themselves after 1 hour
  - `paid`: **Cancel order**, which gives a full refund
  - `processing` (the seller is preparing it): **Report a problem**
  - `shipped`:
    - a highlighted box, "Confirming releases your payment to the shop. If you don't confirm, it happens automatically 7 days after shipping, on 3 Nov 2026.", with **I received my order** (primary)
    - **Report a problem**
  - **Report a problem** is a `<details>` disclosure holding the form:
    - "Your money stays held while Gebeya reviews the dispute."
    - **What went wrong?** (5–1000 characters)
    - **Open dispute** (danger) and **Cancel**
  - `disputed`: a warning, "Dispute open: <reason>", with the same held-money line
  - `delivered`, `cancelled`, `refunded`: no actions

**My orders `/orders`** [buyer-11-orders]

- A list, newest first. Each row shows "#3eb05c7c", the date, the total and a status badge, and links to the order.
- 20 per page. Empty state: "You have no orders yet."
- The design shows the shop and items on each row (and the shop on the order page), but the API doesn't return them for buyers yet (a backend change).

### Seller

All seller pages need login. Until the user completes onboarding, every `/seller` page redirects to onboarding.

**Open your shop `/seller/onboard`** [seller-01-onboard]

- Lead: "Buyers see your shop name and delivery fee before they pay."
- Warning if the phone isn't verified, with a **Verify now** link; the submit button is disabled until then.
- Fields:
  - **Shop name**
  - **Shop link**: the slug, hint "Lowercase letters, numbers and dashes. Leave empty to generate one."; it becomes `gebeya…/s/<slug>`
  - **About your shop (optional)**
  - **Shop phone**, prefilled
  - **City**, default Addis Ababa
  - **Delivery fee (ETB)**
  - **Free delivery above (ETB, optional)**
  - **TIN (optional, 10 digits)**
- **Open shop** button. Errors: slug taken, invalid amount.

**Overview `/seller`** [seller-02-dashboard-new, seller-02-dashboard]

- If the shop isn't verified, an info banner: "You can sell now. Payouts open after verification.", with badges for the shop and ID (KYC) checks.
- Four figures:
  - **Available to withdraw**
  - **Wallet balance**, with "Held for payouts: 1,000.00 ETB" when a payout is pending
  - **Total sales**
  - **Orders waiting for you**: a count that links to Orders and should be highlighted when above 0
- **Orders by status:** a status badge and count for each non-zero status.
- **Share your shop:** the shop URL and a **Copy link** button.
- How the money figures relate: wallet balance = everything credited and not yet paid out; available = balance minus payouts waiting to be sent. In the example: balance 2,525.00, held 1,000.00, available 1,525.00.

**Products `/seller/products`** [seller-03-products]

- **New product** button.
- A list of all products, including drafts and archived ones. Each row shows the name, last-updated date and a product status badge.
- 20 per page. Empty state: "No products yet", with a **New product** button.
- The design shows a thumbnail and price on each row, but the merchant products list doesn't return them yet (a backend change), so rows show a placeholder icon and no price.

**New product `/seller/products/new`** [seller-04-product-new]

- One quick form that lists a sellable item in one go.
- Fields:
  - **Product name**
  - **Description (optional)**
  - **Price (ETB)**: accepts "2,500" or "2500.50"
  - **In stock**: default 1
  - **Option name**, hint "For example: Size M, 128 GB, Red"; defaults to "Standard"
  - **Image link**, an https URL, hint "An https link to a photo you've already posted online. Photo upload is planned for later."
- **Create product** button. The product is created as active, and the seller lands on the product editor.

**Product editor `/seller/products/[id]`** [seller-05-product-edit]

- **Header:** the product name and status badge.
- **Share box**, highlighted right after creation:
  - "Your product is live. Share the link.", then the URL and **Copy link** (the button changes to "Copied")
  - if the product isn't active: "Only active products can be opened by buyers."
  - with no options: a warning, "Add at least one option with a price and stock so buyers can order."
- **Options and prices:**
  - Each option shows:
    - its name, plus "· Hidden" when hidden
    - the stock code (SKU, auto-generated like `GB-4C5E6523`)
    - the price and "10 left"
  - Each option has an **Edit** section with:
    - name and price, then **Save**
    - **In stock**, then **Set stock**
    - **Hide** or **Show**
    - **Remove** (danger)
  - **+ Add option** opens a form: option name, price, in stock, and stock code (SKU, optional).
- **Images:**
  - thumbnails, with "Main image" marking the primary one and **Remove** on each
  - an add form: **Image link**, a **Main image** checkbox, and **Add image**
- **Product details:** **Product name**, **Description**, **Status** (Active, Draft, Archived), then **Save**.
- **Delete product** (danger) is a disclosure: opening it shows what deleting does and the real delete button, so the confirmation works without JS.
- Every action shows a "Saved." notice or a specific error.
- This is the densest screen. A designer may split it into sections or tabs, as long as each action still works as a separate form submit.

**Orders `/seller/orders`** [seller-06-orders-empty, seller-06-orders]

- Note: "You're paid only when the buyer confirms delivery."
- "2 orders need you", from the dashboard's count of orders waiting for the seller, when above 0.
- A list showing "#id", the date and time, the total and a status badge. Rows the seller must act on (`paid`, `processing`) are highlighted.
- 20 per page. Empty state: "No orders yet", with a **Share a product** link.
- The design shows the buyer and items on each row, but the orders list doesn't return them yet (a backend change), so rows show the ID, date, total and status.

**Order detail (seller) `/seller/orders/[id]`** [seller-07-order-paid, seller-08-order-processing, seller-09-order-shipped]

- The same header, progress tracker, items, **Deliver to** and shipment sections as the buyer's view.
- An **earnings box**:
  - Items: 2,500.00 ETB
  - Gebeya fee (5%): −125.00 ETB
  - Delivery: 150.00 ETB
  - **You receive: 2,525.00 ETB**
- Actions by status:
  - `paid`: **Accept and prepare** (primary)
  - `processing`: a ship form, then **Mark as shipped** (primary). Fields:
    - **Carrier**, suggestions: Ethio Post, Deliver Addis, Zmall, Self delivery
    - **Tracking number**
    - **Estimated delivery**: a date, today or later
  - `paid` or `processing`: **Cancel and refund buyer** (danger), a disclosure that explains the refund and holds the real button.
  - `disputed`: a warning, "Dispute open: <reason>. The buyer opened a dispute. Gebeya will contact you."
  - `shipped`: waiting for the buyer; nothing to do

**Wallet `/seller/wallet`** [seller-10-wallet-unverified, seller-11-wallet]

- Two figures: **Available to withdraw** and **Held for payouts**.
- **Withdraw money:**
  - if the shop or ID isn't verified, only an info note shows: "Payouts open after verification. We need to verify your shop and your ID first."
  - otherwise a form:
    - **Amount (ETB)**, hint "Minimum 1.00 ETB · up to 1,525.00 ETB"
    - **Send to**: Telebirr, CBE Birr or Bank transfer
    - **Bank or wallet**: the bank and wallet list from Chapa, preselected to match the method
    - **Account or phone number**
    - **Account holder name**
    - **Request payout**
  - on success: "Payout requested. It is sent after review." The form clears, so a second payout is never one tap away.
  - errors: amount above the available balance, invalid account
- **Payouts:** the last 10. Each shows the method and destination ("Telebirr · 0911234567"), the requested date, the amount and a payout status badge. A failure reason is shown in red when failed. Empty: "No payouts yet."
- **Transactions:**
  - each row shows the type (Sale, Payout, Refund, Chargeback), the date, a link to the order ("#3eb05c7c"), and the amount, signed: `+2,525.00 ETB` for credits, `−1,000.00 ETB` for debits
  - 20 per page
  - empty: "No transactions yet."

**Settings `/seller/settings`** [seller-12-settings]

- Fields: **Shop name**, **About your shop**, **Shop phone**, **City**, **Delivery fee (ETB)**, **Free delivery above (ETB, optional)**. Leaving the last one empty removes the threshold.
- **Save**, which shows "Shop settings saved."

## 6. Statuses

**Order status.** Every order is in exactly one of these. The badge tone is a suggestion.

| Status            | English          | Amharic      | Tone    | Meaning                                                                                   |
| ----------------- | ---------------- | ------------ | ------- | ----------------------------------------------------------------------------------------- |
| `pending_payment` | Awaiting payment | ክፍያ በመጠበቅ ላይ | neutral | Order created, buyer hasn't paid. Auto-cancels after 1 hour                               |
| `paid`            | Paid             | ተከፍሏል        | info    | Money held in escrow; seller should accept                                                |
| `processing`      | Preparing        | በዝግጅት ላይ     | info    | Seller accepted and is preparing                                                          |
| `shipped`         | Shipped          | ተልኳል         | info    | Seller shipped; buyer should confirm (auto after 7 days)                                  |
| `delivered`       | Delivered        | ደርሷል         | success | Buyer confirmed; seller credited                                                          |
| `disputed`        | In dispute       | በቅሬታ ላይ      | warning | Buyer reported a problem; money frozen until Gebeya decides (release to seller or refund) |
| `cancelled`       | Cancelled        | ተሰርዟል        | neutral | Cancelled before shipping; any payment refunded                                           |
| `refunded`        | Refunded         | ገንዘቡ ተመልሷል   | neutral | Payment returned to the buyer                                                             |

- **Progress tracker steps:** Paid → Preparing → Shipped → Delivered. For the other statuses, show the badge and the relevant message instead.
- **Who can do what:**
  - buyer cancels: `pending_payment`, `paid`
  - seller cancels: `paid`, `processing`
  - buyer disputes: `processing`, `shipped`
  - buyer confirms: `shipped`

**Payout status**

| Status       | English            | Amharic       | Tone    |
| ------------ | ------------------ | ------------- | ------- |
| `pending`    | Waiting for review | ግምገማ በመጠበቅ ላይ | warning |
| `processing` | Sending            | በመላክ ላይ       | info    |
| `completed`  | Sent               | ተልኳል          | success |
| `failed`     | Failed             | አልተሳካም        | danger  |

**Product status**

| Status     | English  | Amharic | Tone    | Meaning                    |
| ---------- | -------- | ------- | ------- | -------------------------- |
| `active`   | Active   | ንቁ      | success | Buyers can open and buy it |
| `draft`    | Draft    | ረቂቅ     | neutral | Hidden from buyers         |
| `archived` | Archived | በማህደር   | neutral | Hidden; kept for history   |

**Verification:** a shop is either verified (✓ Verified shop) or not. A seller's ID check (KYC) is `pending`, `submitted`, `verified` or `rejected`. Both must be verified for payouts.

## 7. Data reference

Everything the API gives the pages. Money is always integer santim in the API and shown as ETB.

- **Product:** name, slug, description, status, updated date. **Option** (variant): title, SKU, price, compare-at price, active or hidden, available quantity. **Image:** URL, alt text, main or not.
- **Shop:** name, slug, description, city, contact phone, delivery fee, free-delivery threshold, verified.
- **Cart:** items (product name, option title, unit price, quantity, line total), total, reserved-until time.
- **Address:** full name, phone, line 1, line 2, city, sub-city, woreda, default.
- **Order:**
  - ID, created date, status
  - items subtotal, delivery fee, platform fee (5% of items), total
  - note, dispute reason
  - items: product name, option title, quantity, line total
  - shipping address
  - shipment: carrier, tracking number, estimated delivery
- **Seller dashboard:** available, balance, held for payouts, total sales, orders needing action, orders by status, verified.
- **Wallet transaction:** type (`sale_credit`, `payout_debit`, `refund_debit`, `reversal_debit`), amount, date, order.
- **Payout:** amount, method, destination, status, failure reason, requested date.

Realistic sample content for mockups:

- **Shop:** "Tibeb Shop"
- **Products:** "Habesha Kemis" (options Size S, M, L at 2,500.00 ETB; compare-at 3,000.00 ETB), "Netela Scarf", "Jebena Coffee Pot"
- **People:** buyer Abebe Bikila, 0911 234 567, "Bole, near Edna Mall, house 12, Woreda 03, Bole, Addis Ababa"; seller Tigist Bekele
- **Delivery fee:** 150.00 ETB. **Payout:** 1,000.00 ETB to Telebirr.

## 8. Out of scope for the design

- Search, categories, browsing, reviews, wishlists, recommendations.
- Admin screens.
- Chapa's payment page (third-party).
- Image upload: images are added as links today. A design may include an upload control, but mark it as future work.
- Notifications, chat between buyer and seller.

## 9. Components to design

Every screen is built from these. Each needs light and dark versions, and must fit Amharic text.

- **Buttons:**
  - variants: primary, secondary, danger, link
  - sizes: regular and small
  - full-width on phones
  - states: busy or disabled while a form submits
- **Field:** label, input (text, tel, number, money, date, select, textarea, checkbox, radio card), hint, error.
- **Alert:** info, success, warning, error. **Form message:** an alert above a form for its result.
- **Status badge:** one style per tone (neutral, info, success, warning, danger).
- **Order progress:** four steps, with the current step marked.
- **Money row / summary list:** label and amount pairs, plus a total row.
- **Card / section:** with a heading.
- **List row:** a tappable row linking to a detail page (orders, products), and a highlighted "needs action" variant.
- **Copy link:** a read-only URL with a **Copy link** / **Copied** button. This is the seller's most-used action.
- **Option picker:** radio chips with price, plus a disabled (out of stock) state.
- **Quantity input.**
- **Address card:** a selectable radio card.
- **Product tile:** image, name, price, out-of-stock state.
- **Stat tile:** label and big amount, plus a highlighted variant.
- **Pagination:** previous, "Page 2 of 5", next.
- **Empty state.**
- **Trust / protection block.**
- **Header** with the language switch, the **seller tabs** (or bottom nav), and the **footer**.
- **Payment result:** success, failure and waiting states with an icon.

## 10. What to hand back

1. **Design tokens:** color (light and dark, including the status tones), type scale (Latin and Ethiopic), spacing, radius, shadows.
2. **Component specs** for section 9, including all states.
3. **Every screen in section 5** at 360 px, and at desktop width. Show Amharic for checkout, order detail (buyer and seller), wallet and product editor.
4. Notes on any change in flow or grouping, so the implementation keeps every action reachable.
