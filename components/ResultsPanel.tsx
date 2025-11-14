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
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-soft">
      {/* ROW 1: Funnel throughput – hero row */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Funnel Throughput
        </h2>
        <span className="text-[11px] text-slate-500">
          From lead to new ARR
        </span>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile
          label="MQLs"
          value={funnel.mqls.toFixed(0)}
        />
        <MetricTile
          label="SQLs"
          value={funnel.sqls.toFixed(0)}
        />
        <MetricTile
          label="Opportunities"
          value={funnel.opportunities.toFixed(0)}
        />
        <MetricTile
          label="Proposals"
          value={funnel.proposals.toFixed(0)}
        />
        <MetricTile
          label="Wins"
          value={funnel.wins.toFixed(0)}
        />
        <MetricTile
          label="New ARR"
          value={formatCurrency(funnel.newArr)}
          accent="green"
        />
      </div>

      {/* ROW 2: ARR forecast */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          ARR Forecast (Current Run Rate)
        </h2>
        <span className="text-[11px] text-slate-500">
          Includes churn and expansion
        </span>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricTile
          label="ARR in 3 months"
          value={formatCurrency(forecast.projectedArr3m)}
        />
        <MetricTile
          label="ARR in 6 months"
          value={formatCurrency(forecast.projectedArr6m)}
        />
        <MetricTile
          label="ARR in 12 months"
          value={formatCurrency(forecast.projectedArr12m)}
          accent="blue"
        />
        <MetricTile
          label="Churned ARR / year"
          value={formatCurrency(forecast.churnedArrYear)}
          accent="red"
        />
        <MetricTile
          label="Expansion ARR / year"
          value={formatCurrency(forecast.expansionArrYear)}
          accent="green"
        />
      </div>

      {/* ROW 3: Efficiency / risk */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Efficiency & Risk
        </h2>
        <span className="text-[11px] text-slate-500">
          Payback, unit economics, pipeline coverage
        </span>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="CAC payback"
          value={
            efficiency.cacPaybackMonths
              ? `${efficiency.cacPaybackMonths.toFixed(
                  1
                )} months`
              : "-"
          }
        />
        <MetricTile
          label="LTV / customer"
          value={
            efficiency.ltv
              ? formatCurrency(efficiency.ltv)
              : "-"
          }
        />
        <MetricTile
          label="LTV / CAC"
          value={
            efficiency.ltvToCac
              ? efficiency.ltvToCac.toFixed(1)
              : "-"
          }
        />
        <MetricTile
          label="Pipeline coverage"
          value={
            efficiency.pipelineCoverageActual !== null
              ? formatPct(efficiency.pipelineCoverageActual)
              : "-"
          }
          rightBadge={
            <Badge tone={coverageTone}>
              {efficiency.pipelineCoverageStatus === "strong"
                ? "Strong"
                : efficiency.pipelineCoverageStatus === "ok"
                ? "OK"
                : "Under"}
            </Badge>
          }
        />
      </div>

      {/* ROW 4: Recommendations */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recommendations
          </h2>
          <span className="text-[11px] text-slate-500">
            Where to focus next
          </span>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          {recommendations.map((rec, idx) => {
            const tone =
              rec.severity === "critical"
                ? "critical"
                : rec.severity === "warning"
                ? "warning"
                : "neutral";

            return (
              <div
                key={idx}
                className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-800">
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
                <p className="text-[11px] text-slate-700">
                  {rec.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Small reusable tile component for the dashboard metrics
 */
type MetricTileProps = {
  label: string;
  value: string;
  accent?: "green" | "red" | "blue";
  rightBadge?: React.ReactNode;
};

function MetricTile({
  label,
  value,
  accent,
  rightBadge
}: MetricTileProps) {
  const accentClass =
    accent === "green"
      ? "border-emerald-100 bg-emerald-50/60"
      : accent === "red"
      ? "border-rose-100 bg-rose-50/60"
      : accent === "blue"
      ? "border-sky-100 bg-sky-50/60"
      : "border-slate-100 bg-white";

  const valueColour =
    accent === "green"
      ? "text-emerald-800"
      : accent === "red"
      ? "text-rose-800"
      : accent === "blue"
      ? "text-sky-800"
      : "text-slate-900";

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border px-3 py-2 ${accentClass}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-600">
          {label}
        </span>
        {rightBadge}
      </div>
      <div
        className={`text-sm font-semibold leading-tight ${valueColour}`}
      >
        {value}
      </div>
    </div>
  );
}
