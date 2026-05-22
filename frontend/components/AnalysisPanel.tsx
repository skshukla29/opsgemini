import { Lightbulb } from "lucide-react";

import type { AnalysisResult } from "../lib/api";

export function AnalysisPanel({ analysis }: { analysis: AnalysisResult | null }) {
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-slate-500">
        Run analysis to populate this panel.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Issue Category</p>
        <p className="mt-1 text-base font-semibold text-slate-100">{analysis.issue_category}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Root Cause</p>
        <p className="mt-1 font-mono text-sm text-slate-200">{analysis.root_cause}</p>
      </div>
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          <Lightbulb size={14} className="text-amber-400" />
          Beginner Explanation
        </p>
        <p className="text-sm text-slate-300">{analysis.beginner_explanation}</p>
      </div>
    </div>
  );
}
