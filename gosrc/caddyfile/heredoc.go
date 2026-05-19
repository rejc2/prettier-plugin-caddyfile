package caddyfile

// Avoid importing whole regexp package by recreating this regex below:
// var heredocMarkerRegexp = regexp.MustCompile("^[A-Za-z0-9_-]+$")

var heredocMarkerRegexp heredocMarkerMatcher

type heredocMarkerMatcher struct{}

func (heredocMarkerMatcher) MatchString(s string) bool {
	if len(s) == 0 {
		return false
	}
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch {
		case c >= 'A' && c <= 'Z':
		case c >= 'a' && c <= 'z':
		case c >= '0' && c <= '9':
		case c == '_' || c == '-':
		default:
			return false
		}
	}
	return true
}
