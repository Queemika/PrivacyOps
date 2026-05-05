// Lightweight client-side anonymization for the prototype.
// Replaces names, emails, phone numbers, and common identifiers with placeholders.

export interface AnonymizationResult {
  text: string;
  replacements: { original: string; placeholder: string }[];
}

const CLIENT_KEYWORDS = ["acme", "kpmg", "globe telecom", "ayala", "smc", "jollibee", "bdo", "metrobank"];
const SYSTEM_KEYWORDS = ["aws", "azure", "salesforce", "workday", "okta", "fortinet", "bitlocker", "sap"];
const ROLE_TOKENS = ["dpo", "hr lead", "it sec", "dba", "dpa"];

export function anonymizeText(input: string, strict = true): AnonymizationResult {
  let text = input;
  const replacements: { original: string; placeholder: string }[] = [];
  const track = (orig: string, ph: string) => {
    if (!replacements.find((r) => r.original.toLowerCase() === orig.toLowerCase())) {
      replacements.push({ original: orig, placeholder: ph });
    }
  };

  // Emails
  text = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (m) => {
    track(m, "[EMAIL]");
    return "[EMAIL]";
  });

  // Phone numbers (simple)
  text = text.replace(/(\+?\d[\d\s\-().]{7,}\d)/g, (m) => {
    track(m, "[PHONE]");
    return "[PHONE]";
  });

  // Account / ID numbers (8+ digit runs)
  text = text.replace(/\b\d{8,}\b/g, (m) => {
    track(m, "[ID_NUMBER]");
    return "[ID_NUMBER]";
  });

  // Client name keywords
  CLIENT_KEYWORDS.forEach((c) => {
    const re = new RegExp(`\\b${c}\\b`, "gi");
    if (re.test(text)) {
      text = text.replace(new RegExp(`\\b${c}\\b( corp| inc| corporation| ltd)?`, "gi"), (m) => {
        track(m, "[CLIENT_NAME]");
        return "[CLIENT_NAME]";
      });
    }
  });

  // System names
  SYSTEM_KEYWORDS.forEach((s) => {
    const re = new RegExp(`\\b${s}\\b`, "gi");
    if (re.test(text)) {
      text = text.replace(re, (m) => { track(m, "[SYSTEM_NAME]"); return "[SYSTEM_NAME]"; });
    }
  });

  // Person names: "First L." or "First Last" preceded by line start, "[time]", or in transcript role markers.
  // Pattern: capitalised first name optionally followed by middle initial / surname.
  const personMap = new Map<string, string>();
  let personCounter = 0;
  const personRegex = /\b([A-Z][a-z]{1,15})(?:\s+([A-Z]\.?|[A-Z][a-z]{1,20}))?\b/g;

  text = text.replace(personRegex, (match, first, second) => {
    const lower = (first + " " + (second ?? "")).trim().toLowerCase();
    // Skip common non-name capitalised words
    const skip = new Set([
      "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
      "january","february","march","april","may","june","july","august","september","october","november","december",
      "data","privacy","portal","system","portal","onboarding","payroll","vendor","management","customer","crm","marketing",
      "human","resources","philippines","singapore","kong","hong","europe","compliance","client","name","first","last","email",
      "password","login","signup","sign","employee","candidate","report","draft","final","review","upload","transcript",
      "dpo","npc","gdpr","dpa","pia","ropa","drl","irl","pradar","aws","azure"
    ]);
    if (skip.has(first.toLowerCase())) return match;
    if (ROLE_TOKENS.includes(lower)) return match;
    if (!second && !strict) return match; // in non-strict, only replace full names

    if (!personMap.has(lower)) {
      personCounter += 1;
      personMap.set(lower, `[PERSON_${personCounter}]`);
    }
    const ph = personMap.get(lower)!;
    track(match, ph);
    return ph;
  });

  return { text, replacements };
}
