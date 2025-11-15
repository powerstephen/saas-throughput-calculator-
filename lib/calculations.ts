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
  recommendations: {
    area: string;
    message: string;
    severity: "info" | "warning" | "critical";
  }[];
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

  type Recommendation = {
    area: string;
    message: string;
    severity: "info" | "warning" | "critical";
  };

  const recommendations: Recommendation[] = [];

  // --- 1) Proposal → Win severity + ARR uplift ---

  const proposalSeverity = severityFromGap(
    proposalToWinEff,
    salesBenchmarks.proposalToWin
  );

  if (proposalSeverity) {
    const proposalWinBenchmarkEff =
      salesBenchmarks.proposalToWin * convFactor;

    const winsIfBenchmark = proposals * (proposalWinBenchmarkEff / 100);

    const annualNewArrIfBenchmark = winsIfBenchmark * aspEff * 12;
    const upliftArr = annualNewArrIfBenchmark - newArrAnnual;

    const upliftText =
      upliftArr > 0
        ? `Fixing this could unlock roughly ${formatCurrencyFull(
            upliftArr,
            currencySymbol
          )} in additional new ARR per year at your current volume.`
        : `This step is still constraining your funnel even at current volumes.`;

    recommendations.push({
      area: "Sales · Proposal → Win",
      severity: proposalSeverity,
      message: `Proposal → Win is at ${proposalToWinEff.toFixed(
        1
      )}% vs a benchmark of ${salesBenchmarks.proposalToWin.toFixed(
        1
      )}%. ${upliftText}`,
    });
  }

  // --- 2) Monthly churn severity + churn impact ---

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

    const churnText =
      churnReduction > 0
        ? `At your current ARR, improving churn to benchmark would reduce churned ARR by about ${formatCurrencyFull(
            churnReduction,
            currencySymbol
          )} per year.`
        : `Current churn is above ideal and will drag down long-term ARR if left as is.`;

    recommendations.push({
      area: "Customer Success · Churn",
      severity: churnSeverity,
      message: `Monthly churn is effectively ${monthlyChurnEff.toFixed(
        2
      )}% vs a benchmark of ${csBenchmarks.monthlyChurnRate.toFixed(
        2
      )}%. ${churnText}`,
    });
  }

  // --- 3) CAC severity ---

  const cacSeverity = severityFromGap(
    marketing.blendedCAC,
    marketingBenchmarks.blendedCAC,
    { inverted: true }
  );

  if (cacSeverity) {
    recommendations.push({
      area: "Marketing · CAC",
      severity: cacSeverity,
      message: `Blended CAC is ${formatCurrencyFull(
        marketing.blendedCAC,
        currencySymbol
      )} vs a target of ${formatCurrencyFull(
        marketingBenchmarks.blendedCAC,
        currencySymbol
      )}. This weakens payback and LTV:CAC and should be a focus for channel mix, targeting and pricing.`,
    });
  }

  // --- 4) Pipeline coverage severity ---

  if (pipelineCoverageActual !== null && pipelineCoverageStatus === "under") {
    recommendations.push({
      area: "Sales · Pipeline Coverage",
      severity: "critical",
      message: `Pipeline coverage is below target. You currently have about ${(pipelineCoverageActual * 100).toFixed(
        0
      )}% of the pipeline value you’d like for your coverage multiple. This is a leading indicator that future ARR will fall short unless you increase pipeline or improve win rates.`,
    });
  }

  // --- 5) If nothing major, add a general info note ---

  if (recommendations.length === 0) {
    recommendations.push({
      area: "Overview",
      severity: "info",
      message:
        "No major bottlenecks against your current benchmarks. Use scenario planning to test where additional lift (conversion, churn, ACV) has the biggest impact on ARR.",
    });
  }

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
    recommendations,
  };
}
