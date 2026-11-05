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
