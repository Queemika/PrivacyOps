// Server-style anonymization (mocked client-side for the prototype).
// Masks ONLY personal data tokens (names, emails, phones, IDs, addresses).
// Speaker labels in transcripts (e.g. "Maria S. (DPO):") are mapped to a
// stable [PERSON_1] / [PERSON_2] in order of first appearance — the same
// speaker keeps the same placeholder throughout, and we never grow past
// the unique speakers actually present.

export interface AnonymizationResult {
  text: string;
  replacements: { original: string; placeholder: string }[];
  speakerMap: Record<string, string>; // placeholder -> count only (no real names persisted)
  stats: { emails: number; phones: number; ids: number; persons: number };
}

// Words that look capitalised but aren't person names — never mask these.
const NAME_STOPWORDS = new Set([
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  "january","february","march","april","may","june","july","august",
  "september","october","november","december",
  "aws","azure","gcp","okta","fortinet","bitlocker","sap","salesforce","workday",
  "singapore","philippines","manila","cebu","hong","kong","europe","asia",
  "hr","dpo","npc","gdpr","dpa","pia","ropa","drl","irl","pradar","mfa","rbac",
  "tls","aes","sql","bir","sccs","s3","siem",
  "yes","no","got","sure","let","legal","basis","retention","consent",
  "contractual","necessity","employment","payroll","onboarding","portal",
  "system","data","privacy","sensitive","personal","information","contact",
  "medical","background","check","provider","vendor","cross","border","risk",
  "pre","post","separation","secure","deletion","encrypted","rest","transit",
]);

export function anonymizeText(input: string, _strict = true): AnonymizationResult {
  const replacements: { original: string; placeholder: string }[] = [];
  const track = (orig: string, ph: string) => {
    if (!replacements.find((r) => r.original === orig && r.placeholder === ph)) {
      replacements.push({ original: orig, placeholder: ph });
    }
  };

  // ---- Pass 1: build speaker map from transcript-style "Name (Role):" lines.
  // Same person => same placeholder. Cap at the unique speakers actually present.
  const speakerOrder: string[] = []; // ordered unique normalized keys
  const speakerToPlaceholder = new Map<string, string>();
  const speakerLineRegex = /^\s*(?:\[\d{1,2}:\d{2}\]\s*)?([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z]+)?)(\s*\([^)]+\))?\s*:/gm;

  // First: collect speakers in order of first appearance
  for (const line of input.split(/\r?\n/)) {
    const m = /^\s*(?:\[\d{1,2}:\d{2}\]\s*)?([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z]+)?)(\s*\([^)]+\))?\s*:/.exec(line);
    if (!m) continue;
    // Normalize: drop trailing initials/punctuation so "Maria S." == "Maria S" == "Maria"
    const firstName = m[1].split(/\s+/)[0].toLowerCase();
    if (NAME_STOPWORDS.has(firstName)) continue;
    if (!speakerToPlaceholder.has(firstName)) {
      speakerOrder.push(firstName);
      speakerToPlaceholder.set(firstName, `[PERSON_${speakerOrder.length}]`);
    }
  }

  let text = input;

  // Replace speaker labels (keep the colon, drop the role parenthetical)
  text = text.replace(speakerLineRegex, (match, name: string, _role: string | undefined) => {
    const firstName = name.split(/\s+/)[0].toLowerCase();
    const ph = speakerToPlaceholder.get(firstName);
    if (!ph) return match;
    track(name, ph);
    // Preserve any leading "[hh:mm] " timestamp from the original match
    const tsMatch = /^\s*(\[\d{1,2}:\d{2}\]\s*)/.exec(match);
    const ts = tsMatch ? tsMatch[1] : "";
    return `${ts}${ph}:`;
  });

  // ---- Pass 2: mask remaining PII tokens anywhere in the text.

  // Emails
  let emails = 0;
  text = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (m) => {
    emails++; track(m, "[EMAIL]"); return "[EMAIL]";
  });

  // Phone numbers (loose international/local)
  let phones = 0;
  text = text.replace(/(\+?\d[\d\s\-().]{7,}\d)/g, (m) => {
    phones++; track(m, "[PHONE]"); return "[PHONE]";
  });

  // ID-ish runs (8+ digits)
  let ids = 0;
  text = text.replace(/\b\d{8,}\b/g, (m) => {
    ids++; track(m, "[ID_NUMBER]"); return "[ID_NUMBER]";
  });

  // Mentions of mapped speakers by their first name elsewhere in the dialogue.
  for (const [firstName, ph] of speakerToPlaceholder) {
    const re = new RegExp(`\\b${firstName}\\b`, "gi");
    text = text.replace(re, (m) => { track(m, ph); return ph; });
  }

  const speakerMap: Record<string, string> = {};
  speakerToPlaceholder.forEach((ph) => { speakerMap[ph] = ph; });

  return {
    text,
    replacements,
    speakerMap,
    stats: {
      emails,
      phones,
      ids,
      persons: speakerToPlaceholder.size,
    },
  };
}
