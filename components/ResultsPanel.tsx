import { CalculatorResult } from "@/lib/calculations";

type Props = {
  result: CalculatorResult;
  currentArr: number;
  targetArr: number;
  timeframeWeeks: number;
};

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}k`;
  return `€${value.toFixed(0)}`;
}

function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(0)}%`;
}

export default function ResultsPanel({
  result,
  currentArr,
  targetArr,
  timeframeWeeks,
}: Props) {
  const { funnel, forecast, efficiency, recommendations } = result;

  const netNewArrYear =
    funnel.newArrAnnual +
    forecast.expansionArrYear -
    forecast.churnedArrYear;

  // Timeframe logic: convert weeks → months (approx)
  const safeWeeks = timeframeWeeks > 0 ? timeframeWeeks : 1;
  const monthsEquivalent = safeWeeks / 4.3; // ~4.3 weeks per month

  // ARR at current run rate over the selected timeframe
  const arrAtTimeframe =
    currentArr + forecast.monthlyNetNewArr * monthsEquivalent;

  const gapAtTimeframe = arrAtTimeframe - targetArr;

  // Run-rate logic (timeframe-aware)
  const requiredMonthlyNetNewArr =
    (targetArr - currentArr) / monthsEquivalent;

  const runRateDelta =
    forecast.monthlyNetNewArr - requiredMonthlyNetNewArr;

  const onTrack =
    arrAtTimeframe >= targetArr ||
    forecast.monthlyNetNewArr >= requiredMonthlyNetNewArr;

  let runRateTone: "success" | "warning" | "critical" = "warning";
  if (onTrack) runRateTone = "success";
  else if (
    runRateDelta < 0 &&
    Math.abs(runRateDelta) > Math.abs(requiredMonthlyNetNewArr) * 0.3
  ) {
    runRateTone = "critical";
  }

  let coverageTone: "neutral" | "success" | "warning" | "critical" =
    "neutral";

  if (efficiency.pipelineCoverageStatus === "strong") coverageTone = "success";
  else if (efficiency.pipelineCoverageStatus === "ok") coverageTone = "warning";
  else if (efficiency.pipelineCoverageStatus === "under") coverageTone = "critical";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-50 shadow-soft">
      {/* TOPLINE: ARR & RUN RATE */}
      <div className="rounded-2xl bg-sky-900 px-4 py-3 text-slate-50">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            Top Results · ARR & Run Rate
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              runRateTone === "success"
                ? "bg-emerald-500/20 text-emerald-100"
                : runRateTone === "critical"
                ? "bg-rose-500/20 text-rose-100"
                : "bg-amber-400/20 text-amber-100"
            }`}
          >
            {onTrack ? "On track" : "Behind target"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <HeroMetric
            label="Current ARR"
            value={formatCurrency(currentArr)}
          />
          <HeroMetric
            label={`ARR at run rate (${safeWeeks}w)`}
            value={formatCurrency(arrAtTimeframe)}
          />
          <HeroMetric
            label="ARR target"
            value={formatCurrency(targetArr)}
          />
          <HeroMetric
            label={`Gap to target (${safeWeeks}w)`}
            value={formatCurrency(gapAtTimeframe)}
            accent={gapAtTimeframe >= 0 ? "green" : "red"}
          />
        </div>

        {/* Plain-English explanation */}
        <div className="mt-3 rounded-lg bg-slate-950/70 px-3 py-2 text-[11px] text-slate-200">
          You are adding{" "}
          <span className="font-semibold">
            {formatCurrency(forecast.monthlyNetNewArr)}/month
          </span>{" "}
          net new ARR. At that run rate, you reach{" "}
          <span className="font-semibold">
            {formatCurrency(arrAtTimeframe)}
          </span>{" "}
          in{" "}
          <span className="font-semibold">
            {safeWeeks} weeks
          </span>
          . To hit{" "}
          <span className="font-semibold">
            {formatCurrency(targetArr)}
          </span>{" "}
          in that timeframe, you need{" "}
          <span className="font-semibold">
            {formatCurrency(requiredMonthlyNetNewArr)}/month
          </span>
          .{" "}
          {onTrack ? (
            <span className="text-emerald-200">
              Your current run rate is sufficient or ahead of plan.
            </span>
          ) : (
            <span className="text-amber-200">
              Your current run rate is below what&apos;s needed to hit target in this timeframe.
            </span>
          )}
        </div>
      </div>

      {/* ROW 1: Funnel Throughput */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Funnel Throughput
          </h2>
          <span className="text-[11px] text-slate-400">
            Monthly funnel, annualised new ARR
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricTile label="MQLs / month" value={funnel.mqls.toFixed(0)} />
          <MetricTile label="SQLs / month" value={funnel.sqls.toFixed(0)} />
          <MetricTile
            label="Opportunities / month"
            value={funnel.opportunities.toFixed(0)}
          />
          <MetricTile
            label="Proposals / month"
            value={funnel.proposals.toFixed(0)}
          />
          <MetricTile label="Wins / month" value={funnel.wins.toFixed(0)} />
          <MetricTile
            label="New ARR / year"
            value={formatCurrency(funnel.newArrAnnual)}
            accent="green"
          />
        </div>
      </div>

      {/* ROW 2: ARR forecast (still 3/6/12m) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            ARR Forecast · Current Run Rate
          </h2>
          <span className="text-[11px] text-slate-400">
            Includes churn & expansion
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          <MetricTile
            label="Net new ARR / year"
            value={formatCurrency(netNewArrYear)}
            accent={netNewArrYear >= 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* ROW 3: Monthly Flow & Run Rate */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Monthly Flow & Run Rate
          </h2>
          <span className="text-[11px] text-slate-400">
            Is your current net new enough to hit the ARR target in time?
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Monthly new ARR (wins only)"
            value={formatCurrency(forecast.monthlyNewArr)}
          />
          <MetricTile
            label="Approx. net new ARR / month"
            value={formatCurrency(forecast.monthlyNetNewArr)}
            accent={forecast.monthlyNetNewArr >= 0 ? "green" : "red"}
          />
          <MetricTile
            label={`Required net new / month (${safeWeeks}w target)`}
            value={formatCurrency(requiredMonthlyNetNewArr)}
            accent="blue"
          />
          <MetricTile
            label="Run rate delta / month"
            value={formatCurrency(runRateDelta)}
            accent={runRateDelta >= 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* ROW 4: Efficiency / Pipeline Risk */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Efficiency & Pipeline Risk
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="CAC payback"
            value={
              efficiency.cacPaybackMonths
                ? `${efficiency.cacPaybackMonths.toFixed(1)} months`
                : "-"
            }
          />
          <MetricTile
            label="LTV / customer"
            value={efficiency.ltv ? formatCurrency(efficiency.ltv) : "-"}
          />
          <MetricTile
            label="LTV / CAC"
            value={efficiency.ltvToCac ? efficiency.ltvToCac.toFixed(1) : "-"}
          />
          <MetricTile
            label="Pipeline coverage"
            value={
              efficiency.pipelineCoverageActual !== null
                ? formatPct(efficiency.pipelineCoverageActual)
                : "-"
            }
            rightBadge={
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  coverageTone === "success"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : coverageTone === "warning"
                    ? "bg-amber-500/20 text-amber-100"
                    : coverageTone === "critical"
                    ? "bg-rose-500/20 text-rose-100"
                    : "bg-slate-500/30 text-slate-100"
                }`}
              >
                {efficiency.pipelineCoverageStatus === "strong"
                  ? "Strong"
                  : efficiency.pipelineCoverageStatus === "ok"
                  ? "OK"
                  : "Under"}
              </span>
            }
          />
        </div>
      </div>

      {/* ROW 5: Recommendations */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Recommendations
          </h2>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          {recommendations.map((rec, idx) => {
            const borderColour =
              rec.severity === "critical"
                ? "border-rose-500/40 bg-rose-900/40"
                : rec.severity === "warning"
                ? "border-amber-500/40 bg-amber-900/40"
                : "border-slate-700 bg-slate-800";

            const badgeColour =
              rec.severity === "critical"
                ? "bg-rose-500/30 text-rose-100"
                : rec.severity === "warning"
                ? "bg-amber-500/30 text-amber-100"
                : "bg-slate-500/30 text-slate-100";

            const badgeLabel =
              rec.severity === "critical"
                ? "Priority"
                : rec.severity === "warning"
                ? "Attention"
                : "Info";

            return (
              <div
                key={idx}
                className={`flex flex-col gap-1 rounded-xl border px-3 py-2.5 ${borderColour}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-50">
                    {rec.area}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColour}`}
                  >
                    {badgeLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-100">
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
  rightBadge,
}: MetricTileProps) {
  const accentClass =
    accent === "green"
      ? "border-emerald-500/40 bg-emerald-900/40"
      : accent === "red"
      ? "border-rose-500/40 bg-rose-900/40"
      : accent === "blue"
      ? "border-sky-500/40 bg-sky-900/40"
      : "border-slate-700 bg-slate-800";

  const valueColour =
    accent === "green"
      ? "text-emerald-200"
      : accent === "red"
      ? "text-rose-200"
      : accent === "blue"
      ? "text-sky-200"
      : "text-slate-50";

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border px-3 py-2.5 ${accentClass}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-300">
          {label}
        </span>
        {rightBadge}
      </div>
      <div className={`text-base font-semibold leading-tight ${valueColour}`}>
        {value}
      </div>
    </div>
  );
}

type HeroMetricProps = {
  label: string;
  value: string;
  accent?: "green" | "red";
};

function HeroMetric({ label, value, accent }: HeroMetricProps) {
  const valueColour =
    accent === "green"
      ? "text-emerald-200"
      : accent === "red"
      ? "text-rose-200"
      : "text-slate-50";

  return (
    <div className="space-y-0.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
        {label}
      </div>
      <div className={`text-lg font-semibold ${valueColour}`}>{value}</div>
    </div>
  );
}
