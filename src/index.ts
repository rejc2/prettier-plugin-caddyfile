import type { AstPath, Parser, Printer, SupportLanguage } from 'prettier';

import { formatCaddyfile } from './formatCaddyfile';

type CaddyfileNode = {
	type: 'caddyfile-root';
	formatted: string;
	originalLength: number;
};

export const languages: SupportLanguage[] = [
	{
		name: 'Caddyfile',
		parsers: ['caddyfile'],
		extensions: ['.caddyfile'],
		filenames: ['Caddyfile'],
		vscodeLanguageIds: ['caddyfile'],
	},
];

export const parsers: Record<string, Parser<CaddyfileNode>> = {
	caddyfile: {
		parse: async (text) => ({
			type: 'caddyfile-root',
			formatted: await formatCaddyfile(text),
			originalLength: text.length,
		}),
		astFormat: 'caddyfile-ast',
		locStart: () => 0,
		locEnd: (node) => node.originalLength,
	},
};

export const printers: Record<string, Printer<CaddyfileNode>> = {
	'caddyfile-ast': {
		print: (path: AstPath<CaddyfileNode>) => path.node.formatted,
	},
};
