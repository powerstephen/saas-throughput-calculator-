import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function InputSection({ title, subtitle, children }: Props) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-50 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3 text-xs text-slate-100">
        {children}
      </div>
    </section>
  );
}
