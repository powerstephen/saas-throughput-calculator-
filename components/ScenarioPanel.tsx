import NumberInput from "@/components/NumberInput";
import { ScenarioAdjustments } from "@/lib/calculations";

type Props = {
  scenarios: ScenarioAdjustments;
  onChange: (s: ScenarioAdjustments) => void;
};

export default function ScenarioPanel({ scenarios, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-200">
        Use these controls to test simple &ldquo;what if&rdquo; changes to your
        current performance. The dashboard above will update instantly.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <NumberInput
          label="Conversion lift"
          suffix="%"
          value={scenarios.convLiftPct}
          onChange={(v) =>
            onChange({
              ...scenarios,
              convLiftPct: v,
            })
          }
          min={-50}
          max={100}
          step={1}
        />

        <NumberInput
          label="Churn improvement"
          suffix="%"
          value={scenarios.churnImprovementPct}
          onChange={(v) =>
            onChange({
              ...scenarios,
              churnImprovementPct: v,
            })
          }
          min={-50}
          max={100}
          step={1}
        />

        <NumberInput
          label="ACV (ASP) increase"
          suffix="%"
          value={scenarios.aspIncreasePct}
          onChange={(v) =>
            onChange({
              ...scenarios,
              aspIncreasePct: v,
            })
          }
          min={-50}
          max={200}
          step={1}
        />
      </div>

      <p className="text-[10px] text-slate-400">
        Example: set +10% conversion lift and -20% churn to see how a tighter
        funnel and better retention change your ARR trajectory and run rate.
      </p>
    </div>
  );
}
