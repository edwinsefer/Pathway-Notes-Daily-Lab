# Tamil Bible Data Strategy

## Decision

Use the Tamil Bible 1957 Edition as the initial Scripture source for the Laboratory.

Source:
- Repository: berinaniesh/bible-tamil
- Edition: Tamil Bible Old Version, 1957
- Primary text source referenced by the repository: TFBF Tamil Bible repository

## Rights note

The source repository states that this Bible text is in the Public Domain in India.

This statement is jurisdiction-specific. Before distributing the application internationally or commercially, rights should be reviewed for the intended jurisdictions.

The repository's MIT License applies to its code/scripts; it should not be treated as a blanket MIT license for the Bible text.

## Technical strategy

1. Keep Scripture data local to the app.
2. Use structured book → chapter → verse data.
3. Do not depend on a live Bible API for the core reading experience.
4. Import the full Bible only after the single-chapter test is stable.
5. Preserve the source/version metadata with the imported data.

## Current test

Psalm 46 (11 verses) is the approved proof-of-concept.

## Next gate

Before importing all 66 books:
- verify source completeness
- choose the final machine-readable format
- define book/chapter metadata
- test a small multi-book sample
- then approve the full import


## Source completeness check — Step 14

Checked the source repository's `usfm/` directory at the selected source revision.

Result:
- 66 USFM book files found.
- Numbered sequence 01 through 66 is complete.
- No missing book number was detected.
- The source is therefore suitable for the next import-validation stage.

Important: this verifies the presence and numbering of the 66 book files. It does not yet prove that every chapter and verse inside every file is error-free. That will be checked during the import validation stage.


## Psalm 46:10 verification — Step 14B

Verified directly against the selected Tamil Bible 1957 USFM source:

- Book: Psalms
- Chapter: 46
- Verse: 10
- Source file: `usfm/19_Psalms.usfm`
- Verified text:
  "நீங்கள் அமர்ந்திருந்து, நானே தேவனென்று அறிந்துகொள்ளுங்கள்; ஜாதிகளுக்குள்ளே உயர்ந்திருப்பேன், பூமியிலே உயர்ந்திருப்பேன்."

The verse is now confirmed as the exact source text for the Today's Pathway sample.
