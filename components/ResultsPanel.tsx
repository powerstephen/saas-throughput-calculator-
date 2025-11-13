import { CalculatorResult } from "@/lib/calculations";
import Badge from "./Badge";

type Props = {
  result: CalculatorResult;
};

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000)
    return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)
    return `€${(value / 1_000).toFixed(1)}k`;
  return `€${value.toFixed(0)}`;
}

function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(0)}%`;
}

export default function ResultsPanel({ result }: Props) {
  const { funnel, forecast, efficiency, recommendations } =
    result;

  let coverageTone: "neutral" | "success" | "warning" | "critical" =
    "neutral";

  if (efficiency.pipelineCoverageStatus === "strong")
    coverageTone = "success";
  else if (efficiency.pipelineCoverageStatus === "ok")
    coverageTone = "warning";
  else if (efficiency.pipelineCoverageStatus === "under")
    coverageTone = "critical";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Full-Funnel Output
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            From traffic to ARR, including churn, expansion,
            and pipeline coverage.
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <h3 className="mb-2 text-xs font-semibold text-slate-700">
            Funnel Throughput
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">MQLs</dt>
              <dd className="font-semibold">
                {funnel.mqls.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">SQLs</dt>
              <dd className="font-semibold">
                {funnel.sqls.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Opportunities</dt>
              <dd className="font-semibold">
                {funnel.opportunities.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Proposals</dt>
              <dd className="font-semibold">
                {funnel.proposals.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Wins (New Customers)
              </dt>
              <dd className="font-semibold">
                {funnel.wins.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">New ARR</dt>
              <dd className="font-semibold">
                {formatCurrency(funnel.newArr)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <h3 className="mb-2 text-xs font-semibold text-slate-700">
            ARR Forecast
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">
                Projected ARR (3m)
              </dt>
              <dd className="font-semibold">
                {formatCurrency(forecast.projectedArr3m)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Projected ARR (6m)
              </dt>
              <dd className="font-semibold">
                {formatCurrency(forecast.projectedArr6m)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Projected ARR (12m)
              </dt>
              <dd className="font-semibold">
                {formatCurrency(forecast.projectedArr12m)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Churned ARR / year
              </dt>
              <dd className="font-semibold text-rose-700">
                {formatCurrency(forecast.churnedArrYear)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Expansion ARR / year
              </dt>
              <dd className="font-semibold text-emerald-700">
                {formatCurrency(forecast.expansionArrYear)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <h3 className="mb-2 text-xs font-semibold text-slate-700">
            Efficiency Metrics
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">
                CAC Payback
              </dt>
              <dd className="font-semibold">
                {efficiency.cacPaybackMonths
                  ? `${efficiency.cacPaybackMonths.toFixed(
                      1
                    )} months`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                LTV / Customer
              </dt>
              <dd className="font-semibold">
                {efficiency.ltv
                  ? formatCurrency(efficiency.ltv)
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                LTV / CAC
              </dt>
              <dd className="font-semibold">
                {efficiency.ltvToCac
                  ? efficiency.ltvToCac.toFixed(1)
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">
                Pipeline Coverage
              </dt>
              <dd className="flex items-center gap-2 font-semibold">
                {efficiency.pipelineCoverageActual !== null
                  ? formatPct(efficiency.pipelineCoverageActual)
                  : "-"}
                <Badge tone={coverageTone}>
                  {efficiency.pipelineCoverageStatus ===
                  "strong"
                    ? "Strong"
                    : efficiency.pipelineCoverageStatus ===
                      "ok"
                    ? "OK"
                    : "Under"}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <h3 className="mb-2 text-xs font-semibold text-slate-700">
            Key Recommendations
          </h3>
          <ul className="space-y-2 text-xs">
            {recommendations.map((rec, idx) => {
              const tone =
                rec.severity === "critical"
                  ? "critical"
                  : rec.severity === "warning"
                  ? "warning"
                  : "neutral";

              return (
                <li
                  key={idx}
                  className="rounded-lg border border-slate-100 bg-white p-2"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {rec.area}
                    </span>
                    <Badge tone={tone as any}>
                      {rec.severity === "critical"
                        ? "Priority"
                        : rec.severity === "warning"
                        ? "Attention"
                        : "Info"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {rec.message}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
