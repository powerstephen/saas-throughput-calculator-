"use client";

type TabKey = "marketing" | "sales" | "cs";

type Tab = {
  key: TabKey;
  label: string;
};

const TABS: Tab[] = [
  { key: "marketing", label: "Marketing" },
  { key: "sales", label: "Sales" },
  { key: "cs", label: "Customer Success" }
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export type TabKeyType = TabKey;

export default function Tabs({ active, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs shadow-soft">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-3 py-1 font-medium transition ${
              isActive
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
