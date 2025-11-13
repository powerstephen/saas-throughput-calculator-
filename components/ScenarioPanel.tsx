import NumberInput from "./NumberInput";
import { ScenarioAdjustments } from "@/lib/calculations";

type Props = {
  scenarios: ScenarioAdjustments;
  onChange: (value: ScenarioAdjustments) => void;
};

export default function ScenarioPanel({ scenarios, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-50 shadow-soft">
      <h2 className="text-sm font-semibold">
        Scenario Planning
      </h2>
      <p className="mt-1 text-xs text-slate-300">
        Adjust global assumptions to test impact on ARR,
        throughput, and profitability.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <NumberInput
          label="Conversion uplift"
          suffix="% across funnel"
          value={scenarios.convLiftPct}
          onChange={(v) =>
            onChange({ ...scenarios, convLiftPct: v })
          }
          min={-50}
          max={100}
          step={1}
        />
        <NumberInput
          label="Churn improvement"
          suffix="% reduction"
          value={scenarios.churnImprovementPct}
          onChange={(v) =>
            onChange({ ...scenarios, churnImprovementPct: v })
          }
          min={0}
          max={100}
          step={1}
        />
        <NumberInput
          label="ASP increase"
          suffix="%"
          value={scenarios.aspIncreasePct}
          onChange={(v) =>
            onChange({ ...scenarios, aspIncreasePct: v })
          }
          min={-50}
          max={100}
          step={1}
        />
      </div>
    </section>
  );
}
