# Scripture Data Audit Report

**Audit date:** 2026-11-04  
**Project:** Pathway Notes Daily — Creative Laboratory  
**Audit branch:** `feature/blog-feed-quality-audit`  
**Reference translation:** Tamil Old Version (1957)  
**Status:** PASS

## 1. Scope

This report records the completed Scripture metadata, structural, and verse-text comparison audits for all 66 books in the Creative Laboratory.

- **Reference repository:** [TFBF — Bible Tamil Sathiyavedam 1957](https://github.com/tfbf/Bible-Tamil-Sathiyavedam-1957), branch `master`, folder `usfm/`.
- **Creative Laboratory repository:** [Pathway Notes Daily Lab](https://github.com/edwinsefer/Pathway-Notes-Daily-Lab), branch `feature/blog-feed-quality-audit`, folder `src/data/scripture/`.
- **Baseline:** The approved Tamil Old Version (1957) digital USFM source. This is specifically the 1957 reference and should not be conflated with the current BSI O.V. (New Ortho) or another later edition.

## 2. Translation metadata audit

| Check | Result |
|---|---:|
| Old Testament books with expected translation metadata | 39/39 PASS |
| New Testament books with expected translation metadata | 27/27 PASS |
| Total books with expected translation metadata | 66/66 PASS |

All 66 Scripture book files carry the translation metadata value `Tamil Old Version (1957)`.

## 3. Structural audit

| Measure | Audited result |
|---|---:|
| Books | 66 |
| Chapters | 1,189 |
| Verses | 31,102 |
| Structural issues | 0 |

The structural audit validates the Scripture registry and its book/chapter/verse structure. It is separate from the verse-text comparison below.

Historical CI evidence recorded for this project: GitHub Actions workflow run **40719514769** (workflow run **#98**) completed successfully. Its `build-and-audit` job passed all 10 workflow steps, including TypeScript/build, Scripture parser tests, library backup tests, browser E2E, and structural audit. This is recorded as historical evidence, not a claim that CI was rerun on the report-creation commit.

## 4. Verse-text accuracy comparison

The local Creative Laboratory Scripture text was compared book-by-book and chapter-by-chapter against the approved TFBF Tamil Old Version (1957) USFM reference. Text comparison normalized Unicode to NFC and normalized whitespace before comparing verse strings.

| Measure | Result |
|---|---:|
| Books compared | 66/66 |
| Chapters compared | 1,189/1,189 |
| Reference verses | 31,102 |
| Creative Laboratory verses | 31,102 |
| Exact verse-text matches | 31,102 |
| Actual text differences | 0 |
| Missing verses | 0 |
| Extra verses | 0 |

**Result: PASS — all 31,102 verse texts match the digital 1957 reference under the comparison normalization described above.**

### Habakkuk 3:19 parser-boundary clarification

An initial automated comparison appeared to flag Habakkuk 3:19. Manual inspection of the USFM source showed that the phrase:

> இது நெகிநோத் என்னும் வாத்தியத்தில் வாசிக்க இராகத்தலைவனுக்கு ஒப்புவிக்கப்பட்ட சங்கீதம்.

is a separate paragraph heading (`\\p`) following verse 19, not part of the verse text (`\\v 19`). Once the paragraph heading was excluded from the verse boundary, Habakkuk 3:19 matched exactly. This was a parser-boundary issue, not a Scripture Data discrepancy. No Scripture text was changed.

## 5. Per-book chapter and verse counts

Counts below are the verified chapter/verse totals used in the 66-book comparison.

### Old Testament

| Book | Chapters | Verses |
|---|---:|---:|
| Genesis | 50 | 1,533 |
| Exodus | 40 | 1,213 |
| Leviticus | 27 | 859 |
| Numbers | 36 | 1,288 |
| Deuteronomy | 34 | 959 |
| Joshua | 24 | 658 |
| Judges | 21 | 618 |
| Ruth | 4 | 85 |
| 1 Samuel | 31 | 810 |
| 2 Samuel | 24 | 695 |
| 1 Kings | 22 | 816 |
| 2 Kings | 25 | 719 |
| 1 Chronicles | 29 | 942 |
| 2 Chronicles | 36 | 822 |
| Ezra | 10 | 280 |
| Nehemiah | 13 | 406 |
| Esther | 10 | 167 |
| Job | 42 | 1,070 |
| Psalms | 150 | 2,461 |
| Proverbs | 31 | 915 |
| Ecclesiastes | 12 | 222 |
| Song of Solomon | 8 | 117 |
| Isaiah | 66 | 1,292 |
| Jeremiah | 52 | 1,364 |
| Lamentations | 5 | 154 |
| Ezekiel | 48 | 1,273 |
| Daniel | 12 | 357 |
| Hosea | 14 | 197 |
| Joel | 3 | 73 |
| Amos | 9 | 146 |
| Obadiah | 1 | 21 |
| Jonah | 4 | 48 |
| Micah | 7 | 105 |
| Nahum | 3 | 47 |
| Habakkuk | 3 | 56 |
| Zephaniah | 3 | 53 |
| Haggai | 2 | 38 |
| Zechariah | 14 | 211 |
| Malachi | 4 | 55 |
| **Old Testament total** | **929** | **23,145** |

### New Testament

| Book | Chapters | Verses |
|---|---:|---:|
| Matthew | 28 | 1,071 |
| Mark | 16 | 678 |
| Luke | 24 | 1,151 |
| John | 21 | 879 |
| Acts | 28 | 1,007 |
| Romans | 16 | 433 |
| 1 Corinthians | 16 | 437 |
| 2 Corinthians | 13 | 257 |
| Galatians | 6 | 149 |
| Ephesians | 6 | 155 |
| Philippians | 4 | 104 |
| Colossians | 4 | 95 |
| 1 Thessalonians | 5 | 89 |
| 2 Thessalonians | 3 | 47 |
| 1 Timothy | 6 | 113 |
| 2 Timothy | 4 | 83 |
| Titus | 3 | 46 |
| Philemon | 1 | 25 |
| Hebrews | 13 | 303 |
| James | 5 | 108 |
| 1 Peter | 5 | 105 |
| 2 Peter | 3 | 61 |
| 1 John | 5 | 105 |
| 2 John | 1 | 13 |
| 3 John | 1 | 14 |
| Jude | 1 | 25 |
| Revelation | 22 | 404 |
| **New Testament total** | **260** | **7,957** |

**Combined total:** 66 books, 1,189 chapters, 31,102 verses.

## 6. Limitations and interpretation

- This audit compares the Creative Laboratory TypeScript Scripture data with the digital TFBF 1957 USFM repository source identified above.
- It is not a page-by-page human proofread of a physical printed 1957 Bible.
- Unicode NFC and whitespace normalization were applied for comparison; this report does not claim that every typographic or formatting distinction was separately evaluated.
- The result establishes agreement with the selected digital reference, not an independent judgment about the translation or its theology.

## 7. Change control

- **Scripture Data changed during this audit:** No.
- **Blog V12 changed:** No. Blog V12 remains FINAL / STABLE and outside this audit.
- **Creative Laboratory source data modified to force a match:** No.
- The Habakkuk 3:19 discrepancy was resolved by correcting the comparison boundary, not by editing Scripture content.

## 8. Final audit conclusion

The approved Tamil Old Version (1957) metadata is present across all 66 books. The structural totals are 66 books, 1,189 chapters, and 31,102 verses, with zero structural issues in the recorded audit. The text comparison found 31,102 exact verse matches, zero actual differences, zero missing verses, and zero extra verses after resolving the Habakkuk 3:19 paragraph-heading boundary.

**Overall recorded result: PASS — 66/66 books.**
