/**
 * Manual Journal Testing — scripted demo content.
 *
 * Four screens, all data-driven from this module:
 *   - Live feed:  one in-flight "testing" row + 8 historical rows + a small
 *                 filler pool used by the scripted "pop in 3 extras then idle"
 *                 reveal.
 *   - Risk engine rail: the 8 assertions the agent runs against every entry.
 *   - Exceptions queue: 6 hardcoded flagged journals (3 high-severity, 3 medium).
 *   - Assurance dashboard: stats, exceptions-by-assertion bars, risk heat-map,
 *                          audit evidence store rows.
 *
 * The journal-detail popup pulls from `DETAIL_EXAMPLES` keyed by JE-id.
 * JE-2846 (FX reclass · currency mismatch) is the "wow" example with the
 * richest detail — that's the one the presenter clicks first.
 */

/* ============================================================ live feed === */

export type FeedStatus = "passed" | "review" | "flagged" | "testing";

export interface FeedRow {
  /** Stable id used for keys + popup dispatch. JE-id is the user-facing label. */
  id: string;
  /** Posting time in HH:MM. */
  time: string;
  narrative: string;
  amountGbp: number;
  user: string;
  status: FeedStatus;
}

/** The journal that is mid-test on first paint. Resolves to passed and is
 *  immediately re-used as the first historical row. */
export const FEED_INITIAL_TESTING: FeedRow = {
  id: "JE-2848",
  time: "14:36",
  narrative: "Bank reconciliation accrual",
  amountGbp: 6_218.5,
  user: "S.Holloway",
  status: "testing",
};

/** Eight historical rows shown below the testing row on first paint. Newest
 *  first. Mix: 6 passed · 1 review (JE-2846, the hero) · 1 flagged. */
export const FEED_HISTORY: FeedRow[] = [
  {
    id: "JE-2847",
    time: "14:32",
    narrative: "Travel reimbursement — Q4 reconciliation",
    amountGbp: 1_842.18,
    user: "S.Holloway",
    status: "passed",
  },
  {
    id: "JE-2846",
    time: "14:28",
    narrative: "FX reclass intercompany",
    amountGbp: 125_000,
    user: "M.Patel",
    status: "review",
  },
  {
    id: "JE-2845",
    time: "14:27",
    narrative: "Legal provision — settlement",
    amountGbp: 50_000,
    user: "T.Banks",
    status: "flagged",
  },
  {
    id: "JE-2844",
    time: "14:22",
    narrative: "Agency-staff invoice — week 53",
    amountGbp: 22_104,
    user: "S.Holloway",
    status: "passed",
  },
  {
    id: "JE-2843",
    time: "14:18",
    narrative: "IT licence true-up — annual",
    amountGbp: 4_840,
    user: "S.Holloway",
    status: "passed",
  },
  {
    id: "JE-2842",
    time: "14:14",
    narrative: "Inbound freight cap. to inventory",
    amountGbp: 31_407.6,
    user: "M.Ofori",
    status: "passed",
  },
  {
    id: "JE-2841",
    time: "14:09",
    narrative: "Marketing retainer — December",
    amountGbp: 8_412,
    user: "M.Ofori",
    status: "passed",
  },
  {
    id: "JE-2840",
    time: "14:04",
    narrative: "COGS distribution — Northbrook accrual",
    amountGbp: 14_280.5,
    user: "S.Holloway",
    status: "passed",
  },
];

/** Three filler journals used by the scripted live-feed reveal (Q4: pop in 3
 *  extras then idle). Each one enters as a "testing" row above the previous
 *  testing row, which simultaneously resolves to "passed". After the third
 *  filler enters, it stays in the testing state forever — the screen still
 *  feels alive without scrolling away the rows the presenter wants to click. */
export const FEED_FILLER_POOL: FeedRow[] = [
  {
    id: "JE-2849",
    time: "14:38",
    narrative: "PR retainer — Q4 final tranche",
    amountGbp: 2_984.7,
    user: "S.Holloway",
    status: "testing",
  },
  {
    id: "JE-2850",
    time: "14:40",
    narrative: "Office supplies — central spend",
    amountGbp: 412.34,
    user: "M.Ofori",
    status: "testing",
  },
  {
    id: "JE-2851",
    time: "14:42",
    narrative: "Restated bonus accrual — FY25",
    amountGbp: 184_750,
    user: "T.Banks",
    status: "testing",
  },
];

/* ========================================================= risk engine === */

/** The 8 assertions the agent runs against every journal. Visible as a list
 *  on the Live feed; not interactive in v1. */
export const RISK_ENGINE_ASSERTIONS = [
  "Authorisation",
  "Period cut-off",
  "Currency consistency",
  "Evidence sufficiency",
  "Threshold approval",
  "Round-number scrutiny",
  "After-hours posting",
  "Frequency anomaly",
] as const;

/* ============================================================ exceptions === */

export type FlagSeverity = "medium" | "high";

export interface ExceptionFlag {
  label: string;
  severity: FlagSeverity;
}

export type ProposedAction = "Route to reviewer" | "Escalate";

export interface ExceptionRow {
  id: string;
  time: string;
  narrative: string;
  amountGbp: number;
  user: string;
  flags: ExceptionFlag[];
  proposedAction: ProposedAction;
}

/** Six hardcoded exceptions. Composition: 3 high-severity + 3 medium, matching
 *  the header strip's "Queue: 6 exceptions · 3 high-severity" line. */
export const EXCEPTIONS: ExceptionRow[] = [
  {
    id: "JE-2846",
    time: "14:28",
    narrative: "FX reclass intercompany",
    amountGbp: 125_000,
    user: "M.Patel",
    flags: [{ label: "Currency mismatch", severity: "medium" }],
    proposedAction: "Route to reviewer",
  },
  {
    id: "JE-2845",
    time: "14:27",
    narrative: "Legal provision — settlement",
    amountGbp: 50_000,
    user: "T.Banks",
    flags: [
      { label: "Round number", severity: "high" },
      { label: "After-hours", severity: "high" },
    ],
    proposedAction: "Escalate",
  },
  {
    id: "JE-2831",
    time: "11:54",
    narrative: "Reclass adjustment — opex to capex",
    amountGbp: 48_500,
    user: "S.Holloway",
    flags: [{ label: "Just-under threshold", severity: "medium" }],
    proposedAction: "Route to reviewer",
  },
  {
    id: "JE-2812",
    time: "10:18",
    narrative: "Inventory write-down — slow-moving SKUs",
    amountGbp: 92_400,
    user: "M.Ofori",
    flags: [{ label: "Evidence gap", severity: "medium" }],
    proposedAction: "Route to reviewer",
  },
  {
    id: "JE-2789",
    time: "09:02",
    narrative: "Bonus accrual — exec restatement",
    amountGbp: 180_000,
    user: "T.Banks",
    flags: [
      { label: "Round number", severity: "high" },
      { label: "Frequency anomaly", severity: "high" },
    ],
    proposedAction: "Escalate",
  },
  {
    id: "JE-2754",
    time: "22:41",
    narrative: "Provision release — onerous contract",
    amountGbp: 75_000,
    user: "T.Banks",
    flags: [
      { label: "After-hours", severity: "high" },
      { label: "Frequency anomaly", severity: "high" },
    ],
    proposedAction: "Escalate",
  },
];

export const EXCEPTIONS_HEADER = {
  total: EXCEPTIONS.length,
  highSeverity: EXCEPTIONS.filter((e) => e.flags.some((f) => f.severity === "high")).length,
  oldestAgo: "2h ago",
} as const;

/* ============================================================= dashboard === */

export interface DashboardStat {
  label: string;
  value: string;
  caption: string;
}

export interface AssertionCount {
  label: string;
  count: number;
}

export interface DashboardHeatmap {
  rows: number;
  cols: number;
  /** Intensities 0..1, row-major. Length must equal rows * cols. */
  cells: number[];
  /** 0-based index of the standout cell — rendered with amber/red emphasis. */
  hotspotIndex: number;
}

export interface EvidenceRow {
  id: string;
  status: "passed" | "review" | "flagged";
  artefactCount: number;
  decision: string;
  timestamp: string;
}

export const DASHBOARD = {
  stats: [
    { label: "Coverage", value: "100%", caption: "vs 5% batch sample" },
    { label: "Tested", value: "2,847", caption: "this quarter" },
    { label: "Exceptions", value: "34", caption: "1.2% rate" },
    { label: "Hours saved", value: "~480", caption: "vs offshore baseline" },
  ] satisfies DashboardStat[],
  assertionCounts: [
    { label: "Currency mismatch", count: 12 },
    { label: "Round number", count: 8 },
    { label: "After-hours", count: 6 },
    { label: "Evidence gap", count: 5 },
    { label: "Threshold", count: 3 },
  ] satisfies AssertionCount[],
  heatmap: {
    rows: 4,
    cols: 8,
    /* Mostly low-intensity cells, with one standout at index 18 (row 2, col 2)
     * representing a user × GL × posting-time concentration. */
    cells: [
      0.06, 0.12, 0.08, 0.14, 0.04, 0.02, 0.07, 0.05,
      0.14, 0.20, 0.24, 0.30, 0.18, 0.10, 0.12, 0.16,
      0.10, 0.18, 0.95, 0.42, 0.22, 0.10, 0.20, 0.06,
      0.04, 0.10, 0.14, 0.10, 0.08, 0.05, 0.06, 0.04,
    ],
    hotspotIndex: 18,
  } satisfies DashboardHeatmap,
  evidenceStore: [
    { id: "JE-2847", status: "passed", artefactCount: 3, decision: "auto", timestamp: "14:32 28/04" },
    { id: "JE-2846", status: "review", artefactCount: 3, decision: "M.Patel override", timestamp: "14:28 28/04" },
    { id: "JE-2845", status: "flagged", artefactCount: 2, decision: "escalated", timestamp: "14:27 28/04" },
    { id: "JE-2844", status: "passed", artefactCount: 1, decision: "auto", timestamp: "14:22 28/04" },
  ] satisfies EvidenceRow[],
} as const;

/* ============================================================== popup === */

export type RiskVerdict = "pass" | "flag";

export interface RiskStep {
  verdict: RiskVerdict;
  assertion: string;
  justification: string;
  /** When true the assertion is rendered with amber border + heavier weight.
   *  Used for the hero "Currency mismatch" entry on JE-2846. Static, never
   *  animated. */
  emphasis?: boolean;
}

export interface GlLine {
  side: "Dr" | "Cr";
  account: string;
  currency: string;
  amount: number;
}

export interface EvidenceArtefact {
  filename: string;
  subtitle: string;
}

export type PopupVerdictTone = "review" | "flagged" | "passed";

export interface JournalDetailExample {
  id: string;
  narrative: string;
  amountGbp: number;
  currency: string;
  user: string;
  time: string;
  date: string;
  postedDate: string;
  verdict: { tone: PopupVerdictTone; label: string };
  glLines: GlLine[];
  evidence: EvidenceArtefact[];
  riskSteps: RiskStep[];
  proposedAction: string;
}

/** Keyed by JE-id. Only journals that need a fully-populated popup live here.
 *  JE-2846 is the hero — currency mismatch is the story. */
export const DETAIL_EXAMPLES: Record<string, JournalDetailExample> = {
  "JE-2846": {
    id: "JE-2846",
    narrative: "FX reclass intercompany",
    amountGbp: 125_000,
    currency: "USD",
    user: "M.Patel",
    time: "14:28",
    date: "28 Apr 2026",
    postedDate: "28/04/2026 14:28",
    verdict: { tone: "review", label: "review · currency mismatch" },
    glLines: [
      { side: "Dr", account: "5400 Intercomp AR", currency: "USD", amount: 125_000 },
      { side: "Cr", account: "4200 FX Gain", currency: "USD", amount: 125_000 },
    ],
    evidence: [
      { filename: "calculation.xlsx", subtitle: "shows amounts in AUD" },
      { filename: "approval-email.msg", subtitle: "from D.Chen · 28 Apr 09:14" },
      { filename: "intercomp-agreement.pdf", subtitle: "reference doc" },
    ],
    riskSteps: [
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "D.Chen is on the approval matrix for intercompany ≥ £100k.",
      },
      {
        verdict: "pass",
        assertion: "Threshold",
        justification: "£125k ≥ director sign-off; approval present in evidence bundle.",
      },
      {
        verdict: "flag",
        assertion: "Currency mismatch",
        justification:
          "calculation.xlsx denominates the underlying balance in AUD; the journal posts the same amount in USD with no FX conversion shown.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Posted within Q1 close window (28 Apr).",
      },
      {
        verdict: "pass",
        assertion: "Evidence sufficiency",
        justification: "3 artefacts matched: calculation, approval, agreement.",
      },
    ],
    proposedAction: "Route to human reviewer",
  },

  "JE-2845": {
    id: "JE-2845",
    narrative: "Legal provision — settlement",
    amountGbp: 50_000,
    currency: "GBP",
    user: "T.Banks",
    time: "14:27",
    date: "28 Apr 2026",
    postedDate: "28/04/2026 14:27",
    verdict: { tone: "flagged", label: "flagged · escalation" },
    glLines: [
      { side: "Dr", account: "7200 Legal & professional", currency: "GBP", amount: 50_000 },
      { side: "Cr", account: "2400 Accrued liabilities", currency: "GBP", amount: 50_000 },
    ],
    evidence: [
      { filename: "settlement-summary.docx", subtitle: "draft · counsel pending" },
      { filename: "board-minutes-q1.pdf", subtitle: "ref. agenda item 7" },
    ],
    riskSteps: [
      {
        verdict: "flag",
        assertion: "Round number",
        justification: "£50,000.00 sits exactly on a £10k band — top quartile of round-amount anomalies.",
        emphasis: true,
      },
      {
        verdict: "flag",
        assertion: "After-hours",
        justification: "Posted 14:27 on a UK public holiday (Easter Monday) — outside the user's normal posting window.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "T.Banks is on the approval matrix for provisions ≥ £25k.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Posted within Q1 close window.",
      },
      {
        verdict: "flag",
        assertion: "Evidence sufficiency",
        justification: "Only draft counsel summary attached; no executed settlement document.",
      },
    ],
    proposedAction: "Escalate to engagement partner",
  },

  "JE-2831": {
    id: "JE-2831",
    narrative: "Reclass adjustment — opex to capex",
    amountGbp: 48_500,
    currency: "GBP",
    user: "S.Holloway",
    time: "11:54",
    date: "27 Apr 2026",
    postedDate: "27/04/2026 11:54",
    verdict: { tone: "review", label: "review · just-under threshold" },
    glLines: [
      { side: "Dr", account: "1700 Fixed assets — fit-out", currency: "GBP", amount: 48_500 },
      { side: "Cr", account: "6800 Premises — repairs", currency: "GBP", amount: 48_500 },
    ],
    evidence: [
      { filename: "capex-memo-q1.docx", subtitle: "internal memo · S.Holloway" },
      { filename: "supplier-quote.pdf", subtitle: "Castell · 12 Apr" },
    ],
    riskSteps: [
      {
        verdict: "flag",
        assertion: "Just-under threshold",
        justification:
          "£48,500 sits 3% below the £50,000 director sign-off threshold for reclassifications. Pattern-match flagged across the user's last 6 reclasses.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "S.Holloway is approver-of-record for reclassifications < £50k.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Within Q1 close window.",
      },
      {
        verdict: "pass",
        assertion: "Evidence sufficiency",
        justification: "Memo + supplier quote attached.",
      },
    ],
    proposedAction: "Route to human reviewer",
  },

  "JE-2812": {
    id: "JE-2812",
    narrative: "Inventory write-down — slow-moving SKUs",
    amountGbp: 92_400,
    currency: "GBP",
    user: "M.Ofori",
    time: "10:18",
    date: "26 Apr 2026",
    postedDate: "26/04/2026 10:18",
    verdict: { tone: "review", label: "review · evidence gap" },
    glLines: [
      { side: "Dr", account: "5100 Inventory write-down", currency: "GBP", amount: 92_400 },
      { side: "Cr", account: "1200 Inventory — finished goods", currency: "GBP", amount: 92_400 },
    ],
    evidence: [
      { filename: "stock-aging-q1.xlsx", subtitle: "WMS export · 25 Apr" },
    ],
    riskSteps: [
      {
        verdict: "flag",
        assertion: "Evidence sufficiency",
        justification:
          "Only the WMS aging export is attached; expected supporting items (impairment memo, NRV calculation, manager sign-off) not found in the bundle.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "M.Ofori is approver-of-record for inventory adjustments < £100k.",
      },
      {
        verdict: "pass",
        assertion: "Threshold",
        justification: "Below £100k director threshold.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Within Q1 close window.",
      },
      {
        verdict: "pass",
        assertion: "Currency consistency",
        justification: "Single-currency entry, no FX exposure.",
      },
    ],
    proposedAction: "Route to human reviewer",
  },

  "JE-2789": {
    id: "JE-2789",
    narrative: "Bonus accrual — exec restatement",
    amountGbp: 180_000,
    currency: "GBP",
    user: "T.Banks",
    time: "09:02",
    date: "25 Apr 2026",
    postedDate: "25/04/2026 09:02",
    verdict: { tone: "flagged", label: "flagged · escalation" },
    glLines: [
      { side: "Dr", account: "6100 Compensation — variable", currency: "GBP", amount: 180_000 },
      { side: "Cr", account: "2400 Accrued liabilities", currency: "GBP", amount: 180_000 },
    ],
    evidence: [
      { filename: "comp-committee-minutes.pdf", subtitle: "draft · 22 Apr" },
      { filename: "calc-bonus-restatement.xlsx", subtitle: "T.Banks · 24 Apr" },
    ],
    riskSteps: [
      {
        verdict: "flag",
        assertion: "Round number",
        justification: "£180,000.00 sits exactly on a £20k band — restated amount lands on round number when prior accrual didn't.",
        emphasis: true,
      },
      {
        verdict: "flag",
        assertion: "Frequency anomaly",
        justification: "Third bonus restatement by this user this quarter; baseline cadence is 0–1 per quarter.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "T.Banks is on approval matrix for compensation accruals.",
      },
      {
        verdict: "pass",
        assertion: "Threshold",
        justification: "Director sign-off present in the comp-committee draft.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Within Q1 close window.",
      },
    ],
    proposedAction: "Escalate to engagement partner",
  },

  "JE-2754": {
    id: "JE-2754",
    narrative: "Provision release — onerous contract",
    amountGbp: 75_000,
    currency: "GBP",
    user: "T.Banks",
    time: "22:41",
    date: "23 Apr 2026",
    postedDate: "23/04/2026 22:41",
    verdict: { tone: "flagged", label: "flagged · escalation" },
    glLines: [
      { side: "Dr", account: "2410 Provisions — onerous contract", currency: "GBP", amount: 75_000 },
      { side: "Cr", account: "7200 Legal & professional", currency: "GBP", amount: 75_000 },
    ],
    evidence: [
      { filename: "contract-status-memo.docx", subtitle: "T.Banks · 23 Apr" },
      { filename: "termination-letter.pdf", subtitle: "counterparty · 21 Apr" },
    ],
    riskSteps: [
      {
        verdict: "flag",
        assertion: "After-hours",
        justification: "Posted 22:41 — outside the user's normal posting window (09:00–18:30) for the last 12 months.",
        emphasis: true,
      },
      {
        verdict: "flag",
        assertion: "Frequency anomaly",
        justification: "Second provision-release this user has posted within seven days; baseline is < 1 per quarter.",
        emphasis: true,
      },
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "T.Banks is on the approval matrix for provisions ≥ £25k.",
      },
      {
        verdict: "pass",
        assertion: "Round number",
        justification: "£75,000 supported by counterparty termination letter; not a round-amount anomaly.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Within Q1 close window.",
      },
    ],
    proposedAction: "Escalate to engagement partner",
  },

  "JE-2847": {
    id: "JE-2847",
    narrative: "Travel reimbursement — Q4 reconciliation",
    amountGbp: 1_842.18,
    currency: "GBP",
    user: "S.Holloway",
    time: "14:32",
    date: "28 Apr 2026",
    postedDate: "28/04/2026 14:32",
    verdict: { tone: "passed", label: "passed · all checks" },
    glLines: [
      { side: "Dr", account: "6300 Travel & subsistence", currency: "GBP", amount: 1_842.18 },
      { side: "Cr", account: "1100 Trade payables", currency: "GBP", amount: 1_842.18 },
    ],
    evidence: [
      { filename: "expense-summary-q4.pdf", subtitle: "auto-generated · Concur" },
      { filename: "approver-trail.msg", subtitle: "from M.Ofori · 27 Apr" },
    ],
    riskSteps: [
      {
        verdict: "pass",
        assertion: "Authorisation",
        justification: "M.Ofori is on the approval matrix for T&E.",
      },
      {
        verdict: "pass",
        assertion: "Threshold",
        justification: "Below £5k auto-approve band; matched policy.",
      },
      {
        verdict: "pass",
        assertion: "Period cut-off",
        justification: "Within Q1 close window.",
      },
      {
        verdict: "pass",
        assertion: "Evidence sufficiency",
        justification: "Concur summary + approver trail matched.",
      },
      {
        verdict: "pass",
        assertion: "Frequency anomaly",
        justification: "Within user's normal cadence.",
      },
    ],
    proposedAction: "Auto-pass",
  },
};
