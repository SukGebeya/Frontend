// Converts the backend's Swagger 2.0 file to OpenAPI 3 and marks response fields as required.
// swag leaves every property optional, so the Go structs are read to find which fields are
// `omitempty` (and may be missing); every other field of a *Response DTO is always sent.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import converter from 'swagger2openapi';

const backend = resolve(process.env.BACKEND_DIR ?? '../Backend');
const out = resolve('.svelte-kit/openapi.json');

const goDirs = ['internal/http/handler', 'pkg/response'];

/** @returns {Map<string, { fields: Set<string>, omitempty: Set<string>, embeds: string[] }>} */
function readGoStructs() {
	const structs = new Map();
	for (const dir of goDirs) {
		for (const file of readdirSync(join(backend, dir))) {
			if (!file.endsWith('.go') || file.endsWith('_test.go')) continue;
			const src = readFileSync(join(backend, dir, file), 'utf8');
			for (const m of src.matchAll(/^type (\w+) struct \{\n([\s\S]*?)^\}/gm)) {
				const info = { fields: new Set(), omitempty: new Set(), embeds: [] };
				for (const line of m[2].split('\n')) {
					const tag = line.match(/json:"([^",]+)(,[^"]*)?"/);
					if (tag) {
						info.fields.add(tag[1]);
						if (tag[2]?.includes('omitempty')) info.omitempty.add(tag[1]);
					} else {
						const embed = line.trim().match(/^(\w+)$/);
						if (embed) info.embeds.push(embed[1]);
					}
				}
				structs.set(m[1], info);
			}
		}
	}
	return structs;
}

function optionalFields(structs, name, seen = new Set()) {
	const info = structs.get(name);
	if (!info || seen.has(name)) return new Set();
	seen.add(name);
	const result = new Set(info.omitempty);
	for (const e of info.embeds) for (const f of optionalFields(structs, e, seen)) result.add(f);
	return result;
}

const swagger = JSON.parse(readFileSync(join(backend, 'docs/swagger.json'), 'utf8'));
const { openapi } = await converter.convertObj(swagger, { patch: true, warnOnly: true });

const structs = readGoStructs();
let marked = 0;
for (const [key, schema] of Object.entries(openapi.components?.schemas ?? {})) {
	const name = key.split('.').pop();
	if (!name.endsWith('Response') || !structs.has(name) || !schema.properties) continue;
	const optional = optionalFields(structs, name);
	schema.required = Object.keys(schema.properties).filter((p) => !optional.has(p));
	marked++;
}

mkdirSync(resolve('.svelte-kit'), { recursive: true });
writeFileSync(out, JSON.stringify(openapi, null, 2));
console.log(`openapi.json written; required fields set on ${marked} response schemas`);
