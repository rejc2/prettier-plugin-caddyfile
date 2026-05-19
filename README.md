# @rejc2/prettier-plugin-caddyfile

A [Prettier](https://prettier.io) plugin that formats [Caddyfiles](https://caddyserver.com/docs/caddyfile) using Caddy's own formatter, compiled to WebAssembly.

## Why

Caddy ships a canonical formatter as part of `caddy fmt`. Rather than reimplementing it in JavaScript and drifting from upstream, this plugin wraps Caddy's Go formatter as a `.wasm` module (built with TinyGo) and calls it from Prettier. The output matches `caddy fmt` byte-for-byte.

## Install

```sh
npm install --save-dev prettier @rejc2/prettier-plugin-caddyfile
# or
yarn add --dev prettier @rejc2/prettier-plugin-caddyfile
```

## Usage

Register the plugin in your Prettier config:

```json
{
	"plugins": ["@rejc2/prettier-plugin-caddyfile"]
}
```

Then run Prettier as usual:

```sh
prettier --write Caddyfile
prettier --write '**/*.caddyfile'
```

The plugin activates for files named `Caddyfile` and files with the `.caddyfile` extension.

## Development

```sh
yarn install
yarn build       # build WASM (tinygo) + bundle TypeScript (rollup)
yarn test        # vitest
yarn typecheck
yarn lint
```

Building the WASM module requires [TinyGo](https://tinygo.org/). Production builds additionally run `wasm-opt` (`yarn build:prod`).

## License

MIT
