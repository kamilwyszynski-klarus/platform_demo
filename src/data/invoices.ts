/**
 * Three fully-fabricated mock invoices for the live invoice-processing demo.
 *
 * No real vendors. No real numbers. The agent stream queue is hand-scripted
 * per invoice so each press of "Run" produces the same sequence — the demo
 * is deterministic and there is no LLM in the loop.
 */

export type StreamLineKind =
  | "info" // neutral progress line
  | "muted" // dim contextual sub-line
  | "warn" // amber/yellow flag — risk surfaced
  | "success" // green tick — check passed
  | "header"; // brighter section header

export interface StreamLine {
  text: string;
  kind: StreamLineKind;
  /** ms before this line appears after the previous one. Defaults to 350. */
  delay?: number;
}

export type FlagSeverity = "high" | "medium" | "low";

export interface InvoiceFlag {
  severity: FlagSeverity;
  title: string;
  detail: string;
}

export interface InvoiceLineItem {
  description: string;
  net: number;
}

export interface MockInvoice {
  id: string;
  filename: string;
  fileSizeKb: number;
  pageCount: number;
  receivedAt: string;
  /** Single-character label for the thumbnail tile (kept simple — no real PDF). */
  thumbnailLabel: string;
  /** Short status the recent-uploads list shows when no run has happened yet. */
  preRunSummary: string;
  stream: StreamLine[];
  extracted: {
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    poNumber: string | null;
    poNumberHandwritten?: boolean;
    currency: string;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  flags: InvoiceFlag[];
  /** True when the agent passes everything — used to swap the headline copy. */
  cleanThrough: boolean;
  status: "Processing" | "Pending review" | "Reviewed" | "Cleared";
  processedAt: string;
  pdfFile: string;
}

export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv-biffa-2025-11",
    filename: "invoice-01.pdf",
    fileSizeKb: 202,
    pageCount: 1,
    receivedAt: "Nov 25, 11:14",
    thumbnailLabel: "PDF",
    preRunSummary: "Pending review",
    stream: [
      { text: "› Reading document…", kind: "info", delay: 200 },
      { text: "› Extracting invoice header…", kind: "info", delay: 320 },
      { text: "› Handwritten PO detected in page header", kind: "warn", delay: 520 },
      { text: "› Parsing line items… 9 dockets detected", kind: "info", delay: 520 },
      {
        text: "⚠ Identical value pattern found across all line items",
        kind: "warn",
        delay: 680,
      },
      { text: "› Totals reconciled: £62.64 + VAT £12.53 = £75.17", kind: "success", delay: 520 },
      { text: "› Extraction complete. 2 review points raised.", kind: "header", delay: 420 },
    ],
    extracted: {
      supplier: "Biffa Waste Services Limited",
      invoiceNumber: "658C010857",
      invoiceDate: "2025-11-25",
      poNumber: "46953457",
      poNumberHandwritten: true,
      currency: "GBP",
      lineItems: [
        {
          description: "9x waste collection dockets @ £7.83 (30/09/25 to 24/10/25)",
          net: 62.64,
        },
      ],
      subtotal: 62.64,
      vat: 12.53,
      total: 75.17,
    },
    flags: [
      {
        severity: "medium",
        title: "Handwritten PO number detected",
        detail:
          "PO number 46953457 appears handwritten at the top of the document and should be validated before payment routing.",
      },
      {
        severity: "low",
        title: "Identical line-item values",
        detail:
          "All 9 line items are £7.83, suggesting possible templated docket entry patterns.",
      },
    ],
    cleanThrough: false,
    status: "Pending review",
    processedAt: "2026-04-27 09:18",
    pdfFile: "invoice-01.pdf",
  },
  {
    id: "inv-edmundson-2026-01",
    filename: "invoice-02.pdf",
    fileSizeKb: 176,
    pageCount: 1,
    receivedAt: "Jan 12, 10:42",
    thumbnailLabel: "PDF",
    preRunSummary: "Pending review",
    stream: [
      { text: "› Reading document…", kind: "info", delay: 200 },
      { text: "› Extracting header fields…", kind: "info", delay: 420 },
      {
        text: '› Supplier identified: "Edmundson Electrical Ltd"',
        kind: "info",
        delay: 520,
      },
      { text: "⚠ Handwritten PO number detected", kind: "warn", delay: 620 },
      {
        text: "⚠ PO 47125975 not found in approved vendor PO database",
        kind: "warn",
        delay: 760,
      },
      { text: "› Line item extraction complete", kind: "info", delay: 500 },
      { text: "› Totals reconciled: £71.34 + VAT £14.27 = £85.61", kind: "success", delay: 520 },
      { text: "› Extraction complete. 2 review points raised.", kind: "header", delay: 380 },
    ],
    extracted: {
      supplier: "Edmundson Electrical Ltd",
      invoiceNumber: "241-643518",
      invoiceDate: "2026-01-12",
      poNumber: "47125975",
      poNumberHandwritten: true,
      currency: "GBP",
      lineItems: [
        {
          description: "5x SQD SE10B120 MCB SP Type B 20A @ £23.78, discount 40%",
          net: 71.34,
        },
      ],
      subtotal: 71.34,
      vat: 14.27,
      total: 85.61,
    },
    flags: [
      {
        severity: "medium",
        title: "Handwritten PO number detected",
        detail:
          "PO number 47125975 appears handwritten and should be validated before AP routing.",
      },
      {
        severity: "medium",
        title: "PO not found in approved vendor PO database",
        detail:
          "No exact match found for PO 47125975 in the approved vendor PO records.",
      },
    ],
    cleanThrough: false,
    status: "Pending review",
    processedAt: "2026-04-27 08:52",
    pdfFile: "invoice-02.pdf",
  },
  {
    id: "inv-eyre-2026-01",
    filename: "invoice-03.pdf",
    fileSizeKb: 190,
    pageCount: 1,
    receivedAt: "Jan 28, 13:20",
    thumbnailLabel: "PDF",
    preRunSummary: "Pending review",
    stream: [
      { text: "› Reading document…", kind: "info", delay: 200 },
      { text: "› Extracting header fields and references…", kind: "info", delay: 420 },
      {
        text: '› Supplier identified: "Eyre & Elliston Ltd"',
        kind: "info",
        delay: 520,
      },
      { text: "⚠ Handwritten PO number detected", kind: "warn", delay: 620 },
      {
        text: "⚠ High-discount clustering identified (85%, 94%, 40%)",
        kind: "warn",
        delay: 740,
      },
      { text: "› Extracting line items… 6 items detected", kind: "info", delay: 560 },
      { text: "› Totals reconciled: £122.23 + VAT £24.45 = £146.68", kind: "success", delay: 520 },
      {
        text: "› Extraction complete. 2 review points raised.",
        kind: "header",
        delay: 420,
      },
    ],
    extracted: {
      supplier: "Eyre & Elliston Ltd",
      invoiceNumber: "0047/00104046",
      invoiceDate: "2026-01-28",
      poNumber: "PO 47488321",
      poNumberHandwritten: true,
      currency: "GBP",
      lineItems: [
        { description: "B/G WP53 Fused Connection Unit 13A Switched c/w Neon IP66", net: 16.13 },
        { description: "B/G 855ARCD 13A Type A RCD Fused Connection Unit", net: 21.43 },
        {
          description: "M/Tufflex MSSB73WH Universal Round Corner Box 44mm 1Gang + K/Os (-85%)",
          net: 3.19,
        },
        {
          description: "Wiska 10110404 85x85x51 Combi 308/221 + Wagos Black (-40%)",
          net: 4.37,
        },
        { description: "100 MT 6242YH 2.5mm Grey Flat Twin + Earth Cable", net: 67.73 },
        {
          description: "2 LG M/Tufflex MMT2SFWH Mini Trunking 3mtr (-94%)",
          net: 9.38,
        },
      ],
      subtotal: 122.23,
      vat: 24.45,
      total: 146.68,
    },
    flags: [
      {
        severity: "medium",
        title: "Handwritten PO number detected",
        detail:
          "PO 47488321 appears handwritten in cursive and requires review.",
      },
      {
        severity: "medium",
        title: "Unusual discount clustering",
        detail:
          "Multiple line items include deep discounts (85%, 94%, 40%), unusual for this supplier profile.",
      },
    ],
    cleanThrough: false,
    status: "Pending review",
    processedAt: "2026-04-27 08:05",
    pdfFile: "invoice-03.pdf",
  },
  {
    id: "inv-jon-mcdevitt-2026-02",
    filename: "invoice-04.pdf",
    fileSizeKb: 91,
    pageCount: 1,
    receivedAt: "Feb 09, 09:44",
    thumbnailLabel: "PDF",
    preRunSummary: "Pending review",
    stream: [
      { text: "› Reading document…", kind: "info", delay: 200 },
      { text: "› Extracting invoice header…", kind: "info", delay: 380 },
      { text: "⚠ Handwritten PO number detected", kind: "warn", delay: 520 },
      { text: "⚠ No VAT charged and no VAT registration present", kind: "warn", delay: 640 },
      { text: "⚠ Service category mismatch against expected supplier activity", kind: "warn", delay: 680 },
      { text: "⚠ Round total with no line-item breakdown", kind: "warn", delay: 520 },
      { text: "› Extraction complete. 4 review points raised.", kind: "header", delay: 420 },
    ],
    extracted: {
      supplier: "Jon McDevitt Electrical Services",
      invoiceNumber: "25-431",
      invoiceDate: "2026-02-09",
      poNumber: "PO 47574165",
      poNumberHandwritten: true,
      currency: "GBP",
      lineItems: [{ description: "Musical Entertainment Services on 9th February 2026", net: 90.0 }],
      subtotal: 90.0,
      vat: 0.0,
      total: 90.0,
    },
    flags: [
      {
        severity: "medium",
        title: "Handwritten PO number detected",
        detail:
          "PO 47574165 appears handwritten in cursive and should be validated.",
      },
      {
        severity: "low",
        title: "No VAT registered/charged",
        detail:
          "No VAT number and no VAT charge shown on invoice.",
      },
      {
        severity: "medium",
        title: "Service category mismatch",
        detail:
          "Invoice service category 'Musical Entertainment Services' is unusual for the supplier list.",
      },
      {
        severity: "low",
        title: "Round total with no breakdown",
        detail:
          "Single round-value total (£90.00) without a line-item breakdown.",
      },
    ],
    cleanThrough: false,
    status: "Pending review",
    processedAt: "2026-04-27 07:49",
    pdfFile: "invoice-04.pdf",
  },
  {
    id: "inv-2ea-2026-04",
    filename: "invoice-05.pdf",
    fileSizeKb: 114,
    pageCount: 1,
    receivedAt: "Jan 12, 14:09",
    thumbnailLabel: "PDF",
    preRunSummary: "Pending review",
    stream: [
      { text: "› Reading document…", kind: "info", delay: 200 },
      { text: "› Supplier and invoice identifiers parsed.", kind: "info", delay: 340 },
      { text: "⚠ No PO number present on document", kind: "warn", delay: 520 },
      { text: "⚠ Single-line consulting invoice without activity breakdown", kind: "warn", delay: 580 },
      { text: "› Totals reconciled: £1,200.00 + VAT £240.00 = £1,440.00", kind: "success", delay: 520 },
      { text: "› Extraction complete. 2 review points raised.", kind: "header", delay: 420 },
    ],
    extracted: {
      supplier: "2EA Consulting Limited",
      invoiceNumber: "2EAC202601112-01",
      invoiceDate: "2026-01-12",
      poNumber: null,
      currency: "GBP",
      lineItems: [{ description: "Premium CHPQA Management for Holiday Inn - Brentford Lock", net: 1200 }],
      subtotal: 1200,
      vat: 240,
      total: 1440,
    },
    flags: [
      {
        severity: "medium",
        title: "No matching PO",
        detail:
          "No PO number is present on the document, and no matching purchase order could be resolved.",
      },
      {
        severity: "low",
        title: "Single-line consulting invoice",
        detail:
          "Invoice contains one consulting line without a detailed activity breakdown.",
      },
    ],
    cleanThrough: false,
    status: "Pending review",
    processedAt: "2026-04-27 07:21",
    pdfFile: "invoice-05.pdf",
  },
];

export const FRESH_UPLOAD_POOL: MockInvoice[] = [
  {
    id: "upload-01",
    filename: "uploaded-invoice-01.pdf",
    fileSizeKb: 141,
    pageCount: 1,
    receivedAt: "Just now",
    thumbnailLabel: "PDF",
    preRunSummary: "Processing",
    stream: [
      { text: "› Reading uploaded document…", kind: "info", delay: 200 },
      { text: "› Detected: PDF invoice, 1 page, EN", kind: "muted", delay: 420 },
      { text: "› Extracting header fields…", kind: "info", delay: 520 },
      { text: '› Supplier identified: "Northway Facilities Ltd"', kind: "info", delay: 520 },
      { text: "› Extracting line items… 1 item detected", kind: "info", delay: 500 },
      { text: "› Extraction fields populated.", kind: "success", delay: 480 },
      { text: "› Cross-checking against approved vendors…", kind: "muted", delay: 680 },
      { text: "✓ Supplier matched to vendor master", kind: "success", delay: 540 },
      { text: "› Reconciling VAT against country code…", kind: "muted", delay: 620 },
      { text: "✓ VAT rate reconciles", kind: "success", delay: 500 },
      { text: "› Comparing invoice fingerprint against prior submissions…", kind: "muted", delay: 700 },
      { text: "⚠ Potential duplicate in prior month", kind: "warn", delay: 760 },
      { text: "› AI Analysis complete. 1 review point raised.", kind: "header", delay: 580 },
    ],
    extracted: {
      supplier: "Northway Facilities Ltd",
      invoiceNumber: "NF-8820",
      invoiceDate: "2026-04-27",
      poNumber: "PO-9188",
      currency: "GBP",
      lineItems: [{ description: "Facilities maintenance", net: 1290 }],
      subtotal: 1290,
      vat: 258,
      total: 1548,
    },
    flags: [
      {
        severity: "medium",
        title: "Duplicate candidate",
        detail: "Similar invoice number/amount pattern found in historical AP records.",
      },
    ],
    cleanThrough: false,
    status: "Processing",
    processedAt: "—",
    pdfFile: "invoice-02.pdf",
  },
  {
    id: "upload-02",
    filename: "uploaded-invoice-02.pdf",
    fileSizeKb: 168,
    pageCount: 1,
    receivedAt: "Just now",
    thumbnailLabel: "PDF",
    preRunSummary: "Processing",
    stream: [
      { text: "› Reading uploaded document…", kind: "info", delay: 180 },
      { text: "› Detected: PDF invoice, 1 page, EN", kind: "muted", delay: 400 },
      { text: "› Extracting header fields…", kind: "info", delay: 500 },
      { text: '› Supplier identified: "Marlow IT Services Ltd"', kind: "info", delay: 500 },
      { text: "› Extracting line items… 1 item detected", kind: "info", delay: 460 },
      { text: "› Extraction fields populated.", kind: "success", delay: 460 },
      { text: "› Cross-checking against approved vendors…", kind: "muted", delay: 680 },
      { text: "✓ Supplier matched to approved vendor master", kind: "success", delay: 520 },
      { text: "› Reconciling VAT against country code…", kind: "muted", delay: 620 },
      { text: "✓ VAT rate reconciles", kind: "success", delay: 500 },
      { text: "› Checking duplicate history and PO match…", kind: "muted", delay: 700 },
      { text: "✓ All AI checks passed. Ready for AP.", kind: "header", delay: 640 },
    ],
    extracted: {
      supplier: "Marlow IT Services Ltd",
      invoiceNumber: "MIT-3102",
      invoiceDate: "2026-04-27",
      poNumber: "PO-9210",
      currency: "GBP",
      lineItems: [{ description: "Managed support retainer", net: 2400 }],
      subtotal: 2400,
      vat: 480,
      total: 2880,
    },
    flags: [],
    cleanThrough: true,
    status: "Processing",
    processedAt: "—",
    pdfFile: "invoice-04.pdf",
  },
];

export const NORTHPOINT_UPLOAD_TEMPLATE: MockInvoice = {
  id: "upload-northpoint",
  filename: "invoice_northpoint_landscape.pdf",
  fileSizeKb: 180,
  pageCount: 1,
  receivedAt: "Just now",
  thumbnailLabel: "PDF",
  preRunSummary: "Processing",
  stream: [
    { text: "› Reading uploaded document…", kind: "info", delay: 200 },
    { text: "› Detected: PDF invoice, 1 page, EN", kind: "muted", delay: 420 },
    { text: "› Extracting header fields…", kind: "info", delay: 500 },
    { text: '› Supplier identified: "NorthPoint Electrical Ltd"', kind: "info", delay: 520 },
    { text: "› Parsing handwritten PO number…", kind: "muted", delay: 600 },
    { text: "⚠ Handwritten PO number detected", kind: "warn", delay: 620 },
    { text: "› Cross-checking PO against approved vendor PO database…", kind: "muted", delay: 620 },
    {
      text: "⚠ PO number 47125975 not found in approved vendor PO database — partial match only",
      kind: "warn",
      delay: 760,
    },
    { text: "› Extracting line items… 1 item detected", kind: "info", delay: 520 },
    { text: "› Computing totals… £71.34 net, £14.27 VAT, £85.61 total", kind: "info", delay: 580 },
    { text: "› AI Analysis complete. 2 review points raised.", kind: "header", delay: 560 },
  ],
  extracted: {
    supplier: "NorthPoint Electrical Ltd",
    invoiceNumber: "241-643518",
    invoiceDate: "2026-01-12",
    poNumber: "47125975",
    poNumberHandwritten: true,
    currency: "GBP",
    lineItems: [
      {
        description: "5x SQD SE10B120 MCB SP TYPE B 20A @ £23.78, discount 40%",
        net: 71.34,
      },
    ],
    subtotal: 71.34,
    vat: 14.27,
    total: 85.61,
  },
  flags: [
    {
      severity: "medium",
      title: "Handwritten PO number detected",
      detail:
        "PO number appears handwritten and confidence is reduced. Recommend AP validation before routing to payment.",
    },
    {
      severity: "medium",
      title: "PO database partial match only",
      detail:
        "PO number 47125975 was not found in the approved vendor PO database as an exact match; only partial candidate matches were returned.",
    },
  ],
  cleanThrough: false,
  status: "Processing",
  processedAt: "—",
  pdfFile: "invoice_northpoint_landscape.pdf",
};

export const SUMMIT_UPLOAD_TEMPLATE: MockInvoice = {
  id: "upload-summit",
  filename: "invoice_summit.pdf",
  fileSizeKb: 170,
  pageCount: 1,
  receivedAt: "Just now",
  thumbnailLabel: "PDF",
  preRunSummary: "Processing",
  stream: [
    { text: "› Reading uploaded document…", kind: "info", delay: 180 },
    { text: "› Detected: PDF invoice, 1 page, EN", kind: "muted", delay: 420 },
    { text: "› Extracting header fields…", kind: "info", delay: 500 },
    { text: '› Supplier identified: "Summit Facilities Ltd"', kind: "info", delay: 520 },
    { text: "› Parsing handwritten PO number…", kind: "muted", delay: 560 },
    { text: "⚠ Handwritten PO number detected", kind: "warn", delay: 620 },
    {
      text: "⚠ Round-number clustering: all 9 line items are identical value (£7.83)",
      kind: "warn",
      delay: 780,
    },
    { text: "› Extracting line items… 9 service dockets detected", kind: "info", delay: 560 },
    { text: "› Computing totals… £62.64 net, £12.53 VAT, £75.17 total", kind: "info", delay: 600 },
    { text: "› AI Analysis complete. 2 review points raised.", kind: "header", delay: 540 },
  ],
  extracted: {
    supplier: "Summit Facilities Ltd",
    invoiceNumber: "6862078541",
    invoiceDate: "2025-11-29",
    poNumber: "78261439",
    poNumberHandwritten: true,
    currency: "GBP",
    lineItems: [
      {
        description:
          "9x waste collection service dockets @ £7.83 (30/09/25, 03/10/25, 07/10/25, 10/10/25, 14/10/25, 17/10/25, 21/10/25, 24/10/25)",
        net: 62.64,
      },
    ],
    subtotal: 62.64,
    vat: 12.53,
    total: 75.17,
  },
  flags: [
    {
      severity: "medium",
      title: "Handwritten PO number detected",
      detail:
        "PO number appears handwritten and confidence is reduced. Recommend AP validation before routing to payment.",
    },
    {
      severity: "low",
      title: "Round-number clustering",
      detail:
        "All 9 line items are identical at £7.83, which may indicate templated or auto-generated entries.",
    },
  ],
  cleanThrough: false,
  status: "Processing",
  processedAt: "—",
  pdfFile: "invoice_summit.pdf",
};
