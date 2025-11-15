import { CalculatorResult } from "@/lib/calculations";

type Props = {
  result: CalculatorResult;
  currentArr: number;
  targetArr: number;
  timeframeWeeks: number;
  currencySymbol: string;
};

function formatCurrencyFull(value: number, currencySymbol: string): string {
  if (!Number.isFinite(value)) return "-";
  return `${currencySymbol}${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function ResultsPanel({
  result,
  currentArr,
  targetArr,
  timeframeWeeks,
  currencySymbol,
}: Props) {
  const { forecast, efficiency, recommendations } = result;

  const months = timeframeWeeks / 4.345; // rough conversion

  const projectedArrInTimeframe =
    currentArr + forecast.monthlyNetNewArr * months;

  const arrGap = targetArr - projectedArrInTimeframe;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-50 shadow-soft">
      {/* TOP: ARR summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-slate-800/70 p-3">
          <div className="text-[11px] text-slate-300">Current ARR</div>
          <div className="mt-1 text-lg font-bold">
            {formatCurrencyFull(currentArr, currencySymbol)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/70 p-3">
          <div className="text-[11px] text-slate-300">ARR Target</div>
          <div className="mt-1 text-lg font-bold">
            {formatCurrencyFull(targetArr, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Timeframe: ~{timeframeWeeks} weeks
          </div>
        </div>

        <div className="rounded-xl bg-sky-800/80 p-3">
          <div className="text-[11px] text-slate-100">
            Projected ARR in timeframe
          </div>
          <div className="mt-1 text-lg font-bold">
            {formatCurrencyFull(projectedArrInTimeframe, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-slate-100">
            vs target:{" "}
            <span className="font-semibold">
              {arrGap >= 0 ? "+" : "-"}
              {formatCurrencyFull(Math.abs(arrGap), currencySymbol)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/70 p-3">
          <div className="text-[11px] text-slate-300">
            ARR in 12 months (model)
          </div>
          <div className="mt-1 text-lg font-bold">
            {formatCurrencyFull(forecast.projectedArr12m, currencySymbol)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Net new / month:{" "}
            <span className="font-semibold">
              {formatCurrencyFull(forecast.monthlyNetNewArr, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* SECOND ROW: churn / expansion / efficiency */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="text-[11px] text-slate-300">Churned ARR / year</div>
          <div className="mt-1 text-base font-semibold">
            {formatCurrencyFull(forecast.churnedArrYear, currencySymbol)}
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            Expansion ARR / year:{" "}
            <span className="font-semibold">
              {formatCurrencyFull(forecast.expansionArrYear, currencySymbol)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="text-[11px] text-slate-300">CAC Payback</div>
          <div className="mt-1 text-base font-semibold">
            {efficiency.cacPaybackMonths
              ? `${efficiency.cacPaybackMonths.toFixed(1)} months`
              : "—"}
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            LTV:CAC:{" "}
            <span className="font-semibold">
              {efficiency.ltvToCac
                ? efficiency.ltvToCac.toFixed(2)
                : "—"}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="text-[11px] text-slate-300">
            Pipeline Coverage Status
          </div>
          <div className="mt-1 text-base font-semibold capitalize">
            {efficiency.pipelineCoverageStatus}
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            Coverage multiple:{" "}
            <span className="font-semibold">
              {efficiency.pipelineCoverageActual
                ? `${efficiency.pipelineCoverageActual.toFixed(2)}×`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="mt-4 rounded-xl bg-slate-800/50 p-3">
        <div className="mb-2 text-xs font-semibold text-slate-100">
          Recommendations
        </div>

        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-700 bg-slate-900/60 p-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200">
                  {rec.area}
                </span>
                <span
                  className={`rounded-full px-2 py-[1px] text-[10px] font-semibold ${
                    rec.severity === "critical"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : rec.severity === "warning"
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                      : "bg-slate-600/30 text-slate-200 border border-slate-500/40"
                  }`}
                >
                  {rec.severity}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-200">
                {rec.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
