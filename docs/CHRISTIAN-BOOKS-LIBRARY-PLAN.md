# Christian Books Library — Implementation Plan

## Purpose
Create a dedicated catalogue for Christian books (PDF/EPUB and bibliographic records) inside the Creative Laboratory. This is distinct from the existing Tamil Bible Scripture catalogue and the existing Personal Scripture Library.

## Current-state findings (source inspection)
- `src/App.tsx` currently defines `Page` as `'blog' | 'home' | 'library' | 'search' | 'scripture' | 'bible' | 'audit'`.
- The `Library` navigation item opens `page='library'`, which renders Personal Library content: saved pathways, saved verses, highlights, notes, and JSON backup/restore.
- The `Book Reviews` navigation item also opens `page='library'`; it is not a separate book catalogue or book-review page.
- `src/data/scripture/bibleBooks.ts` and `src/data/scripture/catalog.ts` are Bible book metadata, not a general Christian-books catalogue.
- No existing PDF/EPUB catalogue, book-file import workflow, or general book record model was found in the inspected source tree.
- Current Scripture lazy-loading gates include `library`; when Personal Library is split from Books Library, keep Scripture registry loading for Personal Library because it resolves saved verse text and validates backups. Do not load Scripture registry solely for the new Books Library.

## Product boundaries
1. **Christian Books Library**: bibliographic catalogue and references to user-selected local PDF/EPUB files.
2. **Personal Scripture Library**: saved verses, highlights, notes, pathway bookmarks, JSON backup/restore. Preserve existing storage keys and behavior.
3. **Tamil Bible Library**: the existing 66-book, 1,189-chapter, 31,102-verse Scripture corpus. Do not modify Scripture content or its catalogue as part of this project.

## Phase 1 — Catalogue foundation
- Add a distinct route/page key, e.g. `books`, without repurposing `library`.
- Change the current “Book Reviews” navigation action to a clearly named “Books Library” destination; retain a separate “Personal Library” navigation destination. Avoid duplicate labels that point to the same page.
- Add a dedicated typed book-record model. Proposed fields:
  - `id`: stable app-generated identifier
  - `title`: required
  - `authors`: string array
  - `language`: optional language label
  - `category`: optional category label
  - `format`: `pdf` | `epub` | `record-only`
  - `fileName`: optional original filename
  - `fileSizeBytes`: optional file size
  - `fileHandleStatus`: `not-linked` | `linked-in-session` (no persistent handle assumed)
  - `description`: optional user-entered description
  - `tags`: string array
  - `readingStatus`: `to-read` | `reading` | `completed`
  - `createdAt`, `updatedAt`: ISO timestamps
- Store catalogue metadata separately from Personal Scripture Library keys. Initial persistence may use a versioned localStorage key; no cloud sync is implied.
- Build the catalogue page with empty state, book cards/list, search, and filters for format, language, category, and reading status. Phase 1 does not upload, move, parse, or delete user files.
- Include a “Record a book” workflow for metadata-only entries; allow partial optional metadata but require a title.
- Add schema validation and unit tests for valid/invalid records, versioning, duplicate IDs, and malformed local data recovery without touching existing Personal Library data.

## File handling — later phase, explicit permission
- Browser file selection grants access only through the selected file/session. Do not claim durable access after refresh unless a supported permission-persisted handle is implemented and tested.
- Do not copy, move, rename, upload, or delete a selected file in the initial catalogue.
- File bytes and catalogue metadata must have distinct ownership/lifecycle. Removing a catalogue record must not delete the user's original file.
- Any future import/reader workflow must show filename, format, size, and explicit confirmation before an action that stores or transforms file bytes.

## Phase 2 — PDF/EPUB linking
- Add file selection and safe metadata extraction (filename, extension, size); validate actual file type rather than trusting extension alone.
- Define reader support separately: PDF preview and EPUB rendering are distinct capabilities.
- Verify offline behavior, refresh behavior, large-file handling, and browser compatibility.
- Never silently create persistent copies or cloud uploads.

## Phase 3 — Search, filters, duplicate review
- Search title, author, tags, description.
- Filter by format, language, category, and reading status.
- Duplicate suggestions may use normalized title + author + file size, but must remain review-only; never auto-delete or auto-merge.

## Phase 4 — Universal Reader integration
- Open a selected book only when the file is available and permission is valid.
- Preserve reading position in a separate, versioned record keyed by book ID and file fingerprint where feasible.
- Test PDF and EPUB independently; do not imply one renderer supports both.

## Phase 5 — Backup, restore, and final audit
- Export/import catalogue metadata as a separate, versioned JSON backup.
- Restore must preview record counts and require explicit confirmation before replacing/merging.
- Do not include file bytes in metadata backup unless a later, separately approved design explicitly requires it.
- Test corruption, duplicate IDs, missing files, stale file links, and round-trip integrity.

## Acceptance gates
- Existing Personal Scripture Library data and its JSON backup/restore remain unchanged and pass regression tests.
- Tamil Bible registry, chapter data, and Scripture audit results remain unchanged.
- Books Library can be opened without triggering Scripture registry download.
- Catalogue metadata survives reload and is isolated from Personal Library storage keys.
- No automatic file movement, deletion, cloud upload, or sync.
- Mobile and desktop Light/Dark visual review; automated tests pass.
- User approval required before merging or changing the stable Blog V12.

## Explicit non-goals
- No changes to Blog V12 or Blogger content/settings.
- No changes to Scripture source data.
- No automatic cloud storage, cross-device sync, or background file transfer.
- No automatic duplicate deletion.
- No paid service dependency in the foundation phase.
