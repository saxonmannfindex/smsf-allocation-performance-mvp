/**
 * Formatting helpers used by parsers
 * Keeps parsing logic clean and reusable
 */

// Parse dates like "30 June 2024", "30/06/2024", "2024-06-30"
export function parseDate(value) {
  if (!value) return null;

  const cleaned = value.toString().trim();

  const parsed = new Date(cleaned);
  if (!isNaN(parsed)) return parsed.toISOString().split("T")[0];

  return null;
}

// Parse currency values like "$1,234,567.89" or "(1,234)"
export function parseCurrency(value) {
  if (!value) return null;

  const cleaned = value
    .toString()
    .replace(/[\$,]/g, "")
    .replace(/\((.*?)\)/, "-$1")
    .trim();

  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

// Parse percentages like "12.34%" or "12.34"
export function parsePercentage(value) {
  if (!value) return null;

  const cleaned = value.toString().replace("%", "").trim();
  const number = parseFloat(cleaned);

  return isNaN(number) ? null : number;
}
