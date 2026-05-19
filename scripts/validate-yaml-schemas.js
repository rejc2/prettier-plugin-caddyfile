#!/usr/bin/env node
// Validates all YAML files that carry a yaml-language-server $schema annotation.
// Usage: node scripts/validate-yaml-schemas.js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IGNORE_DIRS = new Set(['.git', '.sl', '.yarn', 'node_modules']);

function* findYamlFiles(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!IGNORE_DIRS.has(entry.name)) yield* findYamlFiles(join(dir, entry.name));
		} else if (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')) {
			yield join(dir, entry.name);
		}
	}
}

const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
addFormats(ajv);

const schemaCache = new Map();

async function fetchSchema(url) {
	if (schemaCache.has(url)) return schemaCache.get(url);
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`);
	const schema = await res.json();
	schemaCache.set(url, schema);
	return schema;
}

let validated = 0;
let skipped = 0;
let failed = 0;

for (const filePath of [...findYamlFiles(ROOT)].sort()) {
	const rel = relative(ROOT, filePath);
	const content = readFileSync(filePath, 'utf8');

	const match = content.match(/^# yaml-language-server: \$schema=(.+)$/m);
	if (!match) {
		process.stdout.write(`skip  ${rel}\n`);
		skipped++;
		continue;
	}

	const schemaUrl = match[1].trim();
	process.stdout.write(`check ${rel} ... `);

	try {
		const schema = await fetchSchema(schemaUrl);
		const data = parseYaml(content);
		const validate = ajv.compile(schema);

		if (validate(data)) {
			process.stdout.write('ok\n');
			validated++;
		} else {
			process.stdout.write('FAIL\n');
			for (const { instancePath, message } of validate.errors ?? []) {
				process.stderr.write(`  ${instancePath || '(root)'}: ${message}\n`);
			}
			failed++;
		}
	} catch (err) {
		process.stdout.write('ERROR\n');
		process.stderr.write(`  ${err.message}\n`);
		failed++;
	}
}

process.stdout.write(`\n${validated} validated, ${skipped} skipped, ${failed} failed\n`);
if (failed > 0) process.exit(1);
