import fs from 'node:fs/promises';
import path from 'node:path';

// In bundled output the ternary is folded by rollup: process.env.VITEST is
// replaced with `false`, leaving only the dist-relative path.
const wasmPath = process.env.VITEST
	? path.join(import.meta.dirname, '../dist/caddyfmt.wasm')
	: path.join(import.meta.dirname, 'caddyfmt.wasm');

let getFormatModulePromise: null | Promise<WebAssembly.Module> = null;

async function getFormatModule(): Promise<WebAssembly.Module> {
	getFormatModulePromise ??= (async () => {
		const fileContent = await fs.readFile(wasmPath);
		return await WebAssembly.compile(fileContent);
	})();

	return await getFormatModulePromise;
}

type Ptr = number;

type FormatCaddyfileExports = {
	memory: WebAssembly.Memory;
	alloc: (size: number) => Ptr;
	formatCaddyfile: (ptr: Ptr, length: number) => Ptr;
	outputLen: (ptr: Ptr) => number;
	free: (ptr: Ptr) => void;
};

export async function formatCaddyfile(text: string): Promise<string> {
	const formatModule = await getFormatModule();

	let memory: WebAssembly.Memory;

	const importsObject: WebAssembly.Imports = {
		env: {
			log: (ptr: number, len: number) => {
				const mem = new Uint8Array(memory.buffer);
				console.error(new TextDecoder().decode(mem.slice(ptr, ptr + len)));
			},
		},
	};

	const instance = await WebAssembly.instantiate(formatModule, importsObject);
	const exports = instance.exports as FormatCaddyfileExports;
	({ memory } = exports);

	// TinyGo's leaking allocator on wasm-unknown returns offset 0 for the
	// first allocation, which Go's *byte semantics treat as nil. Burn one
	// alloc per instance to push the heap past offset 0.
	exports.alloc(1);

	const inputBytes = new TextEncoder().encode(text);
	const inputPtr = exports.alloc(inputBytes.length);
	{
		const mem = new Uint8Array(exports.memory.buffer);
		mem.set(inputBytes, inputPtr);
	}

	const outputPtr = exports.formatCaddyfile(inputPtr, inputBytes.length);
	const outputLength = exports.outputLen(outputPtr);

	let outputBytes: Uint8Array;
	{
		const mem = new Uint8Array(exports.memory.buffer);
		outputBytes = mem.slice(outputPtr, outputPtr + outputLength);
	}

	return new TextDecoder().decode(outputBytes);
}
