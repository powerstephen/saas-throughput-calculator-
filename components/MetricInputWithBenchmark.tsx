type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  benchmark: number;
  mode: "percent" | "currency";
  currencySymbol?: string;
};

export default function MetricInputWithBenchmark({
  label,
  value,
  onChange,
  benchmark,
  mode,
  currencySymbol = "€",
}: Props) {
  const suffix = mode === "percent" ? "%" : currencySymbol;

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-semibold text-slate-200">
        {label}
      </label>

      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-2 py-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-transparent text-slate-100 font-bold text-base outline-none"
        />

        <span className="ml-2 text-xs font-semibold text-slate-300">
          {suffix}
        </span>
      </div>

      <div className="text-[11px] text-slate-400">
        Benchmark:{" "}
        <span className="font-semibold text-slate-300">
          {benchmark.toLocaleString("en-US", {
            maximumFractionDigits: mode === "currency" ? 0 : 2,
          })}
          {suffix}
        </span>
      </div>
    </div>
  );
}
