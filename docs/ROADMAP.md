# Pathway Notes Daily — Creative Laboratory Roadmap

## Source of truth

This roadmap tracks the approved laboratory work. The stable Pathway Notes Daily Blog V12 is outside this repository and must not be modified.

## Working rule

**Create → Experiment → Test → Approve → Keep**

Do not repeat a completed verification unless a later code change specifically invalidates it.

## Status

### Phase 1 — Foundation
- [x] Project identity
- [x] React + Vite + TypeScript foundation
- [x] Mobile-first layout
- [x] Desktop responsive foundation
- [x] Light/Dark theme foundation
- [x] Local persistence foundation

### Phase 2 — Scripture Reading Foundation
- [x] 66-book Bible catalogue
- [x] Approved chapter registry
- [x] Book / Chapter / Verse navigation
- [x] Scripture text reader
- [x] Previous / Next chapter navigation
- [x] Scripture search
- [x] Save verse to Personal Library
- [x] Verse highlighting
- [x] Personal verse notes
- [x] Today's Pathway bookmark
- [x] Read Full Pathway interaction
- [x] Scripture structural audit
- [x] Automated Scripture integrity guard in GitHub Actions

## Verification policy

Previously completed functional checks are treated as approved and are not repeated by default. New work is verified against the affected surface and regression-sensitive areas only.

## Current milestone

### Phase 3 — Personal Reading Experience
- [x] Improve Personal Library from a saved-verse list into a useful reading workspace.
- [x] Add clear grouping/filtering for saved, highlighted, and noted verses.
- [x] Preserve local data across reloads and navigation.
- [x] Static source verification of the new Library behavior.
- [ ] GitHub Actions build verification for the latest Library changes.

### Phase 3 experiment results
- [x] Filter counts for All / Saved / Highlighted / Noted
- [x] Contextual empty states
- [x] Personal Library search across references, Scripture text, and notes
- [x] Lightweight organization without changing the saved/highlight/note data model
- [x] Regression-sensitive source review confirms approved Scripture Reader surfaces remain present

### Phase 3 approval gate
- [ ] Runtime/browser verification of the new Library search and organization
- [ ] GitHub Actions build verification
- [ ] Final Phase 3 approval

## Next phase

### Phase 4 — Reading Flow
1. [x] Make Library → Scripture Reader return flow clearer.
2. [x] Add a compact reading-context indicator when opening a saved/highlighted/noted verse.
3. [x] Improve chapter continuation from a Library-opened verse without changing approved navigation behavior.
4. [x] Static verification.
5. [ ] Runtime verification.
6. [ ] Approve and keep.

### Phase 4 verification notes
- [x] Re-verified Library → Reader context handoff after implementation fixes.
- [x] Re-verified Notes workspace derivation order and All-filter inclusion.
- [x] Confirmed existing chapter navigation and Reader context indicators remain present.
- [ ] Runtime/browser verification still required.
- [ ] GitHub Actions build verification still required.

## Safety boundary

- Blog V12: **DO NOT TOUCH**
- Existing approved Scripture data: change only with explicit need and integrity verification.
- Keep experimental work inside this laboratory repository.

## Phase 5 — Pathway Notes Daily Blog Model

### Implementation status
- [x] Build a responsive bilingual homepage with hero, category navigation, latest-post cards, verse panel, sidebar, tagline, and footer.
- [x] Preserve access to the existing Scripture Reader, Personal Library, Search, and Audit tools.
- [x] Add responsive mobile layout and theme-aware styling.
- [x] Add browser checks for blog homepage visibility, reader navigation, mobile layout, and theme switching.
- [x] GitHub Actions production build and TypeScript verification.
- [x] GitHub Actions Scripture audit parser tests.
- [x] GitHub Actions library backup validation tests.
- [x] GitHub Actions browser end-to-end suite (4 tests passed).
- [x] Scripture structural audit (66 books, 1,189 chapters, 31,102 verses, 0 issues).
- [x] Clearly label prototype/sample post cards so they cannot be mistaken for published posts; disable the unconnected subscription control and explain that no email is collected.
- [ ] Replace prototype/sample post cards with a verified read-only feed from the designated Test Blog or approved content source.
- [ ] Verify post links, categories, images, empty/loading/error states, and mobile overflow against real test content.
- [ ] Decide and verify the separate Blogger navigation link and publishing workflow on Test Blog only.
- [ ] Complete Integration Readiness Review and document all remaining limitations.
- [ ] Final approval before any merge or Blogger change.

### Integration safety boundary
- The homepage cards and email subscription are prototype UI until their real data/services are verified; do not represent them as connected.
- Blogger and the Vercel app have separate storage. Personal Library backup/restore remains an explicit JSON workflow; never imply automatic sync.
- Use the designated Test Blog for Blogger-side experiments only. Do not edit Blog V12, its theme, XML, posts, or settings.
- Do not merge this branch or change the stable blog without Edwin's final approval.
