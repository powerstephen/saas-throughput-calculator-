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

  const [timeframeWeeks, setTimeframeWeeks] = useState<number>(52);

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
      {/* HEADER — logo left, title centered, button right */}
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT: Bigger transparent logo */}
          <div className="flex items-center justify-start sm:w-[200px]">
            <img
              src="/power-logo.png"
              alt="Dashboard logo"
              className="h-28 w-28 object-contain"
            />
          </div>

          {/* CENTER: Title + subtitle */}
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              SaaS Revenue Engine Dashboard
            </h1>

            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-sky-500" />

            <p className="mt-3 max-w-2xl mx-auto text-base font-medium text-slate-600">
              Key Metrics: Throughput, ARR Run Rate, Full-Funnel Performance & Forecast Intelligence
            </p>
          </div>

          {/* RIGHT: Benchmarks button */}
          <div className="flex items-center justify-end sm:w-[200px]">
            <button
              type="button"
              onClick={() => setShowBenchmarkSettings(!showBenchmarkSettings)}
              className="rounded-full border border-slate-300 px-5 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              {showBenchmarkSettings ? "Hide benchmarks" : "Adjust benchmarks"}
            </button>
          </div>
        </div>
      </header>

      {/* BENCHMARK PANEL */}
      {showBe
