const DAYS: string[] = [
  "Rātapu",   // Sunday
  "Rāhina",   // Monday
  "Rātū",     // Tuesday
  "Rāapa",    // Wednesday
  "Rāpare",   // Thursday
  "Rāmere",   // Friday
  "Rāhoroi",  // Saturday
];

const MONTHS: string[] = [
  "Kohi-kōkā",        // January
  "Hui-tanguru",      // February
  "Poutū-te-rangi",   // March
  "Paenga-whāwhā",    // April
  "Haratua",          // May
  "Pipiri",           // June
  "Hōngongoi",        // July
  "Here-turi-kōkā",   // August
  "Mahuru",           // September
  "Whiringa-ā-nuku",  // October
  "Whiringa-ā-rangi", // November
  "Hakihea",          // December
];

/** Returns e.g. "Rāhina, 3 Haratua 2026" */
export function formatMaoriDate(date: Date = new Date()): string {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Returns the short day name e.g. "Rāhina" */
export function getMaoriDay(date: Date = new Date()): string {
  return DAYS[date.getDay()];
}
