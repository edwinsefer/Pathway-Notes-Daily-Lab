// Match a JSON-encoded verse text string, including escaped quotes and backslashes.
export const verseTextPattern = /"verse":\s*(\d+),\s*"text":\s*"((?:\\.|[^"\\])*)"/g
