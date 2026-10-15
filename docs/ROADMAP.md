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
- [x] GitHub Actions build verification for the latest Library code passed in run #76 on commit `6d327ac9c019a6afda485d980a9a01c0df1ea3b7`.

### Phase 3 experiment results
- [x] Filter counts for All / Saved / Highlighted / Noted
- [x] Contextual empty states
- [x] Personal Library search across references, Scripture text, and notes
- [x] Lightweight organization without changing the saved/highlight/note data model
- [x] Regression-sensitive source review confirms approved Scripture Reader surfaces remain present

### Phase 3 approval gate
- [ ] Runtime/browser verification of the new Library search and organization
- [x] GitHub Actions build verification (run #76 passed on the current feature branch).
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
- [x] GitHub Actions build verification passed for the current application code in run #76 (commit `6d327ac9c019a6afda485d980a9a01c0df1ea3b7`).
- [ ] Final Phase 4 approval still required.

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
- [x] GitHub Actions browser end-to-end suite (5 tests passed, including tablet-width overflow regression).
- [x] Scripture structural audit (66 books, 1,189 chapters, 31,102 verses, 0 issues).
- [x] Clearly label prototype/sample post cards so they cannot be mistaken for published posts; disable the unconnected subscription control and explain that no email is collected.
- [ ] Replace prototype/sample post cards with a verified read-only feed from the designated Test Blog or approved content source.
- [ ] Verify post links, categories, images, empty/loading/error states, and real-content mobile behavior against real test content.
- [x] Verify responsive document width at 320, 390, 520, 767, 768, 820, 1024, 1280, and 1440px on the local app; no page-level horizontal overflow and no JavaScript page errors detected.
- [ ] Decide and verify the separate Blogger navigation link and publishing workflow on Test Blog only.
- [x] Complete Integration Readiness Review and document all remaining limitations.
- [ ] Final approval before any merge or Blogger change.

### Integration Readiness Review — 2026-10-15

**Latest follow-up verification**
- Fixed tablet navigation overflow at the 768px breakpoint by keeping the navigation bar within the viewport and allowing horizontal scrolling inside the navigation itself.
- Added a tablet-width regression test. The complete local verification sequence passed: production build, 5 Playwright browser tests, 4 Scripture audit parser tests, 11 Library backup validation tests, and Scripture structural audit (66 books, 1,189 chapters, 31,102 verses, 0 issues).
- GitHub Actions run #80 passed on commit `447025fd008f3d2f0fe7dd8abaa85a51c90cf358`.
- Vercel reports the Preview deployment READY on the latest test commit. A direct browser attempt was redirected to Vercel login, so live visual acceptance remains blocked by Preview protection; deployment readiness must not be confused with public accessibility.

**Verified**
- GitHub Actions run #75 completed successfully for commit `af7dcaaf44acf272d76db2ccd4a22c075e072d4f`.
- GitHub Actions run #76 completed successfully for code commit `6d327ac9c019a6afda485d980a9a01c0df1ea3b7`; later documentation commits recorded the integration review. Run #80 additionally verifies the tablet navigation fix and new regression test on commit `447025fd008f3d2f0fe7dd8abaa85a51c90cf358`.
- The workflow's TypeScript/production build, Scripture audit parser tests, library backup validation tests, browser end-to-end tests, and Scripture structural audit steps completed successfully in runs #75, #76, and #80. Run #80 includes the new tablet overflow regression check.
- Vercel reports a READY Preview deployment built from the same feature branch and commit.
- The homepage explicitly labels its cards as design-preview samples and discloses that they are not published posts.
- The subscription control is disabled and the UI says no email address is collected or sent.

**Not verified / still blocked**
- The latest Preview URL redirects to Vercel login when accessed in an independent browser session. Vercel READY confirms deployment status, not public accessibility or a full live visual/browser acceptance test. Do not change deployment protection without explicit approval.
- The designated Test Blog feed endpoint could not be fetched through the available web access. This does not establish that the blog or feed is unavailable; it means the integration endpoint and response remain unverified.
- Sample post cards remain hard-coded in `src/BlogHome.tsx`; their buttons navigate to internal app sections, not original Blogger articles.
- Real feed parsing, categories, article URLs, thumbnails, empty/loading/error handling, and real-content mobile checks have not been implemented or verified.
- Blogger navigation/publishing workflow has not been tested on the Test Blog.
- Phase 3 and Phase 4 still have runtime/browser verification and final approval items open as listed above. Their application-code build verification is confirmed by run #76; the later commit only updates this roadmap.

**Safe next actions**
1. Confirm an accessible public read-only feed endpoint for the designated Test Blog (Atom/JSON or RSS) and inspect a real response.
2. Implement feed parsing with graceful loading, empty, and error states only after the endpoint shape is confirmed.
3. Test real article links, categories, images, and mobile behavior against actual Test Blog content.
4. Keep Blog V12 untouched; do not merge this PR or make Blogger changes before final approval.

### Integration safety boundary

- The homepage cards and email subscription are prototype UI until their real data/services are verified; do not represent them as connected.
- Blogger and the Vercel app have separate storage. Personal Library backup/restore remains an explicit JSON workflow; never imply automatic sync.
- Use the designated Test Blog for Blogger-side experiments only. Do not edit Blog V12, its theme, XML, posts, or settings.
- Do not merge this branch or change the stable blog without final approval.

### Final live integration check — 2026-10-15

- [x] Verified the designated Test Blog Atom/JSON feed is reachable (HTTP 200).
- [x] Confirmed the Test Blog currently contains **0 posts**; live-card, category, image, and article-link validation cannot be completed against real test entries until the Test Blog is populated.
- [x] Confirmed the Stable Blog V12 public feed responds (HTTP 200) and reports 134 posts. It was inspected read-only only; it is **not** being substituted as the lab data source without explicit approval.
- [x] Confirmed the latest Preview deployment is READY and tied to feature branch commit `317c8f45751a6b782d22371714daa87198cccff7`.
- [x] Verified why browser access is blocked: Vercel project SSO protection is enabled for deployments; no protection settings were changed.
- [ ] Remaining external acceptance gates: populate the designated Test Blog with approved sample posts, verify real-content behavior, and resolve an approved way for the reviewer to access the protected Preview.
- [ ] No merge and no Blogger content/settings changes without explicit final approval.

### Stable Blog V12 read-only integration — 2026-10-15

- [x] Edwin explicitly approved use of the Stable Blog V12 feed in read-only mode for Creative Lab integration testing.
- [x] Replaced the hard-coded sample cards with the live Blogger JSONP feed (up to 20 recent entries); this avoids browser CORS restrictions without changing Blogger.
- [x] Render post titles, published dates, category labels, plain-text excerpts, optional images, and original article links. Links are restricted to `https://pathwaynotes.blogspot.com/` and open in a new tab.
- [x] Added loading, empty-feed, and error states. Feed content is displayed as text; the Lab does not write to Blogger.
- [x] Added Playwright coverage for live feed cards and original article URLs.
- [x] Production build passed; Scripture audit parser tests 4/4 passed; Library backup tests 11/11 passed; structural Scripture audit passed (66 books, 1,189 chapters, 31,102 verses, 0 issues).
- [x] GitHub Actions run #84 passed on commit `25a9c0f22037bd0018798a35ae04194ebcd0ab85`.
- [x] Latest Vercel Preview deployment is READY on commit `25a9c0f22037bd0018798a35ae04194ebcd0ab85`.
- [ ] External reviewer access to the Preview is still blocked by enabled Vercel SSO protection. No protection settings were changed.
- [ ] Final review and explicit approval before merge. No merge performed.
- [x] Stable Blogger Blog V12 remains unchanged; all feed requests were read-only.
