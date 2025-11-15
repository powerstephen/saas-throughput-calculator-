export type MarketingInputs = {
  traffic: number;
  leads: number;
  mqlRate: number; // %
  sqlRate: number; // %
  oppRate: number; // %
  blendedCAC: number; // currency
};

export type SalesInputs = {
  oppToProposal: number; // %
  proposalToWin: number; // %
  asp: number; // currency
  salesCycleDays: number;
  pipelineCoverageTarget: number; // ×
  openPipelineValue: number; // currency
};

export type CsInputs = {
  monthlyChurnRate: number; // %
  expansionRate: number; // %
  nrr: number; // %
  grossMargin: number; // %
};

export type FinanceInputs = {
  currentArr: number; // currency
  targetArr: number; // currency
};

export type ScenarioAdjustments = {
  convLiftPct: number; // %
  churnImprovementPct: number; // %
  aspIncreasePct: number; // %
};

export type Recommendation = {
  area: string;
  message: string;
  severity: "info" | "warning" | "critical";
  impactArr?: number;
  score?: number;
};

export type CalculatorResult = {
  funnel: {
    mqls: number;
    sqls: number;
    opportunities: number;
    proposals: number;
    wins: number;
    newArrAnnual: number;
  };
  forecast: {
    projectedArr3m: number;
    projectedArr6m: number;
    projectedArr12m: number;
    churnedArrYear: number;
    expansionArrYear: number;
    monthlyNewArr: number;
    monthlyNetNewArr: number;
  };
  efficiency: {
    cacPaybackMonths: number | null;
    ltv: number | null;
    ltvToCac: number | null;
    pipelineCoverageActual: number | null; // 1.0 = 100% of target
    pipelineCoverageStatus: "strong" | "ok" | "under";
  };
  recommendations: Recommendation[];
  priorities: Recommendation[];
  otherFindings: Recommendation[];
};

// ---------- helpers ----------

function annualisedChurnFromMonthly(monthlyChurnPct: number): number {
  const m = monthlyChurnPct / 100;
  if (m <= 0) return 0;
  return 1 - Math.pow(1 - m, 12);
}

function severityFromGap(
  actual: number,
  benchmark: number,
  options?: { inverted?: boolean }
): "info" | "warning" | "critical" | null {
  if (!Number.isFinite(actual) || !Number.isFinite(benchmark)) return null;
  if (benchmark <= 0) return null;

  let ratio = actual / benchmark;

  // For metrics where "lower is better" (e.g. churn, CAC)
  if (options?.inverted) {
    ratio = benchmark / actual;
  }

  if (ratio >= 0.9) return null; // close enough
  if (ratio >= 0.7) return "warning";
  return "critical";
}

function formatCurrencyFull(value: number, currencySymbol: string): string {
  if (!Number.isFinite(value)) return "-";
  return `${currencySymbol}${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

// ---------- main calculation ----------

export function calculateAll(
  marketing: MarketingInputs,
  sales: SalesInputs,
  cs: CsInputs,
  finance: FinanceInputs,
  scenarios: ScenarioAdjustments,
  marketingBenchmarks: {
    mqlRate: number;
    sqlRate: number;
    oppRate: number;
    blendedCAC: number;
  },
  salesBenchmarks: {
    sqlToOpp: number;
    oppToProposal: number;
    proposalToWin: number;
    asp: number;
  },
  csBenchmarks: {
    monthlyChurnRate: number;
    expansionRate: number;
    nrr: number;
    grossMargin: number;
  },
  currencySymbol: string
): CalculatorResult {
  // -------- apply scenario adjustments --------

  const convFactor = 1 + scenarios.convLiftPct / 100;
  const aspFactor = 1 + scenarios.aspIncreasePct / 100;
  const churnFactor = 1 - scenarios.churnImprovementPct / 100;

  const mqlRateEff = marketing.mqlRate * convFactor;
  const sqlRateEff = marketing.sqlRate * convFactor;
  const oppRateEff = marketing.oppRate * convFactor;

  const oppToProposalEff = sales.oppToProposal * convFactor;
  const proposalToWinEff = sales.proposalToWin * convFactor;
  const aspEff = sales.asp * aspFactor;

  const monthlyChurnEff = Math.max(cs.monthlyChurnRate * churnFactor, 0);

  // -------- funnel throughput (monthly) --------

  const mqls = marketing.leads * (mqlRateEff / 100);
  const sqls = mqls * (sqlRateEff / 100);
  const opportunities = sqls * (oppRateEff / 100);
  const proposals = opportunities * (oppToProposalEff / 100);
  const wins = proposals * (proposalToWinEff / 100);

  const monthlyNewArr = wins * aspEff;
  const newArrAnnual = monthlyNewArr * 12;

  // -------- churn / expansion / ARR forecast --------

  const annualChurnRate = annualisedChurnFromMonthly(monthlyChurnEff);
  const churnedArrYear = finance.currentArr * annualChurnRate;

  const expansionArrYear = finance.currentArr * (cs.expansionRate / 100);

  const projectedArr12m =
    finance.currentArr + newArrAnnual + expansionArrYear - churnedArrYear;

  // Simple, directional 3m / 6m estimates
  const projectedArr3m =
    finance.currentArr +
    monthlyNewArr * 3 +
    (expansionArrYear - churnedArrYear) * 0.25;

  const projectedArr6m =
    finance.currentArr +
    monthlyNewArr * 6 +
    (expansionArrYear - churnedArrYear) * 0.5;

  const monthlyNetNewArr =
    monthlyNewArr + (expansionArrYear - churnedArrYear) / 12;

  // -------- efficiency metrics --------

  let cacPaybackMonths: number | null = null;
  let ltv: number | null = null;
  let ltvToCac: number | null = null;

  const grossMarginDecimal = cs.grossMargin / 100;
  const monthlyMarginPerCustomer = (aspEff * grossMarginDecimal) / 12;

  if (monthlyMarginPerCustomer > 0 && marketing.blendedCAC > 0) {
    cacPaybackMonths = marketing.blendedCAC / monthlyMarginPerCustomer;
  }

  const monthlyChurnDecimal = monthlyChurnEff / 100;
  if (monthlyChurnDecimal > 0 && monthlyMarginPerCustomer > 0) {
    const lifetimeMonths = 1 / monthlyChurnDecimal;
    ltv = monthlyMarginPerCustomer * lifetimeMonths;
    if (marketing.blendedCAC > 0) {
      ltvToCac = ltv / marketing.blendedCAC;
    }
  }

  // -------- pipeline coverage --------

  let pipelineCoverageActual: number | null = null;
  let pipelineCoverageStatus: "strong" | "ok" | "under" = "ok";

  if (sales.pipelineCoverageTarget > 0 && monthlyNewArr > 0) {
    const targetPipelineValue =
      monthlyNewArr * sales.pipelineCoverageTarget;
    if (targetPipelineValue > 0) {
      pipelineCoverageActual =
        sales.openPipelineValue / targetPipelineValue;

      if (pipelineCoverageActual >= 1.2) {
        pipelineCoverageStatus = "strong";
      } else if (pipelineCoverageActual >= 0.9) {
        pipelineCoverageStatus = "ok";
      } else {
        pipelineCoverageStatus = "under";
      }
    }
  }

  // -------- recommendations & ARR uplift --------

  const recommendations: Recommendation[] = [];

  // Helper to compute ARR uplift when a specific conversion step is set to a benchmark
  function upliftForStep(
    overrides: {
      sqlRatePct?: number;
      oppRatePct?: number;
      oppToProposalPct?: number;
      proposalToWinPct?: number;
    }
  ): number {
    const sqlRate = overrides.sqlRatePct ?? sqlRateEff;
    const oppRate = overrides.oppRatePct ?? oppRateEff;
    const oppToProp = overrides.oppToProposalPct ?? oppToProposalEff;
    const propToWin = overrides.proposalToWinPct ?? proposalToWinEff;

    const mqlsAdj = mqls; // mqls already uses mqlRateEff
    const sqlsAdj = mqlsAdj * (sqlRate / 100);
    const oppsAdj = sqlsAdj * (oppRate / 100);
    const proposalsAdj = oppsAdj * (oppToProp / 100);
    const winsAdj = proposalsAdj * (propToWin / 100);

    const monthlyNewArrAdj = winsAdj * aspEff;
    const newArrAnnualAdj = monthlyNewArrAdj * 12;
    return newArrAnnualAdj - newArrAnnual;
  }

  // --- MQL → SQL severity + ARR uplift ---

  const mqlToSqlBenchmarkEff = marketingBenchmarks.sqlRate * convFactor;
  const mqlToSqlSeverity = severityFromGap(
    sqlRateEff,
    mqlToSqlBenchmarkEff
  );

  if (mqlToSqlSeverity) {
    const upliftArr = upliftForStep({
      sqlRatePct: mqlToSqlBenchmarkEff,
    });

    recommendations.push({
      area: "Funnel · MQL → SQL",
      severity: mqlToSqlSeverity,
      impactArr: upliftArr > 0 ? upliftArr : 0,
      message: `MQL → SQL is at ${sqlRateEff.toFixed(
        1
      )}% vs a benchmark of ${mqlToSqlBenchmarkEff.toFixed(
        1
      )}%. Fixing this step could unlock roughly ${formatCurrencyFull(
        Math.max(upliftArr, 0),
        currencySymbol
      )} in additional new ARR per year at current lead volume.`,
    });
  }

  // --- SQL → Opportunity severity + ARR uplift ---

  const sqlToOppBenchmarkEff = marketingBenchmarks.oppRate * convFactor;
  const sqlToOppSeverity = severityFromGap(
    oppRateEff,
    sqlToOppBenchmarkEff
  );

  if (sqlToOppSeverity) {
    const upliftArr = upliftForStep({
      oppRatePct: sqlToOppBenchmarkEff,
    });

    recommendations.push({
      area: "Funnel · SQL → Opportunity",
      severity: sqlToOppSeverity,
      impactArr: upliftArr > 0 ? upliftArr : 0,
      message: `SQL → Opportunity is at ${oppRateEff.toFixed(
        1
      )}% vs a benchmark of ${sqlToOppBenchmarkEff.toFixed(
        1
      )}%. Improving discovery and qualification here could unlock around ${formatCurrencyFull(
        Math.max(upliftArr, 0),
        currencySymbol
      )} in new ARR per year.`,
    });
  }

  // --- Opportunity → Proposal severity + ARR uplift ---

  const oppToProposalBenchmarkEff =
    salesBenchmarks.oppToProposal * convFactor;
  const oppToProposalSeverity = severityFromGap(
    oppToProposalEff,
    oppToProposalBenchmarkEff
  );

  if (oppToProposalSeverity) {
    const upliftArr = upliftForStep({
      oppToProposalPct: oppToProposalBenchmarkEff,
    });

    recommendations.push({
      area: "Sales · Opportunity → Proposal",
      severity: oppToProposalSeverity,
      impactArr: upliftArr > 0 ? upliftArr : 0,
      message: `Opportunity → Proposal is at ${oppToProposalEff.toFixed(
        1
      )}% vs a benchmark of ${oppToProposalBenchmarkEff.toFixed(
        1
      )}%. Sharpening proposals and solution fit here could generate about ${formatCurrencyFull(
        Math.max(upliftArr, 0),
        currencySymbol
      )} in additional new ARR per year.`,
    });
  }

  // --- Proposal → Win severity + ARR uplift ---

  const proposalWinBenchmarkEff =
    salesBenchmarks.proposalToWin * convFactor;
  const proposalSeverity = severityFromGap(
    proposalToWinEff,
    proposalWinBenchmarkEff
  );

  if (proposalSeverity) {
    const upliftArr = upliftForStep({
      proposalToWinPct: proposalWinBenchmarkEff,
    });

    recommendations.push({
      area: "Sales · Proposal → Win",
      severity: proposalSeverity,
      impactArr: upliftArr > 0 ? upliftArr : 0,
      message: `Proposal → Win is at ${proposalToWinEff.toFixed(
        1
      )}% vs a benchmark of ${proposalWinBenchmarkEff.toFixed(
        1
      )}%. Fixing this closing step could unlock roughly ${formatCurrencyFull(
        Math.max(upliftArr, 0),
        currencySymbol
      )} in additional new ARR per year.`,
    });
  }

  // --- Monthly churn severity + churn impact ---

  const churnSeverity = severityFromGap(
    monthlyChurnEff,
    csBenchmarks.monthlyChurnRate,
    { inverted: true }
  );

  if (churnSeverity) {
    const annualChurnRateBenchmark = annualisedChurnFromMonthly(
      csBenchmarks.monthlyChurnRate * churnFactor
    );
    const churnedIfBenchmark = finance.currentArr * annualChurnRateBenchmark;
    const churnReduction = churnedArrYear - churnedIfBenchmark;

    recommendations.push({
      area: "Customer Success · Churn",
      severity: churnSeverity,
      impactArr: churnReduction > 0 ? churnReduction : 0,
      message: `Monthly churn is effectively ${monthlyChurnEff.toFixed(
        2
      )}% vs a benchmark of ${csBenchmarks.monthlyChurnRate.toFixed(
        2
      )}%. Improving retention to benchmark would reduce churned ARR by about ${formatCurrencyFull(
        Math.max(churnReduction, 0),
        currencySymbol
      )} per year.`,
    });
  }

  // --- CAC severity (no direct ARR uplift, but still important) ---

  const cacSeverity = severityFromGap(
    marketing.blendedCAC,
    marketingBenchmarks.blendedCAC,
    { inverted: true }
  );

  if (cacSeverity) {
    recommendations.push({
      area: "Marketing · CAC",
      severity: cacSeverity,
      impactArr: 0,
      message: `Blended CAC is ${formatCurrencyFull(
        marketing.blendedCAC,
        currencySymbol
      )} vs a target of ${formatCurrencyFull(
        marketingBenchmarks.blendedCAC,
        currencySymbol
      )}. This weakens payback and LTV:CAC and should be a focus for channel mix, targeting and pricing.`,
    });
  }

  // --- Pipeline coverage severity (again, no direct ARR uplift calc here) ---

  if (pipelineCoverageActual !== null && pipelineCoverageStatus === "under") {
    recommendations.push({
      area: "Sales · Pipeline Coverage",
      severity: "critical",
      impactArr: 0,
      message: `Pipeline coverage is below target. You currently have about ${(pipelineCoverageActual * 100).toFixed(
        0
      )}% of the pipeline value you'd like for your coverage multiple. This is a leading indicator that future ARR will fall short unless you increase pipeline or improve win rates.`,
    });
  }

  // --- If nothing major, add a general info note ---

  if (recommendations.length === 0) {
    recommendations.push({
      area: "Overview",
      severity: "info",
      impactArr: 0,
      message:
        "No major bottlenecks against your current benchmarks. Use scenario planning to test where additional lift (conversion, churn, ACV) has the biggest impact on ARR.",
    });
  }

  // -------- score & split into priorities + other findings --------

  const scoredRecs: Recommendation[] = recommendations.map((rec) => {
    let severityWeight = 1;
    if (rec.severity === "warning") severityWeight = 2;
    if (rec.severity === "critical") severityWeight = 3;

    const impact = rec.impactArr ?? 0;

    // If we have ARR impact, use it. Otherwise, fallback to a base score by severity.
    const baseForNoImpact =
      rec.severity === "critical"
        ? 1_000_000
        : rec.severity === "warning"
        ? 100_000
        : 10_000;

    const score = impact > 0 ? impact * severityWeight : baseForNoImpact;

    return { ...rec, score };
  });

  const sorted = [...scoredRecs].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );

  const priorities = sorted.slice(0, 2);
  const otherFindings = sorted.slice(2);

  // -------- return full object --------

  return {
    funnel: {
      mqls,
      sqls,
      opportunities,
      proposals,
      wins,
      newArrAnnual,
    },
    forecast: {
      projectedArr3m,
      projectedArr6m,
      projectedArr12m,
      churnedArrYear,
      expansionArrYear,
      monthlyNewArr,
      monthlyNetNewArr,
    },
    efficiency: {
      cacPaybackMonths,
      ltv,
      ltvToCac,
      pipelineCoverageActual,
      pipelineCoverageStatus,
    },
    recommendations: sorted,
    priorities,
    otherFindings,
  };
}
