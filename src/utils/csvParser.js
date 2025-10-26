const fs = require('fs');
const readline = require('readline');
const { setNestedProperty } = require('./objectUtils');

/**
 * Split a single CSV line into its constituent values.  This parser
 * supports quoted fields (double quotes) which may contain commas.  Any
 * double quote characters within a quoted field must be escaped by
 * doubling them (e.g. "He said ""Hello""" becomes a value of
 * He said "Hello").  Unquoted fields are trimmed of surrounding
 * whitespace.
 *
 * @param {string} line A single line from a CSV file.
 * @returns {string[]} An array of field values.
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {

        current += '"';
        i++;
      } else {

        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {

      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * @param {string} filePath Absolute or relative path to the CSV file.
 * @param {(record: Object) => Promise<void>} onRecord 
 */
async function parseCSVStream(filePath, onRecord) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers;
  for await (const line of rl) {

    if (!line.trim()) continue;
    if (!headers) {
      headers = parseCSVLine(line);
      continue;
    }
    const values = parseCSVLine(line);
    const record = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = values[i];

      if (value !== undefined && value !== '') {
        setNestedProperty(record, header, value);
      }
    }
    await onRecord(record);
  }
}

module.exports = {
  parseCSVLine,
  parseCSVStream,
};