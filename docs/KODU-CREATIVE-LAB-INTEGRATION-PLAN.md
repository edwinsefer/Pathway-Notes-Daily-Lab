# KODU Module — Creative Laboratory Integration Plan

## Purpose
Add a clearly discoverable KODU — Christian Reader Lab entry point inside Pathway Notes Daily — Creative Laboratory, because the user wants KODU available from this workspace. KODU remains its own product/module; Creative Laboratory provides the host navigation and a safe access point.

## User-approved direction
- KODU should be available from within Creative Laboratory.
- Keep the work inside the existing Creative Laboratory repository and approved branch.
- Preserve KODU as an independent application and preserve its existing Reader / BookVault implementation.
- This plan is for a staged, low-risk integration. It does not authorize copying KODU source code, merging repositories, changing KODU storage, or moving data.

## Repository and change boundaries
- Host repository: `edwinsefer/Pathway-Notes-Daily-Lab`.
- Working branch only: `feature/blog-feed-quality-audit`.
- PR #7 must remain Open and Draft; do not merge or mark ready without explicit user approval.
- Blog V12 remains FINAL/LOCKED.
- Blogger remains READ ONLY.
- Scripture source data must not be changed, rewritten, compressed, or deleted.
- Existing Personal Notes storage keys and backup/restore behavior must remain unchanged.
- Existing Christian Books Library and its separate catalogue backup/restore must remain unchanged unless a separately approved integration requires a narrowly scoped change.
- KODU repository/source, Universal Reader Engine, BookVault data, and their storage are out of scope for modification in this host-repository task.

## Proposed user experience
- Add one clearly labelled KODU navigation entry/card in Creative Laboratory.
- The entry point should open KODU as an isolated destination (prefer a separately hosted KODU URL or a separately deployed application route only after the real deployment and origin are verified).
- Do not embed KODU's Reader runtime into the Creative Laboratory bundle in the first stage.
- Do not fabricate a KODU URL. If a verified deployable URL is not available, show a clearly marked planned/coming-soon entry until one is supplied and verified.
- Preserve the current Home, Bible Study, Books Library, Personal Notes, Search, and Audit navigation behavior.

## Staged implementation
### Stage 0 — Read-only discovery
- Inspect the host app routing, navigation, deployment configuration, and existing KODU integration references.
- Verify an actual KODU deployment URL and its access requirements before adding an active launch link.
- Record the KODU module boundary and non-goals.
- No runtime code changes in this stage.

### Stage 1 — Safe entry point
- Add a KODU navigation/card entry with accessible label and responsive styling.
- Until a verified destination is available, keep it visibly marked as planned and non-clickable; do not point it to a guessed URL.
- Add tests proving existing routes still work and the entry does not trigger Scripture registry loading.
- Do not import KODU source or reader dependencies into the host app.

### Stage 2 — Verified launch integration
- Only after the user approves and the KODU deployment URL is verified, activate the launch action.
- Prefer opening the independent KODU application in a new tab/window.
- Do not pass personal notes, catalogue data, Scripture data, tokens, or credentials through URL parameters.
- Do not introduce shared storage or cross-origin data writes.

### Stage 3 — Optional data bridge (separate approval required)
- Consider a documented, read-only export/import contract only if useful.
- Use explicit user-triggered export/import, schema versioning, preview, duplicate review, and confirmation.
- Never perform automatic sync, silent overwrite, or destructive merge.
- Keep Books Catalogue, Personal Notes, Bible Scripture, KODU BookVault, and Reader progress as separate data domains.

## Acceptance criteria
- KODU is discoverable from Creative Laboratory without merging the two applications.
- Existing Creative Laboratory routes and current visual identity remain intact.
- Blog V12 and Blogger are untouched.
- Scripture registry and Scripture content are unchanged.
- Books Library and Personal Notes remain separate and functional.
- No KODU source, BookVault data, Reader storage, or credentials are copied or modified.
- Mobile/desktop and Light/Dark visual review passes.
- CI, browser regression tests, and Scripture structural audit pass.
- User explicitly approves before activating any external launch destination or proceeding to data integration.

## Current status — updated 2026-11-06
- Direction approved: make KODU available inside Creative Laboratory as an independent module.
- Stage 0 discovery: no verified hosted KODU URL has been identified. The inspected KODU repository contains a Windows desktop build workflow; this does not rule out a deployment under another project or hosting provider.
- Stage 1 implementation: complete. Creative Laboratory now displays a non-interactive `KODU — Coming Soon` navigation entry. No URL is guessed, no KODU runtime is bundled, and no KODU storage or data is touched.
- Automated verification: Creative Laboratory Verification Run #158 passed on commit `926e788625bb5ae3e12d1492ee91e29e49ca2c93`; TypeScript/production build, parser tests, backup validation, Christian Books catalogue tests, browser E2E tests, and Scripture structural audit all passed. Scripture Integrity Run #62 also passed.
- Preview deployment: Vercel deployment `dpl_EGimroW5u8Gm44aUXSRsUN2yPg1M` is READY for the same commit.
- Visual acceptance: user approved Desktop Light, Desktop Dark, Mobile Light, and Mobile Dark screenshots on 2026-11-06. KODU entry visibility and Coming Soon treatment accepted.
- PR #7 remains Open / Draft / Unmerged. No merge or draft-status change is authorized by this visual approval.
- Next action: obtain and verify the real independent KODU launch URL before Stage 2. Activating the link requires separate explicit user approval. Stage 3 data bridge remains separately gated.
