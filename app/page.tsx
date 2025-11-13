"use client";

import { useState, useMemo } from "react";
import InputSection from "@/components/InputSection";
import NumberInput from "@/components/NumberInput";
import ScenarioPanel from "@/components/ScenarioPanel";
import ResultsPanel from "@/components/ResultsPanel";
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
      <header className="mb-8 space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">
          SaaS Revenue Throughput & Scenario Calculator
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Full-funnel view of acquisition, conversion,
          retention, and profitability. Adjust inputs across
          marketing, sales, and customer success, then use
          scenario planning to see how small changes impact ARR
          and unit economics.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputSection
              title="Marketing (Acquisition)"
              subtitle="Traffic, leads, and early-funnel conversion."
            >
              <NumberInput
                label="Monthly website traffic"
                value={marketing.traffic}
                onChange={(v) =>
                  setMarketing({ ...marketing, traffic: v })
                }
              />
              <NumberInput
                label="Leads per month"
                value={marketing.leads}
                onChange={(v) =>
                  setMarketing({ ...marketing, leads: v })
                }
              />
              <NumberInput
                label="Lead → MQL"
                suffix="%"
                value={marketing.mqlRate}
                onChange={(v) =>
                  setMarketing({ ...marketing, mqlRate: v })
                }
              />
              <NumberInput
                label="MQL → SQL"
                suffix="%"
                value={marketing.sqlRate}
                onChange={(v) =>
                  setMarketing({ ...marketing, sqlRate: v })
                }
              />
              <NumberInput
                label="SQL → Opportunity"
                suffix="%"
                value={marketing.oppRate}
                onChange={(v) =>
                  setMarketing({ ...marketing, oppRate: v })
                }
              />
              <NumberInput
                label="Blended CAC per new customer"
                suffix="€"
                value={marketing.blendedCAC}
                onChange={(v) =>
                  setMarketing({
                    ...marketing,
                    blendedCAC: v
                  })
                }
              />
            </InputSection>

            <InputSection
              title="Sales (Pipeline & Conversion)"
              subtitle="From opportunity to closed-won and ASP."
            >
              <NumberInput
                label="Opp → Proposal"
                suffix="%"
                value={sales.oppToProposal}
                onChange={(v) =>
                  setSales({ ...sales, oppToProposal: v })
                }
              />
              <NumberInput
                label="Proposal → Won"
                suffix="%"
                value={sales.proposalToWin}
                onChange={(v) =>
                  setSales({
                    ...sales,
                    proposalToWin: v
                  })
                }
              />
              <NumberInput
                label="Average sale price (ACV)"
                suffix="€"
                value={sales.asp}
                onChange={(v) =>
                  setSales({ ...sales, asp: v })
                }
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputSection
              title="Customer Success (Retention & Expansion)"
              subtitle="Churn, expansion, and margin profile."
            >
              <NumberInput
                label="Monthly churn rate"
                suffix="%"
                value={cs.monthlyChurnRate}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    monthlyChurnRate: v
                  })
                }
                step={0.1}
              />
              <NumberInput
                label="Expansion rate (ARR per year)"
                suffix="%"
                value={cs.expansionRate}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    expansionRate: v
                  })
                }
              />
              <NumberInput
                label="NRR"
                suffix="%"
                value={cs.nrr}
                onChange={(v) =>
                  setCs({ ...cs, nrr: v })
                }
              />
              <NumberInput
                label="Gross margin"
                suffix="%"
                value={cs.grossMargin}
                onChange={(v) =>
                  setCs({
                    ...cs,
                    grossMargin: v
                  })
                }
              />
            </InputSection>

            <InputSection
              title="Finance (ARR Targets)"
              subtitle="Current and target ARR for planning and coverage."
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

          <ResultsPanel result={result} />
        </div>

        <div className="space-y-4">
          <ScenarioPanel
            scenarios={scenarios}
            onChange={setScenarios}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft text-xs text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">
              How to use this model
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>
                Enter your actuals for marketing, sales,
                customer success, and ARR.
              </li>
              <li>
                Review funnel throughput, ARR forecast, unit
                economics, and pipeline coverage.
              </li>
              <li>
                Use the scenario sliders to test changes in
                conversion, churn, and ASP, then see the impact
                on ARR and payback.
              </li>
              <li>
                Use the recommendations as a starting point for
                where to focus efforts across the revenue
                engine.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
