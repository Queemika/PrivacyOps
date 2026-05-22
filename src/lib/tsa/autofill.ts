// Lightweight transcript → Tech Stack autofill. Scans a transcript blob for
// vendor / tool keywords and returns suggested patches keyed by Tech Stack row id.
// Pure string matching — no AI calls — so it is safe to run on every paste.

import { TECH_STACK_FULL } from "@/lib/templates/techStackFull";

export interface TsaSuggestion {
  rowId: string;
  tool?: string;
  status?: "In Place" | "Partial" | "Not in Place";
  remarks?: string;
  match: string;
}

const KEYWORDS: Array<{ rowMatch: RegExp; tool?: string; pattern: RegExp; status?: TsaSuggestion["status"] }> = [
  { rowMatch: /mfa|multi.?factor/i, tool: "Microsoft Authenticator", pattern: /\b(mfa|authenticator|2fa|otp)\b/i, status: "In Place" },
  { rowMatch: /siem/i, tool: "Splunk", pattern: /\b(splunk|sentinel|qradar|siem)\b/i, status: "In Place" },
  { rowMatch: /dlp|data loss/i, tool: "Microsoft Purview DLP", pattern: /\b(purview|symantec dlp|forcepoint|dlp policy)\b/i, status: "In Place" },
  { rowMatch: /endpoint|edr|antivirus/i, tool: "CrowdStrike Falcon", pattern: /\b(crowdstrike|defender|sentinelone|edr|antivirus)\b/i, status: "In Place" },
  { rowMatch: /firewall/i, tool: "Palo Alto", pattern: /\b(palo alto|fortinet|fortigate|firewall)\b/i, status: "In Place" },
  { rowMatch: /vpn/i, tool: "Cisco AnyConnect", pattern: /\b(vpn|anyconnect|globalprotect)\b/i, status: "In Place" },
  { rowMatch: /backup/i, tool: "Veeam", pattern: /\b(veeam|commvault|backup)\b/i, status: "In Place" },
  { rowMatch: /pam|privileged/i, tool: "CyberArk", pattern: /\b(cyberark|beyondtrust|privileged access)\b/i, status: "In Place" },
  { rowMatch: /encryption|key/i, tool: "Azure Key Vault", pattern: /\b(key vault|kms|encryption at rest)\b/i, status: "In Place" },
  { rowMatch: /directory|identity/i, tool: "Azure AD / Entra ID", pattern: /\b(azure ad|entra|active directory|okta)\b/i, status: "In Place" },
];

export function suggestFromTranscript(text: string): TsaSuggestion[] {
  if (!text || text.length < 20) return [];
  const out: TsaSuggestion[] = [];
  for (const kw of KEYWORDS) {
    const m = text.match(kw.pattern);
    if (!m) continue;
    const row = TECH_STACK_FULL.find(r => kw.rowMatch.test(r.dpaRequirement) || kw.rowMatch.test(r.component));
    if (!row) continue;
    out.push({ rowId: row.id, tool: kw.tool, status: kw.status, match: m[0], remarks: `Mentioned in transcript: "${m[0]}"` });
  }
  return out;
}
