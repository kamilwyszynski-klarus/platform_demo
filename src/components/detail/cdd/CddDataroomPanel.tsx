import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CDD_DATAROOM_CATEGORIES,
  CDD_DATAROOM_FILES,
  type CddDataroomCategory,
  type CddDataroomFile,
} from "@/data/cdd";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const fileIcon = (file: CddDataroomFile) =>
  file.name.toLowerCase().endsWith(".xlsx") ? FileSpreadsheet : FileText;

const fmtSize = (kb: number) =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

const confidenceTone = (pct: number) => {
  if (pct >= 95) return "text-emerald-300/95";
  if (pct >= 85) return "text-emerald-200/85";
  if (pct >= 70) return "text-amber-200/85";
  return "text-rose-200/85";
};

const CddDataroomPanel = () => {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<CddDataroomCategory, boolean>>(
    () => ({
      Financials: false,
      "Customer contracts": false,
      "Market research": false,
      "Competitor filings": false,
      Operational: false,
    }),
  );
  const [query, setQuery] = useState("");

  const activeFile = useMemo(
    () => CDD_DATAROOM_FILES.find((f) => f.id === activeFileId) ?? null,
    [activeFileId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CDD_DATAROOM_FILES;
    return CDD_DATAROOM_FILES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.classification.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    return CDD_DATAROOM_CATEGORIES.map((cat) => ({
      category: cat,
      files: filtered.filter((f) => f.category === cat),
    })).filter((g) => g.files.length > 0);
  }, [filtered]);

  return (
    <aside
      aria-label="Data room"
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[340px] shrink-0 flex-col self-start overflow-hidden border-l border-white/[0.06] bg-white/[0.012] lg:flex"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary-glow">
            <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
              Data room
            </div>
            <div className="text-[12.5px] font-medium tracking-tight text-foreground">
              {CDD_DATAROOM_FILES.length} source documents
            </div>
          </div>
        </div>
      </div>

      {activeFile ? (
        <FileDetail file={activeFile} onBack={() => setActiveFileId(null)} />
      ) : (
        <FileList
          query={query}
          setQuery={setQuery}
          grouped={grouped}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onOpen={setActiveFileId}
        />
      )}
    </aside>
  );
};

interface FileListProps {
  query: string;
  setQuery: (q: string) => void;
  grouped: { category: CddDataroomCategory; files: CddDataroomFile[] }[];
  collapsed: Record<CddDataroomCategory, boolean>;
  setCollapsed: (
    fn: (prev: Record<CddDataroomCategory, boolean>) => Record<CddDataroomCategory, boolean>,
  ) => void;
  onOpen: (id: string) => void;
}

const FileList = ({
  query,
  setQuery,
  grouped,
  collapsed,
  setCollapsed,
  onOpen,
}: FileListProps) => (
  <>
    <div className="border-b border-white/[0.06] px-4 py-2.5">
      <label className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-foreground/70 focus-within:border-primary-glow/55">
        <Search className="h-3.5 w-3.5 text-foreground/45" strokeWidth={1.8} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-foreground/35"
        />
      </label>
    </div>

    <div className="flex-1 overflow-y-auto">
      {grouped.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground/45">
          No documents match.
        </div>
      ) : (
        grouped.map(({ category, files }) => (
          <CategoryGroup
            key={category}
            category={category}
            files={files}
            collapsed={collapsed[category]}
            onToggle={() =>
              setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))
            }
            onOpen={onOpen}
          />
        ))
      )}
    </div>
  </>
);

interface CategoryGroupProps {
  category: CddDataroomCategory;
  files: CddDataroomFile[];
  collapsed: boolean;
  onToggle: () => void;
  onOpen: (id: string) => void;
}

const CategoryGroup = ({
  category,
  files,
  collapsed,
  onToggle,
  onOpen,
}: CategoryGroupProps) => (
  <div className="border-b border-white/[0.04] last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
      aria-expanded={!collapsed}
    >
      <div className="flex items-center gap-2">
        <ChevronDown
          className={cn(
            "h-3 w-3 text-foreground/45 transition-transform duration-200",
            collapsed && "-rotate-90",
          )}
          strokeWidth={2}
        />
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/55">
          {category}
        </span>
      </div>
      <span className="text-[10px] tabular-nums text-foreground/35">{files.length}</span>
    </button>

    {!collapsed && (
      <ul className="pb-1.5">
        {files.map((file) => {
          const Icon = fileIcon(file);
          return (
            <li key={file.id}>
              <button
                type="button"
                onClick={() => onOpen(file.id)}
                className="group flex w-full items-start gap-2.5 px-4 py-1.5 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
              >
                <Icon
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/45 group-hover:text-foreground/65"
                  strokeWidth={1.7}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium tracking-tight text-foreground/85 group-hover:text-foreground">
                    {file.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-foreground/45">
                    <span className="truncate">{file.classification}</span>
                    <span className="text-foreground/25">·</span>
                    <span className={cn("tabular-nums", confidenceTone(file.extractionConfidence))}>
                      {file.extractionConfidence}%
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="mt-1 h-3 w-3 shrink-0 text-foreground/25 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/55"
                  strokeWidth={2}
                />
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const FileDetail = ({
  file,
  onBack,
}: {
  file: CddDataroomFile;
  onBack: () => void;
}) => {
  const Icon = fileIcon(file);
  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-foreground/65 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} />
          Back
        </button>
        <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/40">
          {file.category}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-foreground/65">
            <Icon className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-snug tracking-tight text-foreground">
              {file.name}
            </div>
            <div className="mt-1 text-[11px] text-foreground/50">
              {file.classification} · {file.pages} pages · {fmtSize(file.sizeKb)}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
            <span>Extraction confidence</span>
            <span className={cn("tabular-nums", confidenceTone(file.extractionConfidence))}>
              {file.extractionConfidence}%
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-primary-glow/80"
              style={{ width: `${file.extractionConfidence}%` }}
            />
          </div>
          <div className="mt-2 text-[10.5px] text-foreground/40">
            Ingested {file.ingestedAt}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
            Key extracted fields
          </div>
          <dl className="mt-2 divide-y divide-white/[0.05] rounded-lg border border-white/[0.06] bg-white/[0.012]">
            {file.fields.map((f) => (
              <div
                key={f.label}
                className="flex items-baseline justify-between gap-3 px-3 py-2"
              >
                <dt className="text-[11px] text-foreground/50">{f.label}</dt>
                <dd className="text-[12px] font-medium tabular-nums text-foreground/90">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
            Summary
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/65">
            {file.summary}
          </p>
        </div>

        <div className="mt-4 rounded-md border border-dashed border-white/[0.08] bg-white/[0.012] px-3 py-2 text-[11px] text-foreground/40">
          Document preview not available in demo mode.
        </div>
      </div>
    </motion.div>
  );
};

export default CddDataroomPanel;
