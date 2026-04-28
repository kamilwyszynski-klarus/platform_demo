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
