---
name: Go package callback limitation
description: Go dependency updates when the package installation callback is unavailable
---

The package installation callback rejected `language: "go"` with `no such language: go` in this workspace, despite listing it as supported.

**Why:** Existing Go dependencies still needed a security update to pass Replit's package firewall; the callback could not perform it.

**How to apply:** Check the callback first. If it still rejects Go, use the installed Go toolchain's module commands for dependency changes, and use the programming-language installer if a newer toolchain is required.