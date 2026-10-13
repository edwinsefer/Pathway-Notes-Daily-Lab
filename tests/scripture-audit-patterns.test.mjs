import test from 'node:test'
import assert from 'node:assert/strict'
import { verseTextPattern } from '../scripts/scripture-audit-patterns.mjs'

function extractVerse(text) {
  return [...text.matchAll(verseTextPattern)].map((match) => ({
    verse: Number(match[1]),
    text: match[2],
  }))
}

test('reads ordinary verse text', () => {
  assert.deepEqual(extractVerse('"verse": 1, "text": "ஆதியிலே"'), [
    { verse: 1, text: 'ஆதியிலே' },
  ])
})

test('reads text containing escaped quotation marks', () => {
  assert.deepEqual(extractVerse('"verse": 2, "text": "அவர் சொன்னார்: \\"வாருங்கள்\\""'), [
    { verse: 2, text: 'அவர் சொன்னார்: \\"வாருங்கள்\\"' },
  ])
})

test('reads JSON escaped newline and backslash sequences', () => {
  assert.deepEqual(extractVerse('"verse": 3, "text": "முதல்\\nஇரண்டாம்\\\\மூன்றாம்"'), [
    { verse: 3, text: 'முதல்\\nஇரண்டாம்\\\\மூன்றாம்' },
  ])
})

test('detects empty verse text', () => {
  assert.deepEqual(extractVerse('"verse": 4, "text": ""'), [
    { verse: 4, text: '' },
  ])
})
