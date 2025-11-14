// lib/calculations.ts

export type MarketingInputs = {
  traffic: number;        // monthly sessions
  leads: number;          // leads per month
  mqlRate: number;        // % lead -> MQL
  sqlRate: number;        // % MQL -> SQL
  oppRate: number;        // % SQL -> Opportunity
  blendedCAC: number;     // € per new customer
};

export type SalesInputs = {
  oppToProposal: number;      // % Opp -> Proposal
  proposalToWin: number;      // % Proposal -> Won
  asp: number;                // € ACV per new customer (annual)
  salesCycleDays: number;
  pipelineCoverageTarget: number; // e.g. 3x
  openPipelineValue: number;      // € value of open opps
};

export type CsInputs = {
  monthlyChurnRate: number;  // % per month
  expansionRate: number;     // % of starting ARR per year
  nrr: number;               // % (e.g. 115)
  grossMargin: number;       // % (e.g. 75)
};

export type FinanceInputs = {
  currentArr: number;        // € annual
  targetArr: number;         // € annual (12m target)
};

export type ScenarioAdjustments = {
  convLiftPct: number;         // % lift across funnel
  churnImprovementPct: number; // % reduction in churn rate
  aspIncreasePct: number;      // % increase in ASP
};

export type FunnelResult = {
  mqls: number;
  sqls: number;
  opportunities: number;
  proposals: number;
  wins: number;              // wins per month
  newArrAnnual: number;      // € new ARR (annualised)
};

export type ForecastResult = {
  projectedArr3m: number;
  projectedArr6m: number;
  projectedArr12m: number;
  churnedArrYear: number;       // approx, from starting ARR
  expansionArrYear: number;     // based on starting ARR
  monthlyNewArr: number;        // € new ARR added per month
  monthlyNetNewArr: number;     // € net new ARR per month (approx)
};

export type EfficiencyResult = {
  cacPaybackMonths: number | null;
  ltv: number | null;
  ltvToCac: number | null;
  pipelineCoverageActual: number | null; // 1.0 = on target
  pipelineCoverageStatus: "strong" | "ok" | "under";
};

export type Recommendation = {
  area: string;
  severity: "critical" | "warning" | "neutral";
  message: string;
};

export type CalculatorResult = {
  funnel: FunnelResult;
  forecast: ForecastResult;
  efficiency: EfficiencyResult;
  recommendations: Recommendation[];
};

// ---------- helpers ----------

function pctToDecimal(p: number): number {
  return isFinite(p) ? p / 100 : 0;
}

function clampPercent(p: number): number {
  if (!isFinite(p)) return 0;
  return Math.min(Math.max(p, 0), 100);
}

// Main entry
export function calculateAll(
  marketing: MarketingInputs,
  sales: SalesInputs,
  cs: CsInputs,
  finance: FinanceInputs,
  scenarios: ScenarioAdjustments
): CalculatorResult {
  const convLift = 1 + pctToDecimal(scenarios.convLiftPct);
  const aspLift = 1 + pctToDecimal(scenarios.aspIncreasePct);
  const churnReduction = 1 - pctToDecimal(scenarios.churnImprovementPct);

  const mqlRate = clampPercent(marketing.mqlRate * convLift);
  const sqlRate = clampPercent(marketing.sqlRate * convLift);
  const oppRate = clampPercent(marketing.oppRate * convLift);
  const oppToProposal = clampPercent(sales.oppToProposal * convLift);
  const proposalToWin = clampPercent(sales.proposalToWin * convLift);

  const baseMonthlyChurn = pctToDecimal(cs.monthlyChurnRate);
  const effectiveMonthlyChurn = Math.max(
    0,
    baseMonthlyChurn * churnReduction
  );

  const aspAdjusted = sales.asp * aspLift;

  // ----- funnel (monthly throughput) -----

  const mqls = marketing.leads * pctToDecimal(mqlRate);
  const sqls = mqls * pctToDecimal(sqlRate);
  const opportunities = sqls * pctToDecimal(oppRate);
  const proposals = opportunities * pctToDecimal(oppToProposal);
  const wins = proposals * pctToDecimal(proposalToWin);

  // wins per month * ACV (annual) = new ARR per year
  const newArrAnnual = wins * aspAdjusted;

  const funnel: FunnelResult = {
    mqls,
    sqls,
    opportunities,
    proposals,
    wins,
    newArrAnnual
  };

  // ----- churn & expansion (yearly aggregates off starting ARR) -----

  const startArr = Math.max(0, finance.currentArr);

  // annual churn, approximated from monthly churn
  const annualChurnRate =
    1 - Math.pow(1 - effectiveMonthlyChurn, 12);
  const churnedArrYear = startArr * annualChurnRate;

  const expansionArrYear =
    startArr * pctToDecimal(cs.expansionRate);

  // ----- forecast: month-by-month, using monthly flows -----

  const monthlyNewArr = newArrAnnual / 12;
  const monthlyExpansionArr = expansionArrYear / 12;

  let arr = startArr;
  let arr3m = startArr;
  let arr6m = startArr;
  let arr12m = startArr;

  for (let month = 1; month <= 12; month++) {
    const churnThisMonth = arr * effectiveMonthlyChurn;
    arr =
      arr + monthlyNewArr + monthlyExpansionArr - churnThisMonth;

    if (month === 3) arr3m = arr;
    if (month === 6) arr6m = arr;
    if (month === 12) arr12m = arr;
  }

  // approximate net new per month based on starting point
  const approxMonthlyNetNew =
    monthlyNewArr +
    monthlyExpansionArr -
    startArr * effectiveMonthlyChurn;

  const forecast: ForecastResult = {
    projectedArr3m: arr3m,
    projectedArr6m: arr6m,
    projectedArr12m: arr12m,
    churnedArrYear,
    expansionArrYear,
    monthlyNewArr,
    monthlyNetNewArr: approxMonthlyNetNew
  };

  // ----- efficiency metrics -----

  const grossMarginDec = pctToDecimal(cs.grossMargin);

  let cacPaybackMonths: number | null = null;
  let ltv: number | null = null;
  let ltvToCac: number | null = null;

  if (marketing.blendedCAC > 0 && aspAdjusted > 0 && grossMarginDec > 0) {
    const monthlyGrossProfitPerCustomer =
      (aspAdjusted / 12) * grossMarginDec;
    if (monthlyGrossProfitPerCustomer > 0) {
      cacPaybackMonths =
        marketing.blendedCAC / monthlyGrossProfitPerCustomer;
    }
  }

  if (annualChurnRate > 0 && aspAdjusted > 0 && grossMarginDec > 0) {
    ltv = (aspAdjusted * grossMarginDec) / annualChurnRate;
  }

  if (ltv && marketing.blendedCAC > 0) {
    ltvToCac = ltv / marketing.blendedCAC;
  }

  // pipeline coverage vs target ARR gap
  let pipelineCoverageActual: number | null = null;
  let pipelineCoverageStatus: "strong" | "ok" | "under" = "under";

  const gapToTarget = finance.targetArr - finance.currentArr;
  if (gapToTarget > 0 && sales.pipelineCoverageTarget > 0) {
    const requiredPipeline =
      gapToTarget * sales.pipelineCoverageTarget;
    if (requiredPipeline > 0) {
      pipelineCoverageActual =
        sales.openPipelineValue / requiredPipeline; // 1 = on target
    }
  }

  if (pipelineCoverageActual === null) {
    pipelineCoverageStatus = "ok";
  } else if (pipelineCoverageActual >= 1) {
    pipelineCoverageStatus = "strong";
  } else if (pipelineCoverageActual >= 0.7) {
    pipelineCoverageStatus = "ok";
  } else {
    pipelineCoverageStatus = "under";
  }

  const efficiency: EfficiencyResult = {
    cacPaybackMonths,
    ltv,
    ltvToCac,
    pipelineCoverageActual,
    pipelineCoverageStatus
  };

  // ----- recommendations (simple heuristics) -----

  const recommendations: Recommendation[] = [];

  // churn vs new ARR
  if (churnedArrYear > newArrAnnual) {
    recommendations.push({
      area: "Churn & Retention",
      severity: "critical",
      message:
        "You lose more ARR in churn than you add from new customers. Prioritise reducing monthly churn and increasing expansion before you scale top-of-funnel."
    });
  }

  // conversion chain
  if (mqlRate < marketing.mqlRate && marketing.mqlRate > 0) {
    // scenario lowered it, ignore
  }
  if (pctToDecimal(mqlRate) < 0.2) {
    recommendations.push({
      area: "Lead → MQL",
      severity: "warning",
      message:
        "Lead-to-MQL conversion is low. Revisit lead quality, ICP fit, and early qualification to improve downstream throughput."
    });
  }

  if (pctToDecimal(sqlRate) < 0.3) {
    recommendations.push({
      area: "MQL → SQL",
      severity: "warning",
      message:
        "MQL-to-SQL conversion is soft. Tighten qualification criteria and handover between marketing and sales."
    });
  }

  // CAC payback
  if (cacPaybackMonths && cacPaybackMonths > 18) {
    recommendations.push({
      area: "CAC Payback",
      severity: "critical",
      message:
        "CAC payback is longer than 18 months. Either reduce CAC or increase pricing / upsell to reach a more sustainable payback period."
    });
  }

  // LTV/CAC
  if (ltvToCac && ltvToCac < 3) {
    recommendations.push({
      area: "Unit Economics",
      severity: "warning",
      message:
        "LTV/CAC is below 3x. Improve retention, expansion, or efficiency in acquisition to strengthen unit economics."
    });
  }

  // pipeline coverage
  if (pipelineCoverageActual !== null && pipelineCoverageActual < 1) {
    recommendations.push({
      area: "Pipeline Coverage",
      severity: "warning",
      message:
        "Open pipeline is below the required coverage for your ARR target. Build more qualified pipeline or adjust your coverage target."
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      area: "Overview",
      severity: "neutral",
      message:
        "Funnel and economics look broadly healthy. Use scenarios to test where modest improvements in conversion, churn, or ASP create the biggest uplift in ARR."
    });
  }

  return {
    funnel,
    forecast,
    efficiency,
    recommendations
  };
}
