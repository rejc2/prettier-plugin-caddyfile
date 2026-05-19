import { format } from 'prettier';
import { describe, expect, it } from 'vitest';

import * as caddyfilePlugin from './index';

async function formatCaddyfile(input: string): Promise<string> {
	return await format(input, {
		filepath: 'Caddyfile',
		plugins: [caddyfilePlugin],
	});
}

// Test cases ported from:
// https://github.com/caddyserver/caddy/blob/8e2dd50/caddyconfig/caddyfile/formatter_test.go
const cases: { description: string; input: string; expect: string }[] = [
	{
		description: 'very simple',
		input: `abc   def
	g hi jkl
mn`,
		expect: `abc def
g hi jkl
mn`,
	},
	{
		description: 'basic indentation, line breaks, and nesting',
		input: `  a
b

	c {
		d
}

e { f
}



g {
h {
i
}
}

j { k {
l
}
}

m {
	n { o
	}
	p { q r
s }
}

	{
{ t
		u

	v

w
}
}`,
		expect: `a
b

c {
	d
}

e {
	f
}

g {
	h {
		i
	}
}

j {
	k {
		l
	}
}

m {
	n {
		o
	}
	p {
		q r
		s
	}
}

{
	{
		t
		u

		v

		w
	}
}`,
	},
	{
		description: 'block spacing',
		input: `a{
	b
}

c{ d
}`,
		expect: `a {
	b
}

c {
	d
}`,
	},
	{
		description: 'advanced spacing',
		input: `abc {
	def
}ghi{
	jkl mno
pqr}`,
		expect: `abc {
	def
}

ghi {
	jkl mno
	pqr
}`,
	},
	{
		description: 'env var placeholders',
		input: `{$A}

b {
{$C}
}

d { {$E}
}

{ {$F}
}
`,
		expect: `{$A}

b {
	{$C}
}

d {
	{$E}
}

{
	{$F}
}`,
	},
	{
		description: 'env var placeholders with port',
		input: `:{$PORT}`,
		expect: `:{$PORT}`,
	},
	{
		description: 'comments',
		input: `#a "\\n"

 #b {
	c
}

d {
e#f
# g
}

h { # i
}`,
		expect: `#a "\\n"

#b {
c
}

d {
	e#f
	# g
}

h {
	# i
}`,
	},
	{
		description: 'quotes and escaping',
		input: `"a \\"b\\" "#c
	d

e {
"f"
}

g { "h"
}

i {
	"foo
bar"
}

j {
"\\"k\\" l m"
}`,
		expect: `"a \\"b\\" "#c
d

e {
	"f"
}

g {
	"h"
}

i {
	"foo
bar"
}

j {
	"\\"k\\" l m"
}`,
	},
	{
		description: 'bad nesting (too many open)',
		input: `a
{
	{
}`,
		expect: `a {
	{
	}
`,
	},
	{
		description: 'bad nesting (too many close)',
		input: `a
{
	{
}}}`,
		expect: `a {
	{
	}
}
}
`,
	},
	{
		description: 'json',
		input: `foo
bar      "{\\"key\\":34}"
`,
		expect: `foo
bar "{\\"key\\":34}"`,
	},
	{
		description: 'escaping after spaces',
		input: `foo \\"literal\\"`,
		expect: `foo \\"literal\\"`,
	},
	{
		description: 'simple placeholders as standalone tokens',
		input: `foo {bar}`,
		expect: `foo {bar}`,
	},
	{
		description: 'simple placeholders within tokens',
		input: `foo{bar} foo{bar}baz`,
		expect: `foo{bar} foo{bar}baz`,
	},
	{
		description: 'placeholders and malformed braces',
		input: `foo{bar} foo{ bar}baz`,
		expect: `foo{bar} foo {
	bar
}

baz`,
	},
	{
		description: 'hash within string is not a comment',
		input: `redir / /some/#/path`,
		expect: `redir / /some/#/path`,
	},
	{
		description: 'brace does not fold into comment above',
		input: `# comment
{
	foo
}`,
		expect: `# comment
{
	foo
}`,
	},
	{
		description: 'matthewpi/vscode-caddyfile-support#13',
		input: `{
	email {$ACMEEMAIL}
	#debug
}

block {
}
`,
		expect: `{
	email {$ACMEEMAIL}
	#debug
}

block {
}
`,
	},
	{
		description: 'matthewpi/vscode-caddyfile-support#13 - bad formatting',
		input: `{
	email {$ACMEEMAIL}
	#debug
	}

	block {
	}
`,
		expect: `{
	email {$ACMEEMAIL}
	#debug
}

block {
}
`,
	},
	{
		description: 'keep heredoc as-is',
		input: `block {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
}
`,
		expect: `block {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
}
`,
	},
	{
		description: 'Mixing heredoc with regular part',
		input: `block {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
	respond "More than one space will be eaten"     200
}

block2 {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
	respond "More than one space will be eaten" 200
}
`,
		expect: `block {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
	respond "More than one space will be eaten" 200
}

block2 {
	heredoc <<HEREDOC
	Here's more than one space       Here's more than one space
	HEREDOC
	respond "More than one space will be eaten" 200
}
`,
	},
	{
		description: 'Heredoc as regular token',
		input: `block {
	heredoc <<HEREDOC                                 "More than one space will be eaten"
}
`,
		expect: `block {
	heredoc <<HEREDOC "More than one space will be eaten"
}
`,
	},
	{
		description: 'Escape heredoc',
		input: `block {
	heredoc \\<<HEREDOC
	respond "More than one space will be eaten"                           200
}
`,
		expect: `block {
	heredoc \\<<HEREDOC
	respond "More than one space will be eaten" 200
}
`,
	},
	{
		description: 'Preserve braces wrapped by backquotes',
		input: 'block {respond `All braces should remain: {{now | date "2006"}}`}',
		expect: 'block {respond `All braces should remain: {{now | date "2006"}}`}',
	},
	{
		description: 'Preserve braces wrapped by quotes',
		input: 'block {respond "All braces should remain: {{now | date `2006`}}"}',
		expect: 'block {respond "All braces should remain: {{now | date `2006`}}"}',
	},
	{
		description: 'Preserve quoted backticks and backticked quotes',
		input: 'block { respond "`" } block { respond `"`}',
		expect: 'block {\n\trespond "`"\n}\n\nblock {\n\trespond `"`\n}',
	},
	{
		description: 'No trailing space on line before env variable',
		input: `{
	a

	{$ENV_VAR}
}
`,
		expect: `{
	a

	{$ENV_VAR}
}
`,
	},
	{
		description: 'issue #7425: multiline backticked string indentation',
		input: 'https://localhost:8953 {\n    respond `Here are some random numbers:\n\n{{randNumeric 16}}\n\nHope this helps.`\n}',
		expect:
			'https://localhost:8953 {\n\trespond `Here are some random numbers:\n\n{{randNumeric 16}}\n\nHope this helps.`\n}',
	},
	{
		description: 'imports before global options block keep standalone brace',
		input: `import ./conf.d/matcher_my_subnet.caddy
import ./conf.d/matcher_not_my_subnet.caddy
{
	order crowdsec first
	order appsec after crowdsec
}`,
		expect: `import ./conf.d/matcher_my_subnet.caddy
import ./conf.d/matcher_not_my_subnet.caddy
{
	order crowdsec first
	order appsec after crowdsec
}`,
	},
];

describe('prettier-plugin-caddyfile', () => {
	it.each(cases)('$description', async ({ input, expect: expected }) => {
		// The formatter always emits a trailing newline.
		const expectedWithNewline = expected.endsWith('\n') ? expected : expected + '\n';
		const actual = await formatCaddyfile(input);
		expect(actual).toBe(expectedWithNewline);
	});
});
