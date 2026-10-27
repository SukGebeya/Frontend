import { defineConfig, devices } from '@playwright/test';

// The money-flow test needs the Gebeya API on :8080 in development mode
// (CHAPA_MODE=mock, SMS_PROVIDER=log, OTP_DEV_CODE=123456, PAYOUT_RECHECK_INTERVAL=10s). See README.md.
export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	timeout: 120_000,
	expect: { timeout: 15_000 },
	fullyParallel: false,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:3000',
		// Set PLAYWRIGHT_CHANNEL=chrome to use an installed Chrome instead of downloading Chromium.
		channel: process.env.PLAYWRIGHT_CHANNEL,
		...devices['Pixel 7'],
		trace: 'retain-on-failure'
	},
	webServer: {
		// Port 3000 matches the API's CHAPA_RETURN_URL, where the mock Chapa checkout returns.
		command: 'npm run build && npx vite preview --port 3000 --strictPort',
		port: 3000,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
