type Props = {
  children: string;
  tone?: "neutral" | "success" | "warning" | "critical";
};

export default function Badge({ children, tone = "neutral" }: Props) {
  const map: Record<string, string> = {
    neutral:
      "bg-slate-100 text-slate-700 border border-slate-200",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200",
    critical: "bg-rose-50 text-rose-700 border border-rose-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}
