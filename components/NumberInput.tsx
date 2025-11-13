"use client";

import { ChangeEvent } from "react";

type Props = {
  label: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function NumberInput({
  label,
  suffix,
  value,
  onChange,
  min,
  max,
  step
}: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const num = v === "" ? 0 : Number(v);
    if (Number.isNaN(num)) return;
    onChange(num);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step ?? 1}
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix && (
          <span className="text-xs text-slate-400">{suffix}</span>
        )}
      </div>
    </label>
  );
}
