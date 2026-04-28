import { useEffect, useRef, useState } from "react";
import type { StreamLine } from "@/data/invoices";

export type StreamStatus = "idle" | "running" | "complete";

interface UseScriptedStreamArgs {
  lines: StreamLine[];
  /** Bump this to (re-)start the stream with the current `lines`. */
  runKey: number;
}

interface UseScriptedStreamResult {
  visibleLines: StreamLine[];
  status: StreamStatus;
}

/**
 * Replays a scripted message queue line-by-line. Each line waits for its own
 * `delay` (ms) before fading in, defaulting to 350ms. Status flips to
 * `complete` on the final line so consumers can reveal the structured-output
 * panel without polling.
 */
export const useScriptedStream = ({
  lines,
  runKey,
}: UseScriptedStreamArgs): UseScriptedStreamResult => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];

    if (runKey === 0) {
      setVisibleCount(0);
      setStatus("idle");
      return;
    }

    setVisibleCount(0);
    setStatus("running");

    let cumulative = 0;
    lines.forEach((line, idx) => {
      cumulative += line.delay ?? 350;
      const id = window.setTimeout(() => {
        setVisibleCount(idx + 1);
        if (idx === lines.length - 1) {
          setStatus("complete");
        }
      }, cumulative);
      timeoutsRef.current.push(id);
    });

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [lines, runKey]);

  return {
    visibleLines: lines.slice(0, visibleCount),
    status,
  };
};
