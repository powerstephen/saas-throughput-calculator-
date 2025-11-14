"use client";

import { useState, useMemo } from "react";
import InputSection from "@/components/InputSection";
import NumberInput from "@/components/NumberInput";
import ScenarioPanel from "@/components/ScenarioPanel";
import ResultsPanel from "@/components/ResultsPanel";
import MetricInputWithBenchmark from "@/components/MetricInputWithBenchmark";
import {
  calculateAll,
  MarketingInputs,
  SalesInputs,
  CsInputs,
  FinanceInputs,
  ScenarioAdjustments
} from "@/lib/calculations";

export default function Page() {
  const [marketing, setMarketing] = useState<MarketingInputs>({
    traffic: 50000,
    leads: 1500,
    mqlRate: 25,
    sqlRate: 40,
    oppRate: 40,
    blendedCAC: 2500
  });

  const [sales, setSales] = useState<SalesInputs>({
    oppToProposal: 60,
    proposalToWin: 25,
    asp: 12000,
    salesCycleDays: 45,
    pipelineCoverageTarget: 3,
    openPipelineValue: 600000
  });

  const [cs, setCs] = useState<CsInputs>({
    monthlyChurnRate: 3,
    expansionRate: 15,
    nrr: 115,
    grossMargin: 75
  });

  const [finance, setFinance] = useState<FinanceInputs>({
    currentArr: 1500000,
    targetArr: 2500000
  });

  const [scenarios, setScenarios] =
    useState<ScenarioAdjustments>({
      convLiftPct: 0,
      churnImprovementPct: 0,
      aspIncreasePct: 0
    });

  // Benchmarks – tweak as you like
  const marketingBenchmarks = {
    mqlRate: 30,
    sqlRate: 40,
    oppRate: 40,
    blendedCAC: 2500
  };

  const salesBenchmarks = {
    oppToProposal: 60,
    proposalToWin: 30,
    asp: 12000
  };

  const csBenchmarks = {
    monthlyChurnRate: 2,
    expansionRate: 15,
    nrr: 115,
    grossMargin: 75
  };

  const result = useMemo(
    () =>
      calculateAll(
        marketing,
        sales,
        cs,
        finance,
        scenarios
      ),
    [marketing, sales, cs, finance, scenarios]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">
          SaaS Revenue Throughput & Scenario Calculator
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Full-funnel view of acquisition, conversion,
          retention, and profitability. Adjust inputs across
          marketing, sales, and customer success, then see the
          impact on ARR, churn, and unit economics.
        </p>
      </header>

      {/* Full-funnel dashboard at the top */}
      <div className="mb-6">
        <ResultsPanel result={result} />
      </div>

      {/* Main layout: inputs on the left, scenarios on the right */}
      <div className="grid gap-6 lg:grid-cols-[3fr,1fr]">
        {/* LEFT: three columns of inputs + finance */}
        <div className="space-y-4">
          {/* Marketing / Sales / CS side by side */}
          <div className="grid gap-4 lg:grid-cols-3">
            <InputSection
              title="Marketing"
              subtitle="Acquisition and early-funnel performance."
            >
              <NumberInput
                label="Monthly website traffic"
                value={marketing.traffic}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    traffic: v
                  })
                }
              />
              <NumberInput
                label="Leads per month"
                value={marketing.leads}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    leads: v
                  })
                }
              />
              <MetricInputWithBenchmark
                label="Lead → MQL"
                value={marketing.mqlRate}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    mqlRate: v
                  })
                }
                benchmark={marketingBenchmarks.mqlRate}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="MQL → SQL"
                value={marketing.sqlRate}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    sqlRate: v
                  })
                }
                benchmark={marketingBenchmarks.sqlRate}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="SQL → Opportunity"
                value={marketing.oppRate}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    oppRate: v
                  })
                }
                benchmark={marketingBenchmarks.oppRate}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="Blended CAC per new customer"
                value={marketing.blendedCAC}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    blendedCAC: v
                  })
                }
                benchmark={marketingBenchmarks.blendedCAC}
                mode="currency"
              />
            </InputSection>

            <InputSection
              title="Sales"
              subtitle="Pipeline, conversion, and deal value."
            >
              <MetricInputWithBenchmark
                label="Opp → Proposal"
                value={sales.oppToProposal}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    oppToProposal: v
                  })
                }
                benchmark={salesBenchmarks.oppToProposal}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="Proposal → Won"
                value={sales.proposalToWin}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    proposalToWin: v
                  })
                }
                benchmark={salesBenchmarks.proposalToWin}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="Average sale price (ACV)"
                value={sales.asp}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    asp: v
                  })
                }
                benchmark={salesBenchmarks.asp}
                mode="currency"
              />
              <NumberInput
                label="Sales cycle"
                suffix="days"
                value={sales.salesCycleDays}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    salesCycleDays: v
                  })
                }
              />
              <NumberInput
                label="Pipeline coverage target"
                suffix="× ARR"
                value={sales.pipelineCoverageTarget}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    pipelineCoverageTarget: v
                  })
                }
                step={0.5}
              />
              <NumberInput
                label="Current open pipeline value"
                suffix="€"
                value={sales.openPipelineValue}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    openPipelineValue: v
                  })
                }
              />
            </InputSection>

            <InputSection
              title="Customer Success"
              subtitle="Retention, expansion, and margin."
            >
              <MetricInputWithBenchmark
                label="Monthly churn rate"
                value={cs.monthlyChurnRate}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    monthlyChurnRate: v
                  })
                }
                benchmark={csBenchmarks.monthlyChurnRate}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="Expansion rate (ARR per year)"
                value={cs.expansionRate}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    expansionRate: v
                  })
                }
                benchmark={csBenchmarks.expansionRate}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="NRR"
                value={cs.nrr}
                onChange={(v) =>
                  setCs({ ...cs, nrr: v })
                }
                benchmark={csBenchmarks.nrr}
                mode="percent"
              />
              <MetricInputWithBenchmark
                label="Gross margin"
                value={cs.grossMargin}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    grossMargin: v
                  })
                }
                benchmark={csBenchmarks.grossMargin}
                mode="percent"
              />
            </InputSection>
          </div>

          {/* Finance – still needed for the forecast, but small and simple */}
          <InputSection
            title="ARR Inputs"
            subtitle="Starting point and 12-month target for the model."
          >
            <NumberInput
              label="Current ARR"
              suffix="€"
              value={finance.currentArr}
              onChange={(v) =>
                setFinance({
                  ...finance,
                  currentArr: v
                })
              }
            />
            <NumberInput
              label="Target ARR (12 months)"
              suffix="€"
              value={finance.targetArr}
              onChange={(v) =>
                setFinance({
                  ...finance,
                  targetArr: v
                })
              }
            />
          </InputSection>
        </div>

        {/* RIGHT: scenario panel */}
        <div className="space-y-4">
          <ScenarioPanel
            scenarios={scenarios}
            onChange={setScenarios}
          />
        </div>
      </div>
    </main>
  );
}
