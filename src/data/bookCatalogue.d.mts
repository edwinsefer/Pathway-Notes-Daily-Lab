export type BookFormat = 'pdf' | 'epub' | 'record-only'
export type BookReadingStatus = 'to-read' | 'reading' | 'completed'
export type BookFileHandleStatus = 'not-linked' | 'linked-in-session'
export interface BookRecord {
  id: string
  title: string
  authors: string[]
  language?: string
  category?: string
  format: BookFormat
  fileName?: string
  fileSizeBytes?: number
  fileHandleStatus: BookFileHandleStatus
  description?: string
  tags: string[]
  readingStatus: BookReadingStatus
  createdAt: string
  updatedAt: string
}
export interface ValidationResult { valid: boolean; errors: string[] }
export interface CatalogueLoadResult { records: BookRecord[]; valid: boolean; errors: string[] }
export const BOOK_CATALOGUE_STORAGE_KEY: 'pathway-books-catalogue:v1'
export const BOOK_CATALOGUE_SCHEMA_VERSION: 1
export function validateBookRecord(record: unknown): ValidationResult
export function validateBookCatalogue(records: unknown): ValidationResult
export function createBookRecord(input: Partial<BookRecord> & Pick<BookRecord, 'title'>, options?: { id?: string; now?: string }): BookRecord
export function loadBookCatalogue(storage: Pick<Storage, 'getItem'>): CatalogueLoadResult
export function saveBookCatalogue(storage: Pick<Storage, 'setItem'>, records: BookRecord[]): { saved: boolean; errors: string[] }

export interface BookCatalogueBackupPreview {
  valid: boolean
  errors: string[]
  existingCount: number
  incomingCount: number
  duplicateIds: string[]
  duplicateBooks: Array<{ id: string; title: string; authors: string[] }>
  newRecords: BookRecord[]
  incomingRecords: BookRecord[]
}
export const BOOK_CATALOGUE_BACKUP_APP: 'pathway-notes-books-library'
export const BOOK_CATALOGUE_BACKUP_VERSION: 1
export const BOOK_CATALOGUE_BACKUP_MAX_BYTES: number
export function createBookCatalogueBackup(records: BookRecord[], exportedAt?: string): {
  app: string; schemaVersion: number; exportedAt: string; data: { records: BookRecord[] }
}
export function parseBookCatalogueBackup(value: unknown): {
  valid: boolean; errors: string[]; records: BookRecord[]; exportedAt: string | null
}
export function previewBookCatalogueRestore(existingRecords: BookRecord[], incomingRecords: BookRecord[]): BookCatalogueBackupPreview
export function mergeBookCatalogueRecords(existingRecords: BookRecord[], incomingRecords: BookRecord[]): BookRecord[]
