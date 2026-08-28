# Perseus Vault Sourcey adoption report

- **Public documentation:** https://perseus.observer/vault/mcp-reference/
- **Upstream adoption:** https://github.com/Perseus-Computing-LLC/perseus-vault/pull/1160
- **Pinned live source:** `9c829207a4b44a8e679ba912b4c1c5608c8f1e36`; adoption PR merge commit: `f48e528f89dfb8ce8c19c4a0714808a9d1fb728c`.
- **Generator:** Sourcey 3.6.5 using the live MCP stdio surface through mcp-parser 0.4.1.
- **Reproduction:** build Perseus Vault with `--no-default-features`, capture the live MCP snapshot, then run `pnpm --dir sourcey-docs generate` as documented in the pinned `sourcey-docs/README.md`.
- **Coverage:** 173 unique tools are present in both the canonical raw snapshot and the rendering derivative.
- **Integrity:** the current canonical raw snapshot SHA-256 is `fbd5680d8315d1c63adaa8ff6e967f0cb1b5ea0dd9bc8a6d69569999545ac9b1`; the audit receipt is Ed25519-signed by hosted identity `ja1claudio-frantic-20260828`.
- **Durability:** generation runs on relevant main changes, releases, tags and manual dispatch; the published URL is owned by the Perseus project.
- **Validation:** every upstream CI job passed, including Windows, macOS, Linux, Clippy, CodeQL, security audit and the Sourcey generation workflow.
- **Rendering:** the complete 173-tool page was checked at a 390×844 mobile viewport with no document-level horizontal overflow or console errors.
- **Inspect first:** open the public documentation, then compare `metadata.json` and `mcp.raw.json` at the same project-owned path with the pinned upstream PR.
- **Limitations:** none known at delivery time.
