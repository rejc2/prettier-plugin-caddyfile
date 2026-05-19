package main

import (
	"unsafe"

	"caddyformatter/caddyfile"
)

//go:wasmimport env log
func hostLog(ptr *byte, length uint32)

func logStr(s string) {
	b := []byte(s)
	if len(b) == 0 {
		return
	}
	hostLog(&b[0], uint32(len(b)))
}

// Outputs are keyed by their pointer so each call gets an independent
// entry. JS reads ptr + length, then calls free to release.
var outputs = map[uintptr][]byte{}

//export alloc
func alloc(size uint32) *byte {
	buf := make([]byte, size)
	return &buf[0]
}

//export formatCaddyfile
func formatCaddyfile(ptr *byte, length uint32) *byte {
	input := unsafe.Slice(ptr, length)
	output := caddyfile.Format(input)
	if len(output) == 0 {
		return nil
	}
	outPtr := &output[0]
	outputs[uintptr(unsafe.Pointer(outPtr))] = output
	return outPtr
}

//export outputLen
func outputLen(ptr *byte) uint32 {
	return uint32(len(outputs[uintptr(unsafe.Pointer(ptr))]))
}

//export free
func free(ptr *byte) {
	delete(outputs, uintptr(unsafe.Pointer(ptr)))
}

func main() {}
