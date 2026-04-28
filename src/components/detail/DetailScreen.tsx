import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import TopBar from "@/components/shell/TopBar";
import { useAppState } from "@/components/shell/AppStateContext";
import InvoiceDetail from "./invoice/InvoiceDetail";
import CddDetail from "./cdd/CddDetail";
import JournalDetail from "./journal/JournalDetail";

const EASE = [0.16, 1, 0.3, 1] as const;

const DetailScreen = () => {
  const { selectedTileId } = useAppState();

  return (
    <div className="dark relative flex min-h-screen w-full flex-col bg-background text-foreground">
      <TopBar />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 0%, hsl(140 30% 18% / 0.32), transparent 60%), radial-gradient(ellipse 55% 45% at 90% 100%, hsl(35 50% 25% / 0.18), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col pt-14">
        {selectedTileId === "invoice-processing" ? (
          <InvoiceDetail />
        ) : selectedTileId === "commercial-dd" ? (
          <CddDetail />
        ) : selectedTileId === "manual-journal-testing" ? (
          <JournalDetail />
        ) : (
          <PlaceholderDetail />
        )}
      </div>
    </div>
  );
};

const PlaceholderDetail = () => {
  const { closeDetail, selectedTileId } = useAppState();
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center"
      >
        <Clock className="mx-auto h-5 w-5 text-foreground/45" strokeWidth={1.6} />
        <div className="mt-4 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
          Workspace pending
        </div>
        <h3 className="mt-2 text-[1.15rem] font-semibold tracking-tight text-foreground">
          In final QA — available Monday
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/55">
          The {selectedTileId} workspace is being polished. The team will have
          it ready for the next demo session.
        </p>
        <button
          type="button"
          onClick={closeDetail}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-[12px] font-medium tracking-tight text-foreground/85 transition-colors hover:border-white/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to catalog
        </button>
      </motion.div>
    </div>
  );
};

export default DetailScreen;
