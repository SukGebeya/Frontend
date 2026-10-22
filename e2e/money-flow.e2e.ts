import { execFileSync } from 'node:child_process';
import { expect, test, type Browser, type Page } from '@playwright/test';

// Walks the same money flow as the API's scripts/e2e-money-flow.sh, through the UI:
// a seller opens a shop and lists a product, a buyer pays through the shared link,
// the seller ships, the buyer confirms, and the seller's wallet is credited.

const API = process.env.API_URL ?? 'http://localhost:8080/api/v1';
const OTP = process.env.OTP_DEV_CODE ?? '123456';
const PG_CONTAINER = process.env.PG_CONTAINER ?? 'sukgebeya-postgres-dev';
const PASSWORD = 'Password123!';
const run = Date.now().toString(36);

// Set SCREENSHOT_DIR to save every screen in English and Amharic (docs/design uses these).
// Extra page visits that exist only for screenshots are skipped otherwise.
const SHOTS = process.env.SCREENSHOT_DIR;

async function setLang(page: Page, lang: 'en' | 'am') {
	await page
		.context()
		.addCookies([{ name: 'gb_lang', value: lang, domain: 'localhost', path: '/' }]);
}

async function shot(page: Page, name: string, { amharic = true } = {}) {
	if (!SHOTS) return;
	const save = async (lang: string) => {
		// A sticky header lands mid-page in full-page shots taken while scrolled.
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.screenshot({ path: `${SHOTS}/${name}.${lang}.png`, fullPage: true, scale: 'css' });
	};
	await save('en');
	if (!amharic) return;
	await setLang(page, 'am');
	await page.reload();
	await save('am');
	await setLang(page, 'en');
	await page.reload();
}

const randomPhone = () => `09${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;

async function signUp(page: Page, phone: string, shots = false) {
	await page.getByLabel('Phone number').fill(phone);
	await page.getByLabel('Password').fill(PASSWORD);
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByRole('heading', { name: 'Verify your phone' })).toBeVisible();
	if (shots) await shot(page, 'auth-03-verify-phone');
	await page.getByLabel('Code').fill(OTP);
	await page.getByRole('button', { name: 'Verify', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Verify your phone' })).toBeHidden();
}

async function newPage(browser: Browser) {
	const context = await browser.newContext();
	return context.newPage();
}

async function api<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init.token ? { Authorization: `Bearer ${init.token}` } : {})
		}
	});
	if (!res.ok)
		throw new Error(`${init.method ?? 'GET'} ${path}: ${res.status} ${await res.text()}`);
	return (res.status === 204 ? undefined : await res.json()) as T;
}

const login = (identifier: string) =>
	api<{ token: { access_token: string }; user: { id: string } }>('/login', {
		method: 'POST',
		body: JSON.stringify({ identifier, password: PASSWORD })
	});

test('seller lists a product, buyer pays through the link, seller is paid', async ({ browser }) => {
	const sellerPhone = randomPhone();
	const buyerPhone = randomPhone();
	const seller = await newPage(browser);
	const buyer = await newPage(browser);

	if (SHOTS) {
		await test.step('screens anyone can see', async () => {
			const visitor = await newPage(browser);
			await visitor.goto('/');
			await shot(visitor, 'public-01-home');
			await visitor.goto('/reset-password');
			await shot(visitor, 'auth-04-reset-password');
			await visitor.goto('/p/no-such-product');
			await shot(visitor, 'public-02-not-found');
			await visitor.context().close();
		});
	}

	await test.step('seller signs up and opens a shop', async () => {
		await seller.goto('/register?next=/seller');
		await shot(seller, 'auth-02-register');
		await signUp(seller, sellerPhone, true);
		await expect(seller).toHaveURL(/\/seller\/onboard$/);
		await shot(seller, 'seller-01-onboard');
		await seller.getByLabel('Shop name').fill(`Tibeb Shop ${run}`);
		await seller.getByLabel('Delivery fee (ETB)').fill('150');
		await seller.getByRole('button', { name: 'Open shop' }).click();
		await expect(seller.getByText('Your shop is not verified yet')).toBeVisible();
		await shot(seller, 'seller-02-dashboard-new');
	});

	let productLink = '';
	await test.step('seller lists a product and copies its link', async () => {
		await seller.getByRole('link', { name: 'Products' }).click();
		await seller.getByRole('link', { name: '+ New product' }).click();
		await shot(seller, 'seller-04-product-new');
		await seller.getByLabel('Product name').fill(`Habesha Kemis ${run}`);
		await seller.getByLabel('Price (ETB)').fill('2,500');
		await seller.getByLabel('In stock').fill('10');
		await seller.getByLabel('Option name').fill('Size M');
		await seller.getByLabel('Image link (https)').fill('https://cdn.example.com/kemis.jpg');
		await seller.getByRole('button', { name: 'Create product' }).click();
		await expect(seller.getByText('Share this link in your posts and chats:')).toBeVisible();
		productLink = await seller.getByRole('textbox', { name: 'Copy link' }).inputValue();
		expect(productLink).toMatch(/\/p\/[a-z0-9-]+$/);
		await shot(seller, 'seller-05-product-edit');
		if (SHOTS) {
			await seller.goto('/seller/products');
			await shot(seller, 'seller-03-products');
			await seller.goto('/seller/orders');
			await shot(seller, 'seller-06-orders-empty');
			await seller.goto('/seller/wallet');
			await shot(seller, 'seller-10-wallet-unverified');
			await seller.goto('/seller/settings');
			await shot(seller, 'seller-12-settings');
		}
	});

	let orderUrl = '';
	await test.step('buyer opens the link, signs up and pays', async () => {
		await buyer.goto(productLink);
		await expect(buyer.getByRole('heading', { name: `Habesha Kemis ${run}` })).toBeVisible();
		await expect(buyer.getByText('2,500.00 ETB').first()).toBeVisible();
		await expect(buyer.getByText('150.00 ETB')).toBeVisible();
		await shot(buyer, 'buyer-01-product-link');
		if (SHOTS) {
			await buyer.getByRole('link', { name: `Tibeb Shop ${run}` }).click();
			await shot(buyer, 'buyer-02-shop');
			await buyer.goto(productLink);
			await buyer.getByRole('button', { name: 'Add to cart' }).click();
			await expect(buyer.getByText('Added to your cart.')).toBeVisible();
			await buyer.goto('/cart');
			await shot(buyer, 'buyer-03-cart');
			await buyer.goto(productLink);
		}
		await buyer.getByRole('button', { name: 'Buy now' }).click();

		// Checkout needs an account; the guest cart follows the buyer through sign-up.
		await expect(buyer).toHaveURL(/\/login\?next=%2Fcheckout/);
		await shot(buyer, 'auth-01-login');
		await buyer.getByRole('link', { name: 'Create account' }).click();
		await signUp(buyer, buyerPhone);
		await expect(buyer).toHaveURL(/\/checkout$/);
		await expect(buyer.getByText(`Habesha Kemis ${run} · Size M × 1`)).toBeVisible();
		await shot(buyer, 'buyer-04-checkout-new-address');

		await buyer.getByLabel('Full name').fill('Abebe Bikila');
		await buyer.getByLabel('Address', { exact: true }).fill('Bole, near Edna Mall, house 12');
		await buyer.getByLabel('Sub-city').fill('Bole');
		await buyer.getByLabel('Woreda').fill('03');
		await buyer.getByRole('button', { name: 'Save address' }).click();
		await expect(buyer.getByRole('radio', { name: /Abebe Bikila/ })).toBeChecked();
		await shot(buyer, 'buyer-05-checkout');

		await buyer.getByRole('button', { name: 'Continue to payment' }).click();
		// The mock Chapa sends the buyer straight back to the return URL.
		await expect(buyer.getByRole('heading', { name: 'Payment received' })).toBeVisible();
		// The return page reads the order from a cookie it then clears, so the Amharic shot needs ?order=.
		await shot(buyer, 'buyer-06-payment-complete', { amharic: false });
		await buyer.getByRole('link', { name: 'View order' }).click();
		await expect(buyer.getByText('Paid', { exact: true }).first()).toBeVisible();
		await expect(buyer.getByText('2,650.00 ETB')).toBeVisible();
		orderUrl = buyer.url();
		await shot(buyer, 'buyer-07-order-paid');
		if (SHOTS) {
			await buyer.goto(`/payment/complete?order=${orderUrl.split('/').pop()}`);
			await shot(buyer, 'buyer-06-payment-complete');
			await buyer.goto('/orders');
			await shot(buyer, 'buyer-11-orders');
			await buyer.goto(orderUrl);
		}
	});

	await test.step('seller sees the address, accepts and ships', async () => {
		const orderId = orderUrl.split('/').pop()!;
		await seller.goto(`/seller/orders/${orderId}`);
		await expect(seller.getByText('Abebe Bikila')).toBeVisible();
		await expect(seller.getByText(/Bole, near Edna Mall/)).toBeVisible();
		await expect(seller.getByText('2,525.00 ETB')).toBeVisible(); // 2,500 − 125 fee + 150 delivery
		await shot(seller, 'seller-07-order-paid');
		await seller.getByRole('button', { name: 'Accept and prepare' }).click();
		await expect(seller.getByLabel('Carrier')).toBeVisible();
		await shot(seller, 'seller-08-order-processing');
		await seller.getByLabel('Carrier').fill('Ethio Post');
		await seller.getByRole('button', { name: 'Mark as shipped' }).click();
		await expect(seller.getByText('Shipped', { exact: true }).first()).toBeVisible();
		await shot(seller, 'seller-09-order-shipped');
		if (SHOTS) {
			await seller.goto('/seller/orders');
			await shot(seller, 'seller-06-orders');
		}
	});

	await test.step('buyer confirms delivery', async () => {
		await buyer.reload();
		await shot(buyer, 'buyer-08-order-shipped');
		if (SHOTS) {
			// The dispute form opens client-side, so retry until the page has hydrated.
			await expect(async () => {
				await buyer.getByRole('button', { name: 'Report a problem' }).click();
				await expect(buyer.getByLabel('What went wrong?')).toBeVisible({ timeout: 1000 });
			}).toPass();
			await shot(buyer, 'buyer-09-order-dispute-form', { amharic: false });
			await buyer.reload();
		}
		await buyer.getByRole('button', { name: 'I received my order' }).click();
		await expect(buyer.getByText('Delivered', { exact: true }).first()).toBeVisible();
		await shot(buyer, 'buyer-10-order-delivered');
	});

	await test.step('settlement credits the seller wallet', async () => {
		await seller.goto('/seller/wallet');
		await expect(async () => {
			await seller.reload();
			await expect(seller.getByText('+2,525.00 ETB')).toBeVisible({ timeout: 1000 });
		}).toPass({ timeout: 30_000 });
	});

	await test.step('verified seller requests a payout', async () => {
		// KYC and shop verification are admin actions, done through the API as in the backend script.
		const adminPhone = randomPhone();
		await api('/register', {
			method: 'POST',
			body: JSON.stringify({ phone: adminPhone, password: PASSWORD })
		});
		execFileSync('docker', [
			'exec',
			PG_CONTAINER,
			'psql',
			'-U',
			'postgres',
			'-d',
			'app',
			'-qc',
			`UPDATE users SET role='admin' WHERE phone='+251${adminPhone.slice(1)}'`
		]);
		const admin = (await login(adminPhone)).token.access_token;
		const sellerLogin = await login(sellerPhone);
		const profile = await api<{ id: string }>('/merchant/profile', {
			token: sellerLogin.token.access_token
		});
		await api(`/admin/users/${sellerLogin.user.id}/kyc`, {
			method: 'PUT',
			token: admin,
			body: JSON.stringify({ kyc_status: 'verified' })
		});
		await api(`/admin/merchants/${profile.id}/verify`, {
			method: 'PUT',
			token: admin,
			body: JSON.stringify({ is_verified: true })
		});

		await seller.reload();
		await seller.getByLabel('Amount (ETB)').fill('1000');
		await expect(seller.getByLabel('Bank or wallet')).toHaveValue('855'); // telebirr preselected
		await seller.getByLabel('Account or phone number').fill('0911234567');
		await seller.getByLabel('Account holder name').fill('Tigist Bekele');
		await seller.getByRole('button', { name: 'Request payout' }).click();
		await expect(seller.getByText('Payout requested.')).toBeVisible();
		await expect(seller.getByText('Waiting for review')).toBeVisible();
		await expect(seller.getByText('1,525.00 ETB').first()).toBeVisible(); // available after the hold
		await shot(seller, 'seller-11-wallet');
		if (SHOTS) {
			await seller.goto('/seller');
			await shot(seller, 'seller-02-dashboard');
			await seller.goto('/seller/wallet');
		}
		// The language switch.
		await seller.getByRole('button', { name: 'አማርኛ' }).click();
		await expect(seller.getByRole('heading', { name: 'ቦርሳ' })).toBeVisible();
		await buyer.goto(productLink);
		await buyer.getByRole('button', { name: 'አማርኛ' }).click();
		await expect(buyer.getByRole('button', { name: 'አሁን ግዛ' })).toBeVisible();
	});
});
