
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  Info,
  Package,
  Target,
  Skull,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { CalculatorInputs } from './types';
import { calculateProfitability } from './utils/calculations';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    productName: 'Sample Palazzo',
    manufacturingCost: 160,
    packagingCost: 5,
    shippingFee: 75,
    customerReturnPercent: 15,
    rtoPercent: 10,
    returnPenaltyFee: 162,
    desiredProfit: 50,
    gstPercent: 5,
    adBudget: 30,
  });

  const results = useMemo(() => calculateProfitability(inputs), [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const exportToExcel = useCallback(() => {
    const data = [
      { Category: 'Product Name', Value: inputs.productName },
      { Category: 'Mfg + Pkg Cost', Value: inputs.manufacturingCost + inputs.packagingCost },
      { Category: 'Ad Budget (per unit)', Value: inputs.adBudget },
      { Category: 'Shipping (incl GST)', Value: inputs.shippingFee },
      { Category: 'Total Return % (Cust + RTO)', Value: `${inputs.customerReturnPercent + inputs.rtoPercent}%` },
      { Category: 'Lost Inventory Cost (avg/unit)', Value: (results.lostProductCost / 100).toFixed(2) },
      { Category: 'Magic Number (Breakeven)', Value: results.trueBreakevenSettlement.toFixed(2) },
      { Category: 'Balanced Listing Price', Value: Math.ceil(results.recommendedPrices.balanced) }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit Analysis");
    XLSX.writeFile(wb, `${inputs.productName.replace(/\s+/g, '_')}_Financials.xlsx`);
  }, [inputs, results]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Meesho Profit & Loss Strategy", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated for: ${inputs.productName} | ${new Date().toLocaleDateString()}`, 20, 30);
    
    let y = 50;
    const addLine = (label: string, value: string) => {
      doc.text(label, 20, y);
      doc.text(value, 130, y);
      y += 8;
    };

    doc.setFont("helvetica", "bold");
    addLine("TRUE BREAKEVEN SETTLEMENT:", `Rs. ${results.trueBreakevenSettlement.toFixed(2)}`);
    doc.setFont("helvetica", "normal");
    addLine("Ad Budget Allocation:", `Rs. ${inputs.adBudget}`);
    addLine("Lost Product Loss (50% of returns):", `Rs. ${(results.lostProductCost / 100).toFixed(2)} per unit`);
    addLine("Recommended Listing Price:", `Rs. ${Math.ceil(results.recommendedPrices.balanced)}`);

    doc.save(`${inputs.productName}_Analysis.pdf`);
  }, [inputs, results]);

  const pieData = [
    { name: 'Successful', value: results.netSuccessfulSales, fill: '#10b981' },
    { name: 'Returns', value: inputs.customerReturnPercent, fill: '#f43f5e' },
    { name: 'RTO', value: inputs.rtoPercent, fill: '#f59e0b' },
  ];

  const lostCostPercentage = useMemo(() => {
    return results.totalExpenditure > 0 
      ? (results.lostProductCost / results.totalExpenditure) * 100 
      : 0;
  }, [results]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none">MEESHO</h1>
              <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">Profit Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToExcel} 
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" /> EXCEL
            </button>
            <button 
              onClick={exportToPDF} 
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full">
        {/* Left Sidebar: Inputs */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" />
                Inventory & Costs
              </h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  Product Identity
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help" title="The name of the SKU or category for your records.">
                    <Info className="w-3 h-3 text-slate-300" />
                  </span>
                </label>
                <input 
                  type="text" 
                  name="productName" 
                  value={inputs.productName} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                  placeholder="e.g. Premium Cotton Palazzo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Mfg Unit
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="Sum of raw material, labor, and factory overheads per unit.">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input type="number" name="manufacturingCost" value={inputs.manufacturingCost} onChange={handleInputChange} className="w-full pl-7 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Packing
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="Cost of polybags, stickers, branding tags, and shipping bags.">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input type="number" name="packagingCost" value={inputs.packagingCost} onChange={handleInputChange} className="w-full pl-7 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 relative group transition-all hover:bg-indigo-50">
                <label className="text-[11px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <Target className="w-4 h-4" /> Advertising Budget
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help" title="Target marketing spend per order to maintain visibility on Meesho Ads.">
                    <Info className="w-3 h-3 text-indigo-300" />
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 font-black">₹</span>
                  <input 
                    type="number" 
                    name="adBudget" 
                    value={inputs.adBudget} 
                    onChange={handleInputChange} 
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 bg-white text-sm font-black text-indigo-700" 
                  />
                </div>
                <p className="text-[10px] text-indigo-400 mt-2 font-bold uppercase tracking-tight">Per order allocation</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  Shipping Fee (+GST)
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help" title="Total shipping charge including GST as displayed in the Meesho Supplier Panel.">
                    <Info className="w-3 h-3 text-slate-300" />
                  </span>
                </label>
                <input type="number" name="shippingFee" value={inputs.shippingFee} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Customer Ret %
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="Orders returned by customers after delivery. Critical for clothing SKUs.">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <input type="number" name="customerReturnPercent" value={inputs.customerReturnPercent} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    RTO %
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="Courier returns (Return to Origin) where the buyer didn't accept the parcel.">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <input type="number" name="rtoPercent" value={inputs.rtoPercent} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  Return Penalty
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help" title="Logistics and reverse shipping fees deducted by Meesho for customer returns.">
                    <Info className="w-3 h-3 text-slate-300" />
                  </span>
                </label>
                <input type="number" name="returnPenaltyFee" value={inputs.returnPenaltyFee} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Net Profit
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="Clean cash profit you want to earn per successful delivery.">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <input type="number" name="desiredProfit" value={inputs.desiredProfit} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Product GST
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help" title="GST rate applicable to your clothing product (usually 5% or 12%).">
                      <Info className="w-3 h-3 text-slate-300" />
                    </span>
                  </label>
                  <select name="gstPercent" value={inputs.gstPercent} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold">
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={exportToExcel} 
            className="w-full flex sm:hidden items-center justify-center gap-2 px-4 py-4 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> EXCEL EXPORT
          </button>
        </section>

        {/* Right Dashboard Area */}
        <section className="lg:col-span-8 space-y-6">
          {/* Hero Results Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            {/* Background Decorative Element */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-6 w-1 bg-indigo-500 rounded-full"></span>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-1.5">
                    Breakeven Settlement
                    {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                    <span className="cursor-help opacity-40" title="The minimum amount Meesho must settle in your bank to cover all costs.">
                      <Info className="w-3 h-3" />
                    </span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-500">₹</span>
                  <h3 className="text-6xl md:text-7xl font-black tracking-tighter text-white">
                    {results.trueBreakevenSettlement.toFixed(2)}
                  </h3>
                </div>
                <p className="mt-6 text-slate-400 text-sm md:text-base max-w-sm font-medium leading-relaxed">
                  Minimum bank settlement required from <span className="text-white">Meesho</span> per successful sale to avoid losses.
                </p>

                {/* Integrated Risk Warning */}
                {results.riskLevel === 'HIGH' && (
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-rose-400">
                      <div className="p-2 bg-rose-500/20 rounded-lg animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Critical Alert</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <div className="bg-white/5 border border-rose-500/20 rounded-2xl p-3" title="Net deliveries compared to total orders.">
                        <span className="block text-[9px] font-black text-slate-500 uppercase mb-1">Success Rate</span>
                        <span className="text-lg font-black text-rose-400">{results.netSuccessfulSales}%</span>
                      </div>
                      <div className="bg-white/5 border border-rose-500/20 rounded-2xl p-3" title="Percentage of total capital lost to damaged or lost returns.">
                        <span className="block text-[9px] font-black text-slate-500 uppercase mb-1">Cost Leakage</span>
                        <span className="text-lg font-black text-rose-400">{lostCostPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <p className="text-xs font-bold text-rose-400/80 leading-relaxed max-w-md italic">
                      Returns are eroding ₹{(results.lostProductCost / 100).toFixed(2)} of margin per order. Audit fabric & sizing immediately.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-col gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 group hover:bg-white/10 transition-all" title="Capital lost due to products that are damaged or lost during the return process.">
                  <div className="flex items-center gap-2 mb-2">
                    <Skull className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Drain</span>
                  </div>
                  <div className="text-2xl font-black text-rose-400">
                    ₹{(results.lostProductCost / 100).toFixed(2)}
                    <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">/ unit</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 group hover:bg-white/10 transition-all" title="Estimated portion of ad spend allocated per successful delivery.">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ad Allocation</span>
                  </div>
                  <div className="text-2xl font-black text-indigo-400">
                    ₹{inputs.adBudget.toFixed(2)}
                    <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">/ unit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-7 transition-all hover:shadow-xl hover:-translate-y-1" title="Lowest price to gain maximum volume with minimal profit.">
              <div className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase mb-6 tracking-widest">Aggressive</div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{Math.ceil(results.recommendedPrices.aggressive)}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Volume Focus</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Best for clearing old stock or winning the Buy Box early.</p>
              </div>
            </div>

            <div className="bg-white border-4 border-indigo-600 rounded-[2rem] p-7 shadow-2xl shadow-indigo-100 relative group" title="Ideal balance between healthy profit margins and staying competitive on Meesho.">
              <div className="absolute top-0 right-10 translate-y-[-50%] bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">Recommended</div>
              <div className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase mb-6 tracking-widest">Balanced</div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-indigo-300">₹</span>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{Math.ceil(results.recommendedPrices.balanced)}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Healthy Brand</span>
                  <ChevronRight className="w-3 h-3 text-indigo-200" />
                </div>
                <p className="text-[11px] font-bold text-slate-600 leading-relaxed">Perfect mix of sustainable profit and market competitiveness.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-7 transition-all hover:shadow-xl hover:-translate-y-1" title="High-margin pricing for unique factory designs or exclusive products.">
              <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase mb-6 tracking-widest">Premium</div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{Math.ceil(results.recommendedPrices.premium)}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">High Margin</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Ideal for unique catalog products or exclusive factory designs.</p>
              </div>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  Returns Analysis
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help opacity-40" title="Distribution of successful orders vs customer returns and RTOs.">
                    <Info className="w-3 h-3" />
                  </span>
                </h4>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={85} 
                      paddingAngle={8} 
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10}
                    >
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map(d => (
                  <div key={d.name} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{d.name}</span>
                    <span className="text-sm font-black text-slate-700">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  Price Ladder (INR)
                  {/* Fixed: Wrapped Info icon in a span to use 'title' attribute */}
                  <span className="cursor-help opacity-40" title="Comparison of three suggested listing prices based on different profit targets.">
                    <Info className="w-3 h-3" />
                  </span>
                </h4>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Agg', val: results.recommendedPrices.aggressive, color: '#10b981' },
                    { name: 'Bal', val: results.recommendedPrices.balanced, color: '#6366f1' },
                    { name: 'Pre', val: results.recommendedPrices.premium, color: '#f59e0b' }
                  ]}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f8fafc', radius: 12}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Bar dataKey="val" radius={[12, 12, 0, 0]} barSize={40}>
                       { [
                          { name: 'Agg', val: results.recommendedPrices.aggressive, color: '#10b981' },
                          { name: 'Bal', val: results.recommendedPrices.balanced, color: '#6366f1' },
                          { name: 'Pre', val: results.recommendedPrices.premium, color: '#f59e0b' }
                        ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />) }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparison of Target Selling Prices</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Factory Floor Mode Active • v2.1.0 Build</p>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2024 SENIOR FINANCIAL ANALYST TOOLSET</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
