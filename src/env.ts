import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		description: 'Base URL of the Gebeya API, including /api/v1',
		schema: (value) => (value || 'http://localhost:8080/api/v1').replace(/\/+$/, '')
	}
});
