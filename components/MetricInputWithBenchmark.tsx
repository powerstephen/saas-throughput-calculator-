"use client";

import NumberInput from "./NumberInput";

type Mode = "percent" | "number" | "currency";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  benchmark: number;
  mode?: Mode;
};

export default function MetricInputWithBenchmark({
  label,
  value,
  onChange,
  benchmark,
  mode = "percent"
}: Props) {
  const suffix =
    mode === "percent" ? "%" : mode === "currency" ? "€" : undefined;

  const delta = value - benchmark;
  const isAbove = delta > 0;
  const isBelow = delta < 0;

  const format = (v: number) =>
    mode === "percent" ? `${v.toFixed(0)}%` : mode === "currency" ? `€${v.toFixed(0)}` : v.toFixed(0);

  const deltaLabel =
    delta === 0
      ? "On benchmark"
      : `${isAbove ? "+" : ""}${delta.toFixed(0)} ${mode === "percent" ? "pts" : ""}`;

  const deltaColour = isAbove
    ? "text-emerald-600"
    : isBelow
    ? "text-rose-600"
    : "text-slate-500";

  return (
    <div className="flex flex-col gap-1 text-sm">
      <NumberInput
        label={label}
        value={value}
        onChange={onChange}
        suffix={suffix}
      />
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Benchmark: <span className="font-medium text-slate-700">{format(benchmark)}</span></span>
        <span className={`font-medium ${deltaColour}`}>{deltaLabel}</span>
      </div>
    </div>
  );
}
