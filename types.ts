
export interface CalculatorInputs {
  productName: string;
  manufacturingCost: number;
  packagingCost: number;
  shippingFee: number;
  customerReturnPercent: number;
  rtoPercent: number;
  returnPenaltyFee: number;
  desiredProfit: number;
  gstPercent: 5 | 12;
  adBudget: number;
}

export interface CalculationResults {
  totalInvestment: number;
  returnPenaltyTotal: number;
  lostProductCost: number;
  adExpenditureTotal: number;
  totalExpenditure: number;
  netSuccessfulSales: number;
  trueBreakevenSettlement: number;
  recommendedPrices: {
    aggressive: number;
    balanced: number;
    premium: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
