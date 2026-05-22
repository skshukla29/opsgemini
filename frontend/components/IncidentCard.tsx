import { AlertTriangle } from "lucide-react";

import type { IncidentRecord } from "../lib/api";

interface IncidentCardProps {
  incident: IncidentRecord;
  active?: boolean;
  onClick?: () => void;
}

function severityColor(severity: IncidentRecord["severity"]): string {
  if (severity === "critical") return "bg-red-500";
  if (severity === "high") return "bg-orange-500";
  return "bg-yellow-500";
}

export function IncidentCard({ incident, active = false, onClick }: IncidentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-indigo-500 bg-zinc-900/80 shadow-[inset_3px_0_0_0_#6366f1]"
          : "border-zinc-800 bg-zinc-950/80 hover:border-zinc-700"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${severityColor(incident.severity)}`} />
          <span className="text-sm font-semibold text-slate-100">{incident.service_name}</span>
        </div>
        <AlertTriangle size={14} className="text-slate-500" />
      </div>
      <p className="line-clamp-2 text-xs text-slate-400">{incident.dynatrace_anomaly || "No anomaly context"}</p>
      <p className="mt-2 text-[11px] text-slate-500">{new Date(incident.created_at).toLocaleString()}</p>
    </button>
  );
}
