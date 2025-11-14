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
  ScenarioAdjustments,
} from "@/lib/calculations";

export default function Page() {
  // ------------------------
  // INPUT STATE (actuals)
  // ------------------------

  const [marketing, setMarketing] = useState<MarketingInputs>({
    traffic: 50000,
    leads: 1500,
    mqlRate: 25,
    sqlRate: 40,
    oppRate: 35,
    blendedCAC: 25000,
  });

  const [sales, setSales] = useState<SalesInputs>({
    oppToProposal: 50,
    proposalToWin: 25,
    asp: 50000,
    salesCycleDays: 90,
    pipelineCoverageTarget: 3,
    openPipelineValue: 1500000,
  });

  const [cs, setCs] = useState<CsInputs>({
    monthlyChurnRate: 1,
    expansionRate: 20,
    nrr: 120,
    grossMargin: 75,
  });

  const [finance, setFinance] = useState<FinanceInputs>({
    currentArr: 1500000,
    targetArr: 2500000,
  });

  const [scenarios, setScenarios] = useState<ScenarioAdjustments>({
    convLiftPct: 0,
    churnImprovementPct: 0,
    aspIncreasePct: 0,
  });

  // ------------------------
  // BENCHMARK STATE
  // ------------------------

  const [showBenchmarkSettings, setShowBenchmarkSettings] = useState(false);

  const [marketingBenchmarks, setMarketingBenchmarks] = useState({
    mqlRate: 25,
    sqlRate: 40,
    oppRate: 35,
    blendedCAC: 25000,
  });

  const [salesBenchmarks, setSalesBenchmarks] = useState({
    sqlToOpp: 35,
    oppToProposal: 50,
    proposalToWin: 25,
    asp: 50000,
  });

  const [csBenchmarks, setCsBenchmarks] = useState({
    monthlyChurnRate: 1,
    expansionRate: 20,
    nrr: 120,
    grossMargin: 75,
  });

  // ------------------------
  // CALCULATIONS
  // ------------------------

  const result = useMemo(
    () => calculateAll(marketing, sales, cs, finance, scenarios),
    [marketing, sales, cs, finance, scenarios]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* HEADER */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">
            SaaS Revenue Throughput & Forecast Dashboard
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Full-funnel view of acquisition, conversion, retention, and ARR forecasting.
            Adjust enterprise benchmarks and track gaps instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBenchmarkSettings((prev) => !prev)}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
        >
          {showBenchmarkSettings ? "Hide benchmarks" : "Adjust benchmarks"}
        </button>
      </header>

      {/* BENCHMARK DROPDOWN UNDER HEADER */}
      {showBenchmarkSettings && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Benchmarks</h2>
            <p className="text-xs text-slate-600">
              Enterprise benchmarks for ACV, churn, conversion performance, and ARR.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {/* Marketing benchmarks */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <h3 className="text-xs font-semibold text-slate-800">Marketing</h3>
              <NumberInput
                label="Lead → MQL target"
                suffix="%"
                value={marketingBenchmarks.mqlRate}
                onChange={(v) =>
                  setMarketingBenchmarks({ ...marketingBenchmarks, mqlRate: v })
                }
              />
              <NumberInput
                label="MQL → SQL target"
                suffix="%"
                value={marketingBenchmarks.sqlRate}
                onChange={(v) =>
                  setMarketingBenchmarks({ ...marketingBenchmarks, sqlRate: v })
                }
              />
              <NumberInput
                label="SQL → Opp target"
                suffix="%"
                value={marketingBenchmarks.oppRate}
                onChange={(v) =>
                  setMarketingBenchmarks({ ...marketingBenchmarks, oppRate: v })
                }
              />
              <NumberInput
                label="Blended CAC target"
                suffix="€"
                value={marketingBenchmarks.blendedCAC}
                onChange={(v) =>
                  setMarketingBenchmarks({
                    ...marketingBenchmarks,
                    blendedCAC: v,
                  })
                }
              />
            </div>

            {/* Sales benchmarks */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <h3 className="text-xs font-semibold text-slate-800">Sales</h3>
              <NumberInput
                label="SQL → Opp target"
                suffix="%"
                value={salesBenchmarks.sqlToOpp}
                onChange={(v) =>
                  setSalesBenchmarks({ ...salesBenchmarks, sqlToOpp: v })
                }
              />
              <NumberInput
                label="Opp → Proposal target"
                suffix="%"
                value={salesBenchmarks.oppToProposal}
                onChange={(v) =>
                  setSalesBenchmarks({
                    ...salesBenchmarks,
                    oppToProposal: v,
                  })
                }
              />
              <NumberInput
                label="Proposal → Win target"
                suffix="%"
                value={salesBenchmarks.proposalToWin}
                onChange={(v) =>
                  setSalesBenchmarks({
                    ...salesBenchmarks,
                    proposalToWin: v,
                  })
                }
              />
              <NumberInput
                label="ACV target"
                suffix="€"
                value={salesBenchmarks.asp}
                onChange={(v) =>
                  setSalesBenchmarks({ ...salesBenchmarks, asp: v })
                }
              />
            </div>

            {/* CS benchmarks */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Customer Success
              </h3>
              <NumberInput
                label="Monthly churn target"
                suffix="%"
                value={csBenchmarks.monthlyChurnRate}
                onChange={(v) =>
                  setCsBenchmarks({
                    ...csBenchmarks,
                    monthlyChurnRate: v,
                  })
                }
              />
              <NumberInput
                label="Expansion target"
                suffix="%"
                value={csBenchmarks.expansionRate}
                onChange={(v) =>
                  setCsBenchmarks({ ...csBenchmarks, expansionRate: v })
                }
              />
              <NumberInput
                label="NRR target"
                suffix="%"
                value={csBenchmarks.nrr}
                onChange={(v) =>
                  setCsBenchmarks({ ...csBenchmarks, nrr: v })
                }
              />
              <NumberInput
                label="Gross Margin target"
                suffix="%"
                value={csBenchmarks.grossMargin}
                onChange={(v) =>
                  setCsBenchmarks({ ...csBenchmarks, grossMargin: v })
                }
              />
            </div>

            {/* ARR benchmarks */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <h3 className="text-xs font-semibold text-slate-800">ARR</h3>
              <NumberInput
                label="Current ARR"
                suffix="€"
                value={finance.currentArr}
                onChange={(v) =>
                  setFinance({ ...finance, currentArr: v })
                }
              />
              <NumberInput
                label="12-month ARR target"
                suffix="€"
                value={finance.targetArr}
                onChange={(v) =>
                  setFinance({ ...finance, targetArr: v })
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* HERO DASHBOARD */}
      <div className="mb-6">
        <ResultsPanel result={result} targetArr={finance.targetArr} />
      </div>

      {/* 3 COLS: Marketing, Sales, CS */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* MARKETING */}
        <InputSection title="Marketing" subtitle="Acquisition health (monthly).">
          <NumberInput
            label="Website traffic"
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
          <MetricInputWithBenchmark
            label="Lead → MQL"
            value={marketing.mqlRate}
            onChange={(v) =>
              setMarketing({ ...marketing, mqlRate: v })
            }
            benchmark={marketingBenchmarks.mqlRate}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="MQL → SQL"
            value={marketing.sqlRate}
            onChange={(v) =>
              setMarketing({ ...marketing, sqlRate: v })
            }
            benchmark={marketingBenchmarks.sqlRate}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="SQL → Opportunity"
            value={marketing.oppRate}
            onChange={(v) =>
              setMarketing({ ...marketing, oppRate: v })
            }
            benchmark={marketingBenchmarks.oppRate}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="Blended CAC"
            value={marketing.blendedCAC}
            onChange={(v) =>
              setMarketing({ ...marketing, blendedCAC: v })
            }
            benchmark={marketingBenchmarks.blendedCAC}
            mode="currency"
          />
        </InputSection>

        {/* SALES */}
        <InputSection title="Sales" subtitle="Pipeline, ACV and close rates.">
          <MetricInputWithBenchmark
            label="Opp → Proposal"
            value={sales.oppToProposal}
            onChange={(v) =>
              setSales({ ...sales, oppToProposal: v })
            }
            benchmark={salesBenchmarks.oppToProposal}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="Proposal → Win"
            value={sales.proposalToWin}
            onChange={(v) =>
              setSales({ ...sales, proposalToWin: v })
            }
            benchmark={salesBenchmarks.proposalToWin}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="ACV (ASP)"
            value={sales.asp}
            onChange={(v) =>
              setSales({ ...sales, asp: v })
            }
            benchmark={salesBenchmarks.asp}
            mode="currency"
          />
          <NumberInput
            label="Sales cycle"
            suffix="days"
            value={sales.salesCycleDays}
            onChange={(v) =>
              setSales({ ...sales, salesCycleDays: v })
            }
          />
          <NumberInput
            label="Open pipeline value"
            suffix="€"
            value={sales.openPipelineValue}
            onChange={(v) =>
              setSales({ ...sales, openPipelineValue: v })
            }
          />
          <NumberInput
            label="Pipeline coverage target"
            suffix="×"
            value={sales.pipelineCoverageTarget}
            step={0.5}
            onChange={(v) =>
              setSales({ ...sales, pipelineCoverageTarget: v })
            }
          />
        </InputSection>

        {/* CUSTOMER SUCCESS */}
        <InputSection title="Customer Success" subtitle="Retention & expansion health.">
          <MetricInputWithBenchmark
            label="Monthly churn rate"
            value={cs.monthlyChurnRate}
            onChange={(v) =>
              setCs({ ...cs, monthlyChurnRate: v })
            }
            benchmark={csBenchmarks.monthlyChurnRate}
            mode="percent"
          />
          <MetricInputWithBenchmark
            label="Expansion rate"
            value={cs.expansionRate}
            onChange={(v) =>
              setCs({ ...cs, expansionRate: v })
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
            label="Gross Margin %"
            value={cs.grossMargin}
            onChange={(v) =>
              setCs({ ...cs, grossMargin: v })
            }
            benchmark={csBenchmarks.grossMargin}
            mode="percent"
          />
        </InputSection>
      </div>

      {/* SCENARIO AT BOTTOM */}
      <InputSection
        title="Scenario Planning"
        subtitle="Dial up conversion rates, reduce churn, or increase ACV and see immediate impact on the forecast above."
      >
        <ScenarioPanel scenarios={scenarios} onChange={setScenarios} />
      </InputSection>
    </main>
  );
}
