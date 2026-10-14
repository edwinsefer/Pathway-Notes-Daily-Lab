export type KnownVerseLookup = (book: string, chapter: number, verse: number) => boolean
export declare const LIBRARY_BACKUP_APP: string
export declare function validateLibraryBackup(parsed: unknown, isKnownVerse: KnownVerseLookup): boolean
