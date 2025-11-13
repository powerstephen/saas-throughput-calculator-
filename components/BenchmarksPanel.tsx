import { MarketingInputs, SalesInputs, CsInputs, CalculatorResult } from "@/lib/calculations";

type Benchmarks = {
  mqlRate: number;
  sqlRate: number;
  oppRate: number;
  oppToProposal: number;
  proposalToWin: number;
  monthlyChurnRate: number;
  ltvToCac: number;
};

type Props = {
  benchmarks: Benchmarks;
  marketing: MarketingInputs;
  sales: SalesInputs;
  cs: CsInputs;
  result: CalculatorResult;
};

function formatPct(num: number | null): string {
  if (num === null || !Number.isFinite(num)) return "-";
  return `${num.toFixed(0)}%`;
}

function formatRatio(num: number | null): string {
  if (num === null || !Number.isFinite(num)) return "-";
  return num.toFixed(1);
}

function diff(actual: number, target: number): string {
  const delta = actual - target;
  if (!Number.isFinite(delta) || target === 0) return "";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(0)} pts`;
}

export type BenchmarksType = Benchmarks;

export default function BenchmarksPanel({
  benchmarks,
  marketing,
  sales,
  cs,
  result
}: Props) {
  const actualLtvToCac = result.efficiency.ltvToCac;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-soft">
      <h2 className="text-sm font-semibold text-slate-900">
        Targets vs Actual
      </h2>
      <p className="mt-1 text-[11px] text-slate-500">
        Quick view of how key metrics perform against targets or benchmarks.
      </p>

      <div className="mt-3 grid gap-3">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-[11px] text-slate-500">
              <th className="text-left">Metric</th>
              <th className="text-right">Actual</th>
              <th className="text-right">Target</th>
              <th className="text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">Lead → MQL</td>
              <td className="px-2 py-1 text-right">
                {formatPct(marketing.mqlRate)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.mqlRate)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(marketing.mqlRate, benchmarks.mqlRate)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">MQL → SQL</td>
              <td className="px-2 py-1 text-right">
                {formatPct(marketing.sqlRate)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.sqlRate)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(marketing.sqlRate, benchmarks.sqlRate)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">SQL → Opp</td>
              <td className="px-2 py-1 text-right">
                {formatPct(marketing.oppRate)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.oppRate)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(marketing.oppRate, benchmarks.oppRate)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">Opp → Proposal</td>
              <td className="px-2 py-1 text-right">
                {formatPct(sales.oppToProposal)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.oppToProposal)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(sales.oppToProposal, benchmarks.oppToProposal)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">Proposal → Won</td>
              <td className="px-2 py-1 text-right">
                {formatPct(sales.proposalToWin)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.proposalToWin)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(sales.proposalToWin, benchmarks.proposalToWin)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">Monthly churn</td>
              <td className="px-2 py-1 text-right">
                {formatPct(cs.monthlyChurnRate)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatPct(benchmarks.monthlyChurnRate)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {diff(cs.monthlyChurnRate, benchmarks.monthlyChurnRate)}
              </td>
            </tr>

            <tr className="rounded-lg bg-slate-50">
              <td className="rounded-l-lg px-2 py-1">LTV/CAC</td>
              <td className="px-2 py-1 text-right">
                {formatRatio(actualLtvToCac)}
              </td>
              <td className="px-2 py-1 text-right">
                {formatRatio(benchmarks.ltvToCac)}
              </td>
              <td className="rounded-r-lg px-2 py-1 text-right text-slate-500">
                {actualLtvToCac && benchmarks.ltvToCac
                  ? `${(actualLtvToCac - benchmarks.ltvToCac).toFixed(1)}`
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
