export type MarketingInputs = {
  traffic: number;
  leads: number;
  mqlRate: number; // % from leads -> MQL
  sqlRate: number; // % from MQL -> SQL
  oppRate: number; // % from SQL -> Opp
  blendedCAC: number; // per new customer
};

export type SalesInputs = {
  oppToProposal: number; // %
  proposalToWin: number; // %
  asp: number; // average sale price (ACV)
  salesCycleDays: number;
  pipelineCoverageTarget: number; // multiplier e.g. 3x, 4x
  openPipelineValue: number; // current open pipeline value
};

export type CsInputs = {
  monthlyChurnRate: number; // %
  expansionRate: number; // % of ARR per year
  nrr: number; // %
  grossMargin: number; // %
};

export type FinanceInputs = {
  currentArr: number;
  targetArr: number;
};

export type ScenarioAdjustments = {
  convLiftPct: number; // global conversion uplift %
  churnImprovementPct: number; // reduction in churn %
  aspIncreasePct: number; // increase in ASP %
};

export type FunnelOutputs = {
  mqls: number;
  sqls: number;
  opportunities: number;
  proposals: number;
  wins: number;
  newArr: number;
};

export type ForecastOutputs = {
  projectedArr3m: number;
  projectedArr6m: number;
  projectedArr12m: number;
  churnedArrYear: number;
  expansionArrYear: number;
};

export type EfficiencyOutputs = {
  cacPaybackMonths: number | null;
  ltv: number | null;
  ltvToCac: number | null;
  pipelineCoverageActual: number | null;
  pipelineCoverageStatus: "under" | "ok" | "strong";
};

export type Recommendation = {
  area: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type CalculatorResult = {
  funnel: FunnelOutputs;
  forecast: ForecastOutputs;
  efficiency: EfficiencyOutputs;
  recommendations: Recommendation[];
};

const pctToRatio = (pct: number) => pct / 100;

export function calculateFunnel(
  marketing: MarketingInputs,
  sales: SalesInputs,
  finance: FinanceInputs,
  scenarios: ScenarioAdjustments
): FunnelOutputs {
  const convLift = 1 + scenarios.convLiftPct / 100;
  const aspLift = 1 + scenarios.aspIncreasePct / 100;

  const mqlRate = pctToRatio(marketing.mqlRate) * convLift;
  const sqlRate = pctToRatio(marketing.sqlRate) * convLift;
  const oppRate = pctToRatio(marketing.oppRate) * convLift;

  const oppToProposal = pctToRatio(sales.oppToProposal) * convLift;
  const proposalToWin = pctToRatio(sales.proposalToWin) * convLift;

  const mqls = marketing.leads * mqlRate;
  const sqls = mqls * sqlRate;
  const opportunities = sqls * oppRate;
  const proposals = opportunities * oppToProposal;
  const wins = proposals * proposalToWin;

  const newArr = wins * sales.asp * aspLift;

  return {
    mqls,
    sqls,
    opportunities,
    proposals,
    wins,
    newArr
  };
}

export function calculateForecast(
  finance: FinanceInputs,
  cs: CsInputs,
  funnel: FunnelOutputs
): ForecastOutputs {
  const monthlyChurn = pctToRatio(cs.monthlyChurnRate);
  const yearlyChurnApprox = 1 - Math.pow(1 - monthlyChurn, 12);
  const churnedArrYear = finance.currentArr * yearlyChurnApprox;

  const expansionArrYear = finance.currentArr * pctToRatio(cs.expansionRate);

  const netNewArrYear = funnel.newArr + expansionArrYear - churnedArrYear;

  const monthlyNetNewArr = netNewArrYear / 12;

  const projectedArr3m = finance.currentArr + monthlyNetNewArr * 3;
  const projectedArr6m = finance.currentArr + monthlyNetNewArr * 6;
  const projectedArr12m = finance.currentArr + netNewArrYear;

  return {
    projectedArr3m,
    projectedArr6m,
    projectedArr12m,
    churnedArrYear,
    expansionArrYear
  };
}

export function calculateEfficiency(
  marketing: MarketingInputs,
  cs: CsInputs,
  finance: FinanceInputs,
  funnel: FunnelOutputs,
  sales: SalesInputs
): EfficiencyOutputs {
  let cacPaybackMonths: number | null = null;
  let ltv: number | null = null;
  let ltvToCac: number | null = null;

  const grossMarginRatio = pctToRatio(cs.grossMargin);

  if (marketing.blendedCAC > 0 && funnel.newArr > 0) {
    const revenuePerCustomer =
      funnel.newArr / Math.max(funnel.wins, 1);

    const monthlyRevenuePerCustomer = revenuePerCustomer / 12;
    const monthlyGrossProfitPerCustomer =
      monthlyRevenuePerCustomer * grossMarginRatio;

    if (monthlyGrossProfitPerCustomer > 0) {
      cacPaybackMonths =
        marketing.blendedCAC / monthlyGrossProfitPerCustomer;
    }
  }

  const monthlyChurn = pctToRatio(cs.monthlyChurnRate);
  if (monthlyChurn > 0) {
    const avgLifetimeMonths = 1 / monthlyChurn;
    const avgRevenuePerCustomer =
      funnel.newArr / Math.max(funnel.wins, 1 || 1);
    const monthlyRevenuePerCustomer = avgRevenuePerCustomer / 12;
    ltv =
      monthlyRevenuePerCustomer *
      grossMarginRatio *
      avgLifetimeMonths;
  }

  if (ltv && marketing.blendedCAC > 0) {
    ltvToCac = ltv / marketing.blendedCAC;
  }

  const requiredPipeline =
    finance.targetArr * sales.pipelineCoverageTarget;
  const actualPipeline = sales.openPipelineValue;

  let coverageStatus: "under" | "ok" | "strong" = "under";
  let coverageRatio: number | null = null;

  if (requiredPipeline > 0) {
    coverageRatio = actualPipeline / requiredPipeline;
    if (coverageRatio >= 1.2) coverageStatus = "strong";
    else if (coverageRatio >= 0.9) coverageStatus = "ok";
    else coverageStatus = "under";
  }

  return {
    cacPaybackMonths,
    ltv,
    ltvToCac,
    pipelineCoverageActual: coverageRatio,
    pipelineCoverageStatus: coverageStatus
  };
}

export function generateRecommendations(
  marketing: MarketingInputs,
  sales: SalesInputs,
  cs: CsInputs,
  finance: FinanceInputs,
  outputs: CalculatorResult
): Recommendation[] {
  const recs: Recommendation[] = [];

  const { funnel, efficiency, forecast } = outputs;

  if (marketing.leads === 0 || funnel.mqls === 0) {
    recs.push({
      area: "Marketing",
      severity: "critical",
      message:
        "Lead generation and MQL volume look very low. Review ICP, channels, and top-of-funnel acquisition."
    });
  }

  if (funnel.opportunities < 0.1 * funnel.sqls) {
    recs.push({
      area: "Sales",
      severity: "warning",
      message:
        "SQL to opportunity conversion is weak. Tighten qualification and refine handoff between marketing and sales."
    });
  }

  if (forecast.churnedArrYear > 0.1 * finance.currentArr) {
    recs.push({
      area: "Customer Success",
      severity: "critical",
      message:
        "Annual churn is high relative to current ARR. Focus on onboarding, product adoption, and at-risk account playbooks."
    });
  }

  if (
    efficiency.cacPaybackMonths !== null &&
    efficiency.cacPaybackMonths > 18
  ) {
    recs.push({
      area: "Efficiency",
      severity: "warning",
      message:
        "CAC payback period is long. Review acquisition efficiency, pricing, and expansion motions."
    });
  }

  if (
    efficiency.ltvToCac !== null &&
    efficiency.ltvToCac < 3
  ) {
    recs.push({
      area: "Unit Economics",
      severity: "warning",
      message:
        "LTV/CAC is below 3x. Improve retention, expansion, or reduce CAC to strengthen unit economics."
    });
  }

  if (efficiency.pipelineCoverageStatus === "under") {
    recs.push({
      area: "Pipeline",
      severity: "critical",
      message:
        "Pipeline coverage is below target. Increase quality pipeline generation or adjust revenue targets."
    });
  }

  if (recs.length === 0) {
    recs.push({
      area: "Overview",
      severity: "info",
      message:
        "The revenue system looks balanced. Use scenario sliders to explore where to invest for the next uplift."
    });
  }

  return recs;
}

export function calculateAll(
  marketing: MarketingInputs,
  sales: SalesInputs,
  cs: CsInputs,
  finance: FinanceInputs,
  scenarios: ScenarioAdjustments
): CalculatorResult {
  const funnel = calculateFunnel(
    marketing,
    sales,
    finance,
    scenarios
  );
  const forecast = calculateForecast(finance, cs, funnel);
  const efficiency = calculateEfficiency(
    marketing,
    cs,
    finance,
    funnel,
    sales
  );

  const baseResult: CalculatorResult = {
    funnel,
    forecast,
    efficiency,
    recommendations: []
  };

  const recommendations = generateRecommendations(
    marketing,
    sales,
    cs,
    finance,
    baseResult
  );

  return { ...baseResult, recommendations };
}
