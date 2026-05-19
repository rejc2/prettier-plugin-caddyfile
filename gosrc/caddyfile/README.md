# gosrc/caddyfile

The file formatter.go is copied from:
* https://github.com/caddyserver/caddy/tree/v2.11.3/caddyconfig/caddyfile/formatter.go

The regex in heredoc.go is extracted from:
* https://github.com/caddyserver/caddy/blob/v2.11.3/caddyconfig/caddyfile/lexer.go

The original regex has been re-implemented as a normal function, in order to avoid pulling in the whole Regexp dependency.
