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

## Safety boundary

- Blog V12: **DO NOT TOUCH**
- Existing approved Scripture data: change only with explicit need and integrity verification.
- Keep experimental work inside this laboratory repository.
