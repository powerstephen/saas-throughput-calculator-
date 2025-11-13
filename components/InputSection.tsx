import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function InputSection({
  title,
  subtitle,
  children
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </header>
      <div className="grid grid-cols-1 gap-3">
        {children}
      </div>
    </section>
  );
}
