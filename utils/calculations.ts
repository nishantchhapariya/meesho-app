
import { CalculatorInputs, CalculationResults } from '../types';

export const calculateProfitability = (inputs: CalculatorInputs): CalculationResults => {
  const {
    manufacturingCost,
    packagingCost,
    customerReturnPercent,
    returnPenaltyFee,
    rtoPercent,
    desiredProfit,
    shippingFee,
    gstPercent,
    adBudget
  } = inputs;

  const unitCost = manufacturingCost + packagingCost;

  // 1. Core Manufacturing Investment (per 100 orders)
  const totalInvestment = unitCost * 100;

  // 2. Marketing / Ads (per 100 orders)
  const adExpenditureTotal = adBudget * 100;

  // 3. Return Penalty Cost (per 100 orders)
  const returnPenaltyTotal = (100 * (customerReturnPercent / 100)) * returnPenaltyFee;

  // 4. Lost Products Calculation (50% of total returns are un-sellable/lost)
  const totalReturnPercent = customerReturnPercent + rtoPercent;
  const lostUnits = 100 * (totalReturnPercent / 100) * 0.5;
  const lostProductCost = lostUnits * unitCost;

  // 5. Total Expenditure including the new loss and ad factors
  const totalExpenditure = totalInvestment + adExpenditureTotal + returnPenaltyTotal + lostProductCost;

  // 6. Net Successful Sales
  const netSuccessfulSales = 100 - (customerReturnPercent + rtoPercent);

  // 7. True Breakeven Settlement (The "Magic Number")
  const trueBreakevenSettlement = totalExpenditure / netSuccessfulSales;

  // Calculation for Listing Price: (Breakeven + Profit + Shipping) / (1 - GST)
  const calculateListingPrice = (targetProfit: number) => {
    return (trueBreakevenSettlement + targetProfit + shippingFee) / (1 - (gstPercent / 100));
  };

  const riskLevel = netSuccessfulSales < 70 ? 'HIGH' : netSuccessfulSales < 85 ? 'MEDIUM' : 'LOW';

  return {
    totalInvestment,
    returnPenaltyTotal,
    lostProductCost,
    adExpenditureTotal,
    totalExpenditure,
    netSuccessfulSales,
    trueBreakevenSettlement,
    recommendedPrices: {
      aggressive: calculateListingPrice(Math.max(desiredProfit * 0.5, 20)),
      balanced: calculateListingPrice(desiredProfit),
      premium: calculateListingPrice(desiredProfit * 1.8),
    },
    riskLevel,
  };
};
