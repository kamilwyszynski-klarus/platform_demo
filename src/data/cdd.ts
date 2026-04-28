/**
 * Mock CDD output for "Meridian Logistics Ltd". Fully fabricated. The shape
 * mirrors what an investment-team would expect from a CDD memo: a target
 * profile, market sizing, competitive landscape, customer concentration,
 * growth drivers, red flags, and an agent run log for texture.
 */

export interface CddTarget {
  name: string;
  sector: string;
  subSector: string;
  geography: string;
  hq: string;
  revenue: string;
  ebitda: string;
  ebitdaMargin: string;
  headcount: string;
  founded: number;
  ownership: string;
}

export interface MarketSizingPoint {
  year: string;
  tam: number;
  sam: number;
  som: number;
}

export interface CompetitorRow {
  name: string;
  share: number;
  revenueGbpM: number;
  growth3yPct: number;
  highlight?: boolean;
}

export interface ConcentrationSlice {
  name: string;
  value: number;
}

export interface InsightBullet {
  label: string;
  detail: string;
}

export interface RedFlag {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface AgentLogLine {
  step: string;
  detail: string;
  status: "ok" | "flag";
}

export const CDD_TARGET: CddTarget = {
  name: "Meridian Logistics Ltd",
  sector: "Industrials",
  subSector: "Third-party logistics (3PL)",
  geography: "UK & Northern Europe",
  hq: "Felixstowe, UK",
  revenue: "£142.4m FY24",
  ebitda: "£18.9m FY24",
  ebitdaMargin: "13.3%",
  headcount: "~620 FTE",
  founded: 2007,
  ownership: "Founder + management (74%) · MBO debt (26%)",
};

export const MARKET_SIZING: MarketSizingPoint[] = [
  { year: "FY21", tam: 8400, sam: 2150, som: 92 },
  { year: "FY22", tam: 9020, sam: 2360, som: 108 },
  { year: "FY23", tam: 9780, sam: 2580, som: 124 },
  { year: "FY24", tam: 10620, sam: 2820, som: 142 },
  { year: "FY25E", tam: 11420, sam: 3080, som: 168 },
  { year: "FY26E", tam: 12290, sam: 3360, som: 198 },
  { year: "FY27E", tam: 13180, sam: 3650, som: 233 },
];

export const COMPETITORS: CompetitorRow[] = [
  { name: "Greater Anglia Carriers", share: 18.2, revenueGbpM: 512, growth3yPct: 6.8 },
  { name: "Halton Freight Group", share: 14.7, revenueGbpM: 414, growth3yPct: 4.2 },
  { name: "Pennine Distribution", share: 9.1, revenueGbpM: 256, growth3yPct: 8.1 },
  { name: "Meridian Logistics", share: 5.0, revenueGbpM: 142, growth3yPct: 21.4, highlight: true },
  { name: "Cresford 3PL", share: 4.4, revenueGbpM: 124, growth3yPct: 11.7 },
  { name: "Westgate Cargo", share: 3.8, revenueGbpM: 107, growth3yPct: -1.3 },
];

export const CONCENTRATION: ConcentrationSlice[] = [
  { name: "Tier-1 Grocer A", value: 31.2 },
  { name: "Pan-EU Pharma B", value: 14.5 },
  { name: "Industrial OEM C", value: 9.8 },
  { name: "Beverage Group D", value: 7.4 },
  { name: "Apparel Brand E", value: 5.6 },
  { name: "Other (180+)", value: 31.5 },
];

export const GROWTH_DRIVERS: InsightBullet[] = [
  {
    label: "Refrigerated capacity",
    detail:
      "47% of FY24 revenue from temp-controlled lanes; £8.2m capex committed FY25 to add 28 reefers.",
  },
  {
    label: "Cross-border (UK ↔ NL/DE)",
    detail:
      "Post-Brexit customs offering live since FY22 — 19% revenue from EU lanes, +34% YoY.",
  },
  {
    label: "Tier-1 retailer wallet share",
    detail:
      "Tier-1 Grocer A SLA renewed Mar 2026 with +18% volume commitment over next 24 months.",
  },
  {
    label: "Operational tech stack",
    detail:
      "In-house TMS rolled out FY23 — drove gross margin from 11.4% (FY22) to 13.3% (FY24).",
  },
];

export const RED_FLAGS: RedFlag[] = [
  {
    severity: "high",
    title: "Customer concentration",
    detail:
      "Top customer (31.2% of revenue) on 24-month rolling contract. Loss event would impact ~£6.8m EBITDA at current margin.",
  },
  {
    severity: "medium",
    title: "Diesel exposure",
    detail:
      "Fuel surcharges renegotiated quarterly. 78% of fleet diesel; transition timeline to mixed BEV/diesel not formalised.",
  },
  {
    severity: "medium",
    title: "Single-site dependency",
    detail:
      "Felixstowe DC handles 62% of throughput. Q4 FY23 storm event reduced peak-week capacity by 28% for 9 days.",
  },
  {
    severity: "low",
    title: "Auditor turnover",
    detail:
      "External auditor changed FY23 → FY24. New firm raised 2 minor management points; remediation in progress.",
  },
];

export const AGENT_RUN_LOG: AgentLogLine[] = [
  { step: "00:01", detail: "Connected to data room (47 documents indexed)", status: "ok" },
  { step: "00:14", detail: "Reconciled FY22–FY24 P&L against trial balance", status: "ok" },
  { step: "00:38", detail: "Extracted top-50 customer revenue split from billing system", status: "ok" },
  { step: "01:12", detail: "Computed customer concentration — flagged Tier-1 dependency", status: "flag" },
  { step: "01:44", detail: "Built market sizing model from Eurostat + UK ONS feeds", status: "ok" },
  { step: "02:21", detail: "Triangulated competitor share via Companies House + trade press", status: "ok" },
  { step: "02:57", detail: "Reviewed customer-contract churn — no early-termination clauses found", status: "ok" },
  { step: "03:34", detail: "Cross-checked fleet composition against fuel-card spend", status: "ok" },
  { step: "04:08", detail: "Flagged single-site dependency at Felixstowe DC", status: "flag" },
  { step: "04:51", detail: "Composed 14-page draft memo · ready for partner review", status: "ok" },
];

export const CDD_META = {
  completedAgo: "Analysis completed 3h ago",
  sourcesReviewed: "47 documents reviewed",
  documentTypes: [
    "Audited accounts FY21–FY24",
    "Customer contracts (top 30)",
    "Trial balance & general ledger",
    "Eurostat freight transport time-series",
    "UK ONS road haulage statistics",
    "Companies House filings (12 competitors)",
  ],
} as const;

/* ---------------------------- Dataroom panel ---------------------------- */

export type CddDataroomCategory =
  | "Financials"
  | "Customer contracts"
  | "Market research"
  | "Competitor filings"
  | "Operational";

export interface CddDataroomField {
  label: string;
  value: string;
}

export interface CddDataroomFile {
  id: string;
  name: string;
  category: CddDataroomCategory;
  classification: string;
  ingestedAt: string;
  pages: number;
  sizeKb: number;
  extractionConfidence: number;
  fields: CddDataroomField[];
  summary: string;
}

export const CDD_DATAROOM_CATEGORIES: CddDataroomCategory[] = [
  "Financials",
  "Customer contracts",
  "Market research",
  "Competitor filings",
  "Operational",
];

export const CDD_DATAROOM_FILES: CddDataroomFile[] = [
  {
    id: "fy24-audited",
    name: "FY24 audited accounts.pdf",
    category: "Financials",
    classification: "Audited accounts",
    ingestedAt: "12 Apr 2026 · 09:14",
    pages: 78,
    sizeKb: 4280,
    extractionConfidence: 96,
    fields: [
      { label: "Revenue", value: "£142.4m" },
      { label: "EBITDA", value: "£18.9m" },
      { label: "Gross margin", value: "13.3%" },
      { label: "Auditor", value: "Crowley & Webb LLP" },
      { label: "Sign-off date", value: "07 Mar 2026" },
    ],
    summary:
      "Statutory accounts for the year ended 31 Dec 2024. Clean opinion. Revenue +18.4% YoY, EBITDA margin expanded 70bps on TMS rollout.",
  },
  {
    id: "fy23-audited",
    name: "FY23 audited accounts.pdf",
    category: "Financials",
    classification: "Audited accounts",
    ingestedAt: "12 Apr 2026 · 09:14",
    pages: 76,
    sizeKb: 4110,
    extractionConfidence: 95,
    fields: [
      { label: "Revenue", value: "£120.2m" },
      { label: "EBITDA", value: "£14.6m" },
      { label: "Gross margin", value: "12.6%" },
      { label: "Auditor", value: "Marsh Heaton (prior firm)" },
    ],
    summary:
      "Final year under prior auditor. Two minor management points raised; remediation tracked into FY24 close.",
  },
  {
    id: "fy21-22-audited",
    name: "FY21–22 audited accounts.pdf",
    category: "Financials",
    classification: "Audited accounts",
    ingestedAt: "12 Apr 2026 · 09:15",
    pages: 142,
    sizeKb: 7820,
    extractionConfidence: 94,
    fields: [
      { label: "FY22 revenue", value: "£101.5m" },
      { label: "FY21 revenue", value: "£86.7m" },
      { label: "FY22 EBITDA margin", value: "11.4%" },
      { label: "Auditor", value: "Marsh Heaton" },
    ],
    summary:
      "Combined statutory pack for FY21 and FY22. Pre-TMS cost base; reefer fleet investment first appears in Q3 FY22.",
  },
  {
    id: "trial-balance-q4",
    name: "Trial balance Q4 FY24.xlsx",
    category: "Financials",
    classification: "Trial balance & GL",
    ingestedAt: "12 Apr 2026 · 09:21",
    pages: 12,
    sizeKb: 248,
    extractionConfidence: 99,
    fields: [
      { label: "GL accounts", value: "1,284 active" },
      { label: "Reconciles to P&L", value: "Yes (within £4.2k)" },
      { label: "Period", value: "01 Oct – 31 Dec 2024" },
    ],
    summary:
      "Period-end trial balance. Used by the agent to cross-check P&L line items against ledger entries — full reconciliation passed.",
  },
  {
    id: "tier1-grocer-sla",
    name: "Tier-1 Grocer A — SLA renewal Mar 2026.pdf",
    category: "Customer contracts",
    classification: "Master service agreement",
    ingestedAt: "13 Apr 2026 · 11:02",
    pages: 38,
    sizeKb: 1820,
    extractionConfidence: 92,
    fields: [
      { label: "Term", value: "24 months rolling" },
      { label: "Volume commitment", value: "+18% over baseline" },
      { label: "Early-termination", value: "None" },
      { label: "% of FY24 revenue", value: "31.2%" },
    ],
    summary:
      "Renewal signed Mar 2026 with material volume uplift. Drives the customer-concentration red flag — single biggest line of revenue.",
  },
  {
    id: "pharma-msa",
    name: "Pan-EU Pharma B — MSA 2024.pdf",
    category: "Customer contracts",
    classification: "Master service agreement",
    ingestedAt: "13 Apr 2026 · 11:02",
    pages: 24,
    sizeKb: 1120,
    extractionConfidence: 90,
    fields: [
      { label: "Term", value: "36 months fixed" },
      { label: "Lanes", value: "UK ↔ NL/DE/FR" },
      { label: "% of FY24 revenue", value: "14.5%" },
    ],
    summary:
      "Cold-chain pharma agreement. Fixed-term — no renegotiation risk through FY26. Anchors the Northern European cross-border story.",
  },
  {
    id: "oem-services",
    name: "Industrial OEM C — services agreement.pdf",
    category: "Customer contracts",
    classification: "Services agreement",
    ingestedAt: "13 Apr 2026 · 11:03",
    pages: 18,
    sizeKb: 940,
    extractionConfidence: 88,
    fields: [
      { label: "Term", value: "12 months auto-renew" },
      { label: "Notice period", value: "90 days" },
      { label: "% of FY24 revenue", value: "9.8%" },
    ],
    summary:
      "Lower-stickiness contract; 90-day notice creates a small but real churn vector. Flagged for IC discussion.",
  },
  {
    id: "eurostat-freight",
    name: "Eurostat — Freight transport 2018–2025.xlsx",
    category: "Market research",
    classification: "Time series",
    ingestedAt: "11 Apr 2026 · 16:48",
    pages: 6,
    sizeKb: 412,
    extractionConfidence: 100,
    fields: [
      { label: "Geographies", value: "UK + EU27" },
      { label: "TAM CAGR (FY21–FY24)", value: "8.1%" },
    ],
    summary:
      "Public Eurostat dataset feeding the TAM/SAM model. Powers the Market sizing chart on the engagement screen.",
  },
  {
    id: "ons-road-haulage",
    name: "UK ONS — Road haulage statistics 2023.pdf",
    category: "Market research",
    classification: "Statistics report",
    ingestedAt: "11 Apr 2026 · 16:48",
    pages: 64,
    sizeKb: 3210,
    extractionConfidence: 97,
    fields: [
      { label: "Total UK 3PL spend", value: "£10.6bn" },
      { label: "Refrigerated share", value: "26.6%" },
    ],
    summary:
      "Official UK road-haulage volume and capacity figures. Used to triangulate Meridian's market share inside the SAM band.",
  },
  {
    id: "companies-house-pack",
    name: "Companies House — top 12 competitor filings pack.pdf",
    category: "Competitor filings",
    classification: "Statutory filings",
    ingestedAt: "11 Apr 2026 · 17:22",
    pages: 220,
    sizeKb: 12440,
    extractionConfidence: 91,
    fields: [
      { label: "Filers covered", value: "12 competitors" },
      { label: "Year coverage", value: "FY22 – FY24" },
    ],
    summary:
      "Bundle of CH filings the agent ingested to build the competitive landscape view. Extracted revenue, margin, and EBITDA per filer.",
  },
  {
    id: "trade-press-3pl",
    name: "UK 3PL market report — Logistics Manager Q4 2025.pdf",
    category: "Competitor filings",
    classification: "Industry report",
    ingestedAt: "11 Apr 2026 · 17:23",
    pages: 28,
    sizeKb: 1510,
    extractionConfidence: 93,
    fields: [
      { label: "Source", value: "Logistics Manager Magazine" },
      { label: "Publication", value: "Q4 2025 print issue" },
    ],
    summary:
      "Trade-press market commentary used to corroborate the share figures pulled from Companies House.",
  },
  {
    id: "fleet-fuel-card",
    name: "Fleet composition & fuel-card spend FY24.xlsx",
    category: "Operational",
    classification: "Operational data",
    ingestedAt: "13 Apr 2026 · 09:08",
    pages: 18,
    sizeKb: 682,
    extractionConfidence: 95,
    fields: [
      { label: "Diesel fleet share", value: "78%" },
      { label: "Reefer count", value: "94 (28 on order FY25)" },
      { label: "Felixstowe throughput", value: "62%" },
    ],
    summary:
      "Internal ops export. Powers the diesel-exposure and single-site-dependency red flags. Cross-checked against fuel-card spend by lane.",
  },
];
