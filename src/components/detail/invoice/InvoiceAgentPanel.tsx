import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  FlagSeverity,
  InvoiceFlag,
  MockInvoice,
  StreamLine,
  StreamLineKind,
} from "@/data/invoices";
import { useScriptedStream } from "./useScriptedStream";

const EASE = [0.16, 1, 0.3, 1] as const;

interface InvoiceAgentPanelProps {
  invoice: MockInvoice;
}

/**
 * The streaming "thinking" + structured-output panel for the active invoice.
 * Run/re-run is keyed off the invoice id and an internal `runKey` counter so
 * Alper can replay any invoice without leaving the workspace.
 */
const InvoiceAgentPanel = ({ invoice }: InvoiceAgentPanelProps) => {
  const [runKey, setRunKey] = useState(1);

  // Re-trigger the script when the active invoice changes.
  useEffect(() => {
    setRunKey((k) => k + 1);
  }, [invoice.id]);

  const { visibleLines, status } = useScriptedStream({
    lines: invoice.stream,
    runKey,
  });

  const handleRerun = () => setRunKey((k) => k + 1);
  const handleSendForReview = () =>
    toast("Sent to review queue", {
      description: `${invoice.extracted.invoiceNumber} routed to AP review.`,
    });
  const handleExportCsv = () => downloadInvoiceCsv(invoice);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
            <Sparkles
              className="h-3 w-3 text-primary-glow"
              strokeWidth={1.75}
            />
            Agent run
            <StatusBadge status={status} />
          </div>
          <div className="mt-1.5 truncate text-[14px] font-medium tracking-tight text-foreground">
            {invoice.filename}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-foreground/45">
            <span>{invoice.pageCount} page</span>
            <span className="text-foreground/20">·</span>
            <span>{invoice.fileSizeKb}KB</span>
            <span className="text-foreground/20">·</span>
            <span>{invoice.receivedAt}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRerun}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025]",
            "px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/65",
            "transition-colors duration-200 hover:border-white/25 hover:text-foreground/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
          )}
        >
          <RefreshCw className="h-3 w-3" strokeWidth={2} />
          Re-run
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <StreamConsole lines={visibleLines} status={status} />
        <ExtractionBlock invoice={invoice} status={status} />
        <FlagsBlock flags={invoice.flags} cleanThrough={invoice.cleanThrough} status={status} />

        {/* Footer actions appear once stream completes. */}
        <AnimatePresence>
          {status === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
              className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] px-6 py-5"
            >
              <button
                type="button"
                onClick={handleExportCsv}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-white/10",
                  "bg-white/[0.025] px-3.5 py-2 text-[12px] font-medium tracking-tight text-foreground/85",
                  "transition-colors duration-200 hover:border-white/25 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
                )}
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.85} />
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleSendForReview}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full px-4 py-2",
                  "text-[12px] font-medium tracking-tight text-primary-foreground",
                  "bg-[linear-gradient(135deg,hsl(var(--primary-deep)),hsl(var(--primary)))]",
                  "shadow-[var(--shadow-sage)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:translate-y-[-1px] hover:shadow-[0_14px_50px_-10px_hsl(var(--primary)/0.6),0_0_0_1px_hsl(var(--primary-glow)/0.35)_inset]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/70",
                )}
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2} />
                Send to review queue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ----------------------------- Stream console ---------------------------- */

const KIND_STYLES: Record<StreamLineKind, string> = {
  info: "text-foreground/75",
  muted: "text-foreground/45",
  warn: "text-amber-300/85",
  success: "text-emerald-300/90",
  header: "text-foreground/95",
};

const StreamConsole = ({
  lines,
  status,
}: {
  lines: StreamLine[];
  status: "idle" | "running" | "complete";
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to follow the stream — only when running so a stationary user
  // staring at the completed output isn't yanked back to the bottom on resize.
  useEffect(() => {
    if (status !== "running") return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines.length, status]);

  return (
    <div
      ref={scrollRef}
      className="border-b border-white/[0.06] px-6 py-5 font-mono text-[12.5px] leading-[1.55]"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/35">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "running"
              ? "bg-amber-300/80 shadow-[0_0_8px_hsl(40_90%_60%/0.7)]"
              : status === "complete"
                ? "bg-emerald-300/80 shadow-[0_0_8px_hsl(150_70%_55%/0.6)]"
                : "bg-foreground/20",
          )}
          aria-hidden
        />
        Console
      </div>

      <div className="flex flex-col gap-1">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn("whitespace-pre-wrap", KIND_STYLES[line.kind])}
          >
            {line.text}
          </motion.div>
        ))}
        {status === "running" && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="mt-1 inline-block h-3.5 w-1.5 bg-foreground/65"
          />
        )}
        {status === "idle" && (
          <div className="text-foreground/40">› Awaiting upload…</div>
        )}
      </div>
    </div>
  );
};

/* ----------------------------- Extraction -------------------------------- */

interface BlockProps {
  status: "idle" | "running" | "complete";
}

const ExtractionBlock = ({
  invoice,
  status,
}: BlockProps & { invoice: MockInvoice }) => {
  const visible = status === "complete";
  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          className="border-b border-white/[0.06] px-6 py-6"
        >
          <SectionHeader label="Extracted fields" />
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Supplier" value={invoice.extracted.supplier} />
            <Field label="Invoice #" value={invoice.extracted.invoiceNumber} />
            <Field label="Invoice date" value={invoice.extracted.invoiceDate} />
            <Field
              label="PO #"
              value={invoice.extracted.poNumber ?? "—"}
              missing={!invoice.extracted.poNumber}
            />
            <Field label="Currency" value={invoice.extracted.currency} />
            <Field
              label="Subtotal"
              value={fmtCurrency(invoice.extracted.subtotal, invoice.extracted.currency)}
            />
            <Field
              label="VAT"
              value={fmtCurrency(invoice.extracted.vat, invoice.extracted.currency)}
            />
            <Field
              label="Total"
              value={fmtCurrency(invoice.extracted.total, invoice.extracted.currency)}
              emphasis
            />
          </div>

          <div className="mt-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
              Line items ({invoice.extracted.lineItems.length})
            </div>
            <ul className="mt-2.5 divide-y divide-white/[0.05] rounded-lg border border-white/[0.06] bg-white/[0.012]">
              {invoice.extracted.lineItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-[12.5px]"
                >
                  <span className="truncate text-foreground/80">{item.description}</span>
                  <span className="shrink-0 tabular-nums text-foreground/85">
                    {fmtCurrency(item.net, invoice.extracted.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  label,
  value,
  emphasis,
  missing,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  missing?: boolean;
}) => (
  <div className="min-w-0">
    <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
      {label}
    </div>
    <div
      className={cn(
        "mt-1 truncate text-[13px] tabular-nums tracking-tight",
        emphasis && "text-foreground font-semibold",
        missing && "text-amber-300/80",
        !emphasis && !missing && "text-foreground/85",
      )}
    >
      {value}
    </div>
  </div>
);

/* ------------------------------ Flags ----------------------------------- */

const SEV_STYLES: Record<FlagSeverity, { dot: string; text: string; ring: string }> = {
  high: {
    dot: "bg-rose-400",
    text: "text-rose-200/95",
    ring: "ring-rose-400/30",
  },
  medium: {
    dot: "bg-amber-300",
    text: "text-amber-200/95",
    ring: "ring-amber-300/30",
  },
  low: {
    dot: "bg-sky-300",
    text: "text-sky-200/95",
    ring: "ring-sky-300/25",
  },
};

const FlagsBlock = ({
  flags,
  cleanThrough,
  status,
}: BlockProps & { flags: InvoiceFlag[]; cleanThrough: boolean }) => {
  const visible = status === "complete";
  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
          className="px-6 py-6"
        >
          <SectionHeader
            label={
              cleanThrough
                ? "All checks passed"
                : `Risk flags (${flags.length})`
            }
            tone={cleanThrough ? "success" : "warn"}
          />

          {cleanThrough ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                strokeWidth={2}
              />
              <div>
                <div className="text-[13px] font-medium tracking-tight text-emerald-100">
                  Ready to route to AP for payment.
                </div>
                <div className="mt-1 text-[12px] leading-relaxed text-foreground/55">
                  Vendor verified, PO matched, arithmetic reconciled, no
                  duplicate detected. Total processing time:{" "}
                  <span className="text-foreground/80">3.2 seconds</span>.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5">
              {flags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                    delay: 0.25 + i * 0.07,
                  }}
                  className={cn(
                    "rounded-xl border border-white/[0.07] bg-white/[0.02] p-4",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        "ring-1",
                        SEV_STYLES[flag.severity].ring,
                      )}
                    >
                      <AlertTriangle
                        className={cn("h-2.5 w-2.5", SEV_STYLES[flag.severity].text)}
                        strokeWidth={2.25}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-[0.22em]",
                            SEV_STYLES[flag.severity].text,
                          )}
                        >
                          {flag.severity}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/30">
                          ·
                        </span>
                        <span className="text-[12.5px] font-medium tracking-tight text-foreground">
                          {flag.title}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/60">
                        {flag.detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------ shared ---------------------------------- */

const StatusBadge = ({ status }: { status: "idle" | "running" | "complete" }) => {
  const map = {
    idle: { label: "queued", color: "text-foreground/45" },
    running: { label: "thinking", color: "text-amber-300/85" },
    complete: { label: "complete", color: "text-emerald-300/90" },
  } as const;
  const cfg = map[status];
  return (
    <span className={cn("ml-1 tabular-nums", cfg.color)}>· {cfg.label}</span>
  );
};

const SectionHeader = ({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "warn" | "success";
}) => (
  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
    <span
      aria-hidden
      className={cn(
        "h-1 w-1 rounded-full",
        tone === "warn"
          ? "bg-amber-300/80"
          : tone === "success"
            ? "bg-emerald-300/80"
            : "bg-foreground/40",
      )}
    />
    {label}
  </div>
);

const fmtCurrency = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

/* ---------------------------- CSV download ------------------------------ */

const downloadInvoiceCsv = (invoice: MockInvoice) => {
  const rows: Array<[string, string]> = [
    ["filename", invoice.filename],
    ["supplier", invoice.extracted.supplier],
    ["invoice_number", invoice.extracted.invoiceNumber],
    ["invoice_date", invoice.extracted.invoiceDate],
    ["po_number", invoice.extracted.poNumber ?? ""],
    ["currency", invoice.extracted.currency],
    ["subtotal", invoice.extracted.subtotal.toFixed(2)],
    ["vat", invoice.extracted.vat.toFixed(2)],
    ["total", invoice.extracted.total.toFixed(2)],
    ["flag_count", String(invoice.flags.length)],
  ];
  invoice.extracted.lineItems.forEach((item, i) => {
    rows.push([`line_item_${i + 1}_description`, item.description]);
    rows.push([`line_item_${i + 1}_net`, item.net.toFixed(2)]);
  });
  invoice.flags.forEach((flag, i) => {
    rows.push([`flag_${i + 1}_severity`, flag.severity]);
    rows.push([`flag_${i + 1}_title`, flag.title]);
    rows.push([`flag_${i + 1}_detail`, flag.detail]);
  });

  const csv = ["field,value"]
    .concat(rows.map(([k, v]) => `${csvEscape(k)},${csvEscape(v)}`))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.extracted.invoiceNumber}-extraction.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast("CSV exported", { description: a.download });
};

const csvEscape = (raw: string): string => {
  if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export default InvoiceAgentPanel;
