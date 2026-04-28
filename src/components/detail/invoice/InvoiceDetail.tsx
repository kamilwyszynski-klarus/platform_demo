import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileUp,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "sonner";
import { useAppState } from "@/components/shell/AppStateContext";
import {
  FRESH_UPLOAD_POOL,
  MOCK_INVOICES,
  NORTHPOINT_UPLOAD_TEMPLATE,
  SUMMIT_UPLOAD_TEMPLATE,
  type MockInvoice,
} from "@/data/invoices";
import { useScriptedStream } from "./useScriptedStream";

const EASE = [0.16, 1, 0.3, 1] as const;
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const pdfUrlModules = import.meta.glob(
  "../../../../content/playbooks/invoice-intelligence/*.pdf",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const pdfUrls: Record<string, string> = Object.fromEntries(
  Object.entries(pdfUrlModules).map(([path, url]) => [path.split("/").pop() ?? path, url]),
);

const resolvePdfUrl = (pdfFile: string) => pdfUrls[pdfFile];

type RunMode = "frozen" | "live";

const formatProcessedAt = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const InvoiceDetail = () => {
  const { closeDetail } = useAppState();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [documents, setDocuments] = useState<MockInvoice[]>(MOCK_INVOICES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [runModes, setRunModes] = useState<Record<string, RunMode>>(
    Object.fromEntries(MOCK_INVOICES.map((doc) => [doc.id, "frozen"])),
  );
  const [runKeys, setRunKeys] = useState<Record<string, number>>({});
  const dropRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(
    () => documents.find((doc) => doc.id === activeId) ?? null,
    [documents, activeId],
  );

  const kpis = useMemo(() => {
    const total = documents.length;
    const totalValue = documents.reduce((sum, doc) => sum + doc.extracted.total, 0);
    const flagged = documents.filter((doc) => doc.flags.length > 0);
    const flagsBySeverity = flagged.flatMap((doc) => doc.flags).reduce(
      (acc, flag) => ({ ...acc, [flag.severity]: acc[flag.severity] + 1 }),
      { high: 0, medium: 0, low: 0 },
    );
    const passThroughRate = total
      ? Math.round((documents.filter((doc) => doc.cleanThrough).length / total) * 100)
      : 0;
    return { total, totalValue, flagged: flagged.length, flagsBySeverity, passThroughRate };
  }, [documents]);

  const startUpload = (uploadedFilename?: string) => {
    const normalizedName = uploadedFilename?.toLowerCase() ?? "";
    const template =
      normalizedName.includes("northpoint")
        ? NORTHPOINT_UPLOAD_TEMPLATE
        : normalizedName.includes("summit")
          ? SUMMIT_UPLOAD_TEMPLATE
          : FRESH_UPLOAD_POOL[uploadIndex % FRESH_UPLOAD_POOL.length];
    const next = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      filename: uploadedFilename ?? template.filename,
      receivedAt: "Just now",
      status: template.flags.length ? ("Pending review" as const) : ("Reviewed" as const),
      processedAt: formatProcessedAt(new Date()),
    };
    setUploadIndex((i) => i + 1);
    setDocuments((prev) => [next, ...prev]);
    setActiveId(next.id);
    setUploadOpen(false);
    // New uploads should replay the live agent stream once, then freeze.
    setRunModes((prev) => ({ ...prev, [next.id]: "live" }));
    setRunKeys((prev) => ({ ...prev, [next.id]: (prev[next.id] ?? 0) + 1 }));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    startUpload(e.dataTransfer.files[0]?.name);
  };

  const openDocument = (id: string) => {
    setActiveId(id);
  };

  const markCleared = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: "Cleared" } : doc)),
    );
    toast("Invoice marked as cleared");
  };

  const rerunAnalysis = (id: string) => {
    setRunModes((prev) => ({ ...prev, [id]: "live" }));
    setRunKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-3 lg:px-10"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeDetail}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/65 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} />
            Catalog
          </button>
          <div className="hidden h-3 w-px bg-foreground/15 md:block" />
          <div className="hidden text-[11px] uppercase tracking-[0.2em] text-foreground/45 md:block">
            Invoice Processing
          </div>
        </div>

        <div className="hidden items-center gap-2 text-[11px] text-foreground/45 md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/85" />
          </span>
          Agent live · v2.4
        </div>
      </motion.div>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-1 flex-col"
      >
        <HomeView
          documents={documents}
          kpis={kpis}
          onUpload={() => setUploadOpen(true)}
          onOpenDocument={openDocument}
        />
      </div>

      <DocumentModal open={Boolean(active)} onClose={() => setActiveId(null)}>
        {active ? (
          <DocumentView
            invoice={active}
            runMode={runModes[active.id] ?? "frozen"}
            runKey={runKeys[active.id] ?? 0}
            onClose={() => setActiveId(null)}
            onRunComplete={() => {
              if ((runModes[active.id] ?? "frozen") !== "live") return;
              setRunModes((prev) => ({ ...prev, [active.id]: "frozen" }));
              setDocuments((prev) =>
                prev.map((doc) =>
                  doc.id === active.id
                    ? {
                        ...doc,
                        status: doc.flags.length ? "Pending review" : "Reviewed",
                        processedAt: formatProcessedAt(new Date()),
                      }
                    : doc,
                ),
              );
            }}
            onRerun={() => rerunAnalysis(active.id)}
            onMarkCleared={() => markCleared(active.id)}
          />
        ) : null}
      </DocumentModal>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={startUpload} />
    </div>
  );
};

const HomeView = ({
  documents,
  kpis,
  onUpload,
  onOpenDocument,
}: {
  documents: MockInvoice[];
  kpis: {
    total: number;
    totalValue: number;
    flagged: number;
    flagsBySeverity: { high: number; medium: number; low: number };
    passThroughRate: number;
  };
  onUpload: () => void;
  onOpenDocument: (id: string) => void;
}) => (
  <div className="flex flex-1 flex-col px-6 py-5 lg:px-10">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <KpiCard label="Total invoices processed" value={String(kpis.total)} />
      <KpiCard label="Total value processed" value={fmtCurrency(kpis.totalValue, "GBP")} />
      <KpiCard
        label="Open flags"
        value={`${kpis.flagged} (${kpis.flagsBySeverity.high}H/${kpis.flagsBySeverity.medium}M/${kpis.flagsBySeverity.low}L)`}
      />
      <KpiCard label="Average processing time" value="3.4s" />
      <KpiCard label="Pass-through rate" value={`${kpis.passThroughRate}%`} />
    </div>

    <div className="mt-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/60">
        <Search className="h-3.5 w-3.5" /> Filter/search (supplier, date, severity, status)
      </div>
      <button
        type="button"
        onClick={onUpload}
        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--primary-deep)),hsl(var(--primary)))] px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-sage)]"
      >
        <FileUp className="h-4 w-4" /> Upload invoice
      </button>
    </div>

    <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/[0.08] text-xs uppercase tracking-[0.18em] text-foreground/45">
          <tr>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Invoice #</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Flags</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Processed at</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              onClick={() => onOpenDocument(doc.id)}
              className="cursor-pointer border-b border-white/[0.05] text-foreground/80 transition-colors hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3">{doc.extracted.supplier}</td>
              <td className="px-4 py-3">{doc.extracted.invoiceNumber}</td>
              <td className="px-4 py-3">{doc.extracted.invoiceDate}</td>
              <td className="px-4 py-3 tabular-nums">{fmtCurrency(doc.extracted.total, doc.extracted.currency)}</td>
              <td className="px-4 py-3">{doc.flags.length}</td>
              <td className="px-4 py-3">{doc.status}</td>
              <td className="px-4 py-3">{doc.processedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DocumentView = ({
  invoice,
  runMode,
  runKey,
  onClose,
  onRunComplete,
  onRerun,
  onMarkCleared,
}: {
  invoice: MockInvoice;
  runMode: RunMode;
  runKey: number;
  onClose: () => void;
  onRunComplete: () => void;
  onRerun: () => void;
  onMarkCleared: () => void;
}) => {
  const { visibleLines, status } = useScriptedStream({
    lines: invoice.stream,
    runKey: runMode === "live" ? Math.max(runKey, 1) : 0,
  });

  const lines = runMode === "live" ? visibleLines : invoice.stream;
  const isLive = runMode === "live" && status !== "complete";
  const [liveReveal, setLiveReveal] = useState({
    extraction: runMode !== "live",
    analysis: runMode !== "live",
    flagCount: runMode === "live" ? 0 : Math.max(invoice.flags.length, 1),
  });

  useEffect(() => {
    if (runMode === "live" && status === "complete") onRunComplete();
  }, [runMode, status, onRunComplete]);

  useEffect(() => {
    if (runMode !== "live") {
      setLiveReveal({
        extraction: true,
        analysis: true,
        flagCount: Math.max(invoice.flags.length, 1),
      });
      return;
    }

    setLiveReveal({ extraction: false, analysis: false, flagCount: 0 });

    const timers = [
      window.setTimeout(
        () => setLiveReveal((prev) => ({ ...prev, extraction: true })),
        1500,
      ),
      window.setTimeout(
        () => setLiveReveal((prev) => ({ ...prev, analysis: true })),
        3600,
      ),
    ];

    const revealItems = Math.max(invoice.flags.length, 1);
    for (let i = 0; i < revealItems; i += 1) {
      timers.push(
        window.setTimeout(
          () => setLiveReveal((prev) => ({ ...prev, flagCount: i + 1 })),
          4200 + i * 750,
        ),
      );
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [invoice.id, invoice.flags.length, runKey, runMode]);

  const pdfUrl = resolvePdfUrl(invoice.pdfFile);
  const extractionVisible = runMode !== "live" || liveReveal.extraction;
  const analysisVisible = runMode !== "live" || liveReveal.analysis;
  const visibleFlags =
    runMode !== "live" ? invoice.flags : invoice.flags.slice(0, liveReveal.flagCount);
  const cleanVisible = runMode !== "live" || liveReveal.flagCount > 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-3 text-xs text-foreground/55 lg:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <span>Catalog</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground/70">Invoice Processing</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate">{invoice.extracted.supplier} · {invoice.extracted.invoiceNumber}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-foreground/70 transition-colors hover:border-white/25 hover:text-foreground"
          aria-label="Close invoice detail"
        >
          <span className="text-base leading-none">×</span>
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="min-h-0 border-r border-white/[0.06] bg-[hsl(220_30%_3%)] p-4">
          <div className="flex h-full justify-center overflow-auto">
            <div className="h-full w-full max-w-[668px]">
              {pdfUrl ? (
                <PdfPreview pdfUrl={pdfUrl} title={invoice.extracted.invoiceNumber} />
              ) : (
                <div className="text-xs text-foreground/50">PDF missing</div>
              )}
            </div>
          </div>
        </section>

        <section className="min-h-0 overflow-y-auto">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/45">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
                Agent run console
                {isLive ? <span className="text-emerald-300">Live</span> : <span>Frozen · {invoice.processedAt}</span>}
              </div>
              <button type="button" onClick={onRerun} className="text-xs text-foreground/60 hover:text-foreground">
                Re-run analysis
              </button>
            </div>
            <div className="mt-3 space-y-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 font-mono text-xs">
              {lines.map((line, i) => (
                <div key={i} className={line.kind === "warn" ? "text-amber-200" : "text-foreground/75"}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>

          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/45">
              <Clock3 className="h-3.5 w-3.5" /> Extraction
            </div>
            <p className="mt-1 text-xs text-foreground/50">Structured fields parsed from the document.</p>
            <AnimatePresence mode="wait">
              {extractionVisible ? (
                <motion.div
                  key="extraction-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground/75"
                >
                  {[
                    ["Supplier", invoice.extracted.supplier],
                    ["Invoice #", invoice.extracted.invoiceNumber],
                    ["Date", invoice.extracted.invoiceDate],
                    ["Currency", invoice.extracted.currency],
                    ["Subtotal", fmtCurrency(invoice.extracted.subtotal, invoice.extracted.currency)],
                    ["VAT", fmtCurrency(invoice.extracted.vat, invoice.extracted.currency)],
                    ["Total", fmtCurrency(invoice.extracted.total, invoice.extracted.currency)],
                  ].map(([label, value], i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: EASE, delay: i * 0.12 }}
                    >
                      {label}: {value}
                    </motion.div>
                  ))}
                  <motion.div
                    key="po"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: EASE, delay: 0.6 }}
                    className="flex items-center gap-2"
                  >
                    <span>PO #: {invoice.extracted.poNumber ?? "—"}</span>
                    {invoice.extracted.poNumberHandwritten ? (
                      <span className="inline-flex items-center rounded-full border border-amber-300/45 bg-amber-300/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200 shadow-[0_0_12px_hsl(40_90%_60%/0.35)]">
                        Handwritten
                      </span>
                    ) : null}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="extraction-pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-foreground/45"
                >
                  Extracting structured fields…
                </motion.div>
              )}
            </AnimatePresence>
            {extractionVisible ? (
              <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                  Line items ({invoice.extracted.lineItems.length})
                </div>
                <div className="mt-2 space-y-1.5 text-xs text-foreground/70">
                  {invoice.extracted.lineItems.map((item, index) => (
                    <div key={`${item.description}-${index}`} className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1">{item.description}</span>
                      <span className="shrink-0 tabular-nums">
                        {fmtCurrency(item.net, invoice.extracted.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/45">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-200" /> AI Analysis
            </div>
            <p className="mt-1 text-xs text-foreground/50">Reasoning across master data, history, and policy.</p>
            <div className="mt-3 space-y-2">
              {!analysisVisible ? (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2.5 font-mono text-xs text-foreground/45">
                  Awaiting extraction output…
                </div>
              ) : invoice.flags.length ? (
                visibleFlags.map((flag, i) => (
                  <motion.div
                    key={flag.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2.5 text-xs"
                  >
                    <div className="font-medium text-foreground/85">{flag.title}</div>
                    <div className="mt-0.5 text-foreground/55">{flag.detail}</div>
                  </motion.div>
                ))
              ) : cleanVisible ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-2.5 text-xs text-emerald-100"
                >
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  No flags raised.
                </motion.div>
              ) : (
                <div className="font-mono text-xs text-foreground/45">Running AI checks…</div>
              )}
              {analysisVisible && invoice.flags.length > visibleFlags.length && (
                <motion.div
                  aria-hidden
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="h-3.5 w-1.5 bg-foreground/65"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 px-5 py-4">
            <button
              type="button"
              onClick={() => toast("CSV exported")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => toast("Sent to review queue")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs"
            >
              <Send className="h-3.5 w-3.5" /> Send to review queue
            </button>
            <button
              type="button"
              onClick={onMarkCleared}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/[0.08] px-3 py-1.5 text-xs text-emerald-100"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark as cleared
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const DocumentModal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 bg-black/60 p-4 lg:p-6"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.995 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-background"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const PdfPreview = ({ pdfUrl, title }: { pdfUrl: string; title: string }) => {
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    setPageNumber(1);
    setRenderError(false);
  }, [pdfUrl]);

  return (
    <div className="flex h-full min-h-[640px] flex-col">
      <div className="flex-1 overflow-auto rounded-md bg-black/25">
        {renderError ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={`PDF preview ${title}`}
            className="h-full min-h-[640px] w-full rounded-md bg-white"
          />
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
            onLoadError={() => setRenderError(true)}
            loading={<div className="p-3 text-xs text-slate-600">Loading PDF…</div>}
          >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="mx-auto"
              onRenderError={() => setRenderError(true)}
            />
          </Document>
        )}
      </div>
      {!renderError && numPages > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-foreground/70">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(page - 1, 1))}
            disabled={pageNumber === 1}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-40"
            aria-label={`Previous page for ${title}`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="tabular-nums">
            {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.min(page + 1, numPages))}
            disabled={pageNumber === numPages}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-40"
            aria-label={`Next page for ${title}`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

const UploadModal = ({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (filename?: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4"
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="w-full max-w-lg rounded-xl border border-white/[0.1] bg-background p-6"
          >
            <div className="text-sm font-medium text-foreground">Upload invoice</div>
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                onUpload(e.dataTransfer.files[0]?.name);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="mt-4 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-5 py-10 text-center text-sm text-foreground/60"
            >
              Drop invoice files here or click to choose
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0]?.name)}
            />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1.5 text-xs">
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const KpiCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
    <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">{label}</div>
    <div className="mt-1 text-sm font-medium text-foreground/85">{value}</div>
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

export default InvoiceDetail;
