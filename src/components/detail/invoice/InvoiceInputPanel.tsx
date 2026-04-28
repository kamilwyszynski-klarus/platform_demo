import { motion } from "framer-motion";
import { FileText, Plus, Upload } from "lucide-react";
import { useCallback, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import type { MockInvoice } from "@/data/invoices";

const EASE = [0.16, 1, 0.3, 1] as const;

interface InvoiceInputPanelProps {
  invoices: MockInvoice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const InvoiceInputPanel = ({
  invoices,
  selectedId,
  onSelect,
}: InvoiceInputPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Mock drop: if a file lands we just promote the first un-selected invoice
  // so the demo flow keeps moving without ever reading the actual bytes. No
  // real file ever leaves the drop zone — GDPR-safe.
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const candidate =
        invoices.find((inv) => inv.id !== selectedId) ?? invoices[0];
      if (candidate) onSelect(candidate.id);
    },
    [invoices, selectedId, onSelect],
  );

  return (
    <div className="flex h-full flex-col gap-5 p-6">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
          Input
        </div>
        <h2 className="mt-1 text-[1.05rem] font-semibold tracking-tight text-foreground">
          Drop invoices to process
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-foreground/50">
          Accepts PDF, PNG, JPG. Or pick a recent upload below.
        </p>
      </div>

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging
            ? "hsl(var(--primary-glow) / 0.6)"
            : "hsl(0 0% 100% / 0.10)",
          backgroundColor: isDragging
            ? "hsl(var(--primary) / 0.06)"
            : "hsl(0 0% 100% / 0.018)",
        }}
        transition={{ duration: 0.25, ease: EASE }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed",
          "px-4 py-8 text-center",
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-primary/15 text-primary-glow",
          )}
        >
          <Upload className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="text-[12px] font-medium tracking-tight text-foreground/85">
          Drop a file or click to upload
        </div>
        <div className="text-[11px] text-foreground/40">
          Streams to the agent the moment it lands
        </div>
      </motion.div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
          Recent uploads
        </div>
        <span className="text-[10px] tabular-nums text-foreground/30">
          {invoices.length} files
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {invoices.map((inv, i) => (
          <RecentItem
            key={inv.id}
            invoice={inv}
            index={i}
            active={selectedId === inv.id}
            onClick={() => onSelect(inv.id)}
          />
        ))}
      </div>

      <button
        type="button"
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-full",
          "border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] font-medium tracking-tight text-foreground/65",
          "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-foreground/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
        )}
        disabled
        aria-disabled
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
        Connect a mailbox source
      </button>
    </div>
  );
};

interface RecentItemProps {
  invoice: MockInvoice;
  index: number;
  active: boolean;
  onClick: () => void;
}

const RecentItem = ({ invoice, index, active, onClick }: RecentItemProps) => (
  <motion.button
    type="button"
    onClick={onClick}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: EASE, delay: 0.05 + index * 0.04 }}
    className={cn(
      "group relative flex items-center gap-3 rounded-lg border p-2.5 text-left",
      "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
      active
        ? "border-primary-glow/55 bg-primary/[0.07]"
        : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035]",
    )}
  >
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
        "border border-white/[0.08] bg-white/[0.03]",
        active ? "text-primary-glow" : "text-foreground/55",
      )}
      aria-hidden
    >
      <FileText className="h-4 w-4" strokeWidth={1.6} />
    </div>
    <div className="min-w-0 flex-1">
      <div
        className={cn(
          "truncate text-[12px] font-medium tracking-tight",
          active ? "text-foreground" : "text-foreground/85",
        )}
      >
        {invoice.filename}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-foreground/40">
        <span>{invoice.receivedAt}</span>
        <span className="text-foreground/20">·</span>
        <span>{invoice.fileSizeKb}KB</span>
        <span className="text-foreground/20">·</span>
        <span>{invoice.pageCount}p</span>
      </div>
    </div>
  </motion.button>
);

export default InvoiceInputPanel;
