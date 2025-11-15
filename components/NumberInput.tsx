import React from "react";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
};

export default function NumberInput({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    onChange(!isNaN(parsed) ? parsed : 0);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[11px] font-semibold text-slate-200">
        {label}
      </label>

      <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 px-2 py-1">
        <input
          type="number"
          value={value}
          step={step}
          onChange={handleChange}
          className="w-full bg-transparent text-slate-100 font-bold outline-none"
        />

        {suffix && (
          <span className="ml-1 text-[11px] font-semibold text-slate-300">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
