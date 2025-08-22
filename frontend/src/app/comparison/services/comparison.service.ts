import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Property } from '../../shared/models/property.model';

export interface PropertyComparison {
  property: Property;
  financials: FinancialAnalysis;
  investmentAnalysis?: InvestmentAnalysis;
  marketData?: MarketData;
}

export interface FinancialAnalysis {
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanToValue: number;
  debtToIncome?: number;
}

export interface InvestmentAnalysis {
  estimatedRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  roi: number;
  paybackPeriod: number;
  breakEvenPoint: number;
  appreciationRate: number;
  totalReturn: number;
}

export interface MarketData {
  priceHistory: PricePoint[];
  neighborhoodStats: NeighborhoodStats;
  marketTrends: MarketTrend[];
}

export interface PricePoint {
  date: string;
  price: number;
  pricePerSqFt: number;
}

export interface NeighborhoodStats {
  averagePrice: number;
  pricePerSqFt: number;
  daysOnMarket: number;
  crimeSafety: number;
  schoolRating: number;
  walkability: number;
  priceGrowth: number;
}

export interface MarketTrend {
  period: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  confidence: number;
}

export interface ComparisonExport {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeFinancials: boolean;
  includeInvestment: boolean;
  includeMarket: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private readonly MAX_COMPARISONS = 4;
  private comparisonSubject = new BehaviorSubject<PropertyComparison[]>([]);
  public comparisons$ = this.comparisonSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // Comparison management
  addToComparison(property: Property, financialData?: Partial<FinancialAnalysis>): boolean {
    const currentComparisons = this.comparisonSubject.value;
    
    if (currentComparisons.length >= this.MAX_COMPARISONS) {
      return false;
    }

    if (this.isInComparison(property.id)) {
      return false;
    }

    const financials = this.calculateFinancials(property, financialData);
    const investmentAnalysis = this.calculateInvestmentAnalysis(property, financials);
    const marketData = this.generateMarketData(property);

    const comparison: PropertyComparison = {
      property,
      financials,
      investmentAnalysis,
      marketData
    };

    const updatedComparisons = [...currentComparisons, comparison];
    this.comparisonSubject.next(updatedComparisons);
    this.saveToStorage();
    
    return true;
  }

  removeFromComparison(propertyId: number): void {
    const currentComparisons = this.comparisonSubject.value;
    const updatedComparisons = currentComparisons.filter(c => c.property.id !== propertyId);
    this.comparisonSubject.next(updatedComparisons);
    this.saveToStorage();
  }

  clearComparisons(): void {
    this.comparisonSubject.next([]);
    this.saveToStorage();
  }

  isInComparison(propertyId: number): boolean {
    return this.comparisonSubject.value.some(c => c.property.id === propertyId);
  }

  getComparisonCount(): number {
    return this.comparisonSubject.value.length;
  }

  updateFinancials(propertyId: number, financialData: Partial<FinancialAnalysis>): void {
    const comparisons = this.comparisonSubject.value;
    const index = comparisons.findIndex(c => c.property.id === propertyId);
    
    if (index !== -1) {
      const updatedComparisons = [...comparisons];
      const property = updatedComparisons[index].property;
      updatedComparisons[index].financials = this.calculateFinancials(property, financialData);
      updatedComparisons[index].investmentAnalysis = this.calculateInvestmentAnalysis(
        property, 
        updatedComparisons[index].financials
      );
      
      this.comparisonSubject.next(updatedComparisons);
      this.saveToStorage();
    }
  }

  // Financial calculations
  private calculateFinancials(property: Property, financialData?: Partial<FinancialAnalysis>): FinancialAnalysis {
    const loanAmount = financialData?.loanAmount || property.price * 0.8; // 20% down default
    const downPayment = financialData?.downPayment || property.price * 0.2;
    const interestRate = financialData?.interestRate || 6.5; // Default rate
    const loanTerm = financialData?.loanTerm || 30; // 30 years default

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalCost = monthlyPayment * numberOfPayments + downPayment;
    const totalInterest = monthlyPayment * numberOfPayments - loanAmount;
    const loanToValue = (loanAmount / property.price) * 100;

    return {
      loanAmount,
      downPayment,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalInterest,
      totalCost,
      loanToValue,
      debtToIncome: financialData?.debtToIncome
    };
  }

  private calculateInvestmentAnalysis(property: Property, financials: FinancialAnalysis): InvestmentAnalysis {
    // Estimate rent as 1% of property value per month (rule of thumb)
    const estimatedRent = property.price * 0.01;
    
    // Estimate monthly expenses (property taxes, insurance, maintenance, vacancy)
    const monthlyExpenses = property.price * 0.004; // ~4.8% annually
    
    const monthlyCashFlow = estimatedRent - financials.monthlyPayment - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Cap rate = Annual NOI / Property Price
    const annualNOI = estimatedRent * 12 - monthlyExpenses * 12;
    const capRate = (annualNOI / property.price) * 100;
    
    // ROI = Annual Cash Flow / Total Cash Invested
    const totalCashInvested = financials.downPayment + (property.price * 0.05); // Closing costs
    const roi = (annualCashFlow / totalCashInvested) * 100;
    
    const paybackPeriod = totalCashInvested / Math.max(annualCashFlow, 1);
    const breakEvenPoint = monthlyExpenses + financials.monthlyPayment;
    
    // Assume 3% appreciation
    const appreciationRate = 3;
    const annualAppreciation = property.price * (appreciationRate / 100);
    const totalReturn = ((annualCashFlow + annualAppreciation) / totalCashInvested) * 100;

    return {
      estimatedRent,
      monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      roi,
      paybackPeriod,
      breakEvenPoint,
      appreciationRate,
      totalReturn
    };
  }

  private generateMarketData(property: Property): MarketData {
    // Generate mock market data - in real app, this would come from API
    const priceHistory: PricePoint[] = [];
    const basePrice = property.price;
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% random fluctuation
      const trendFactor = 1 + (0.03 * (12 - i) / 12); // 3% annual growth trend
      const price = basePrice * trendFactor * (1 + fluctuation);
      
      priceHistory.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        pricePerSqFt: Math.round(price / property.squareFeet)
      });
    }

    const neighborhoodStats: NeighborhoodStats = {
      averagePrice: property.price * (0.9 + Math.random() * 0.2),
      pricePerSqFt: Math.round(property.price / property.squareFeet * (0.95 + Math.random() * 0.1)),
      daysOnMarket: Math.round(30 + Math.random() * 60),
      crimeSafety: Math.round(3 + Math.random() * 2), // 3-5 scale
      schoolRating: Math.round(6 + Math.random() * 4), // 6-10 scale
      walkability: Math.round(5 + Math.random() * 5), // 5-10 scale
      priceGrowth: 2 + Math.random() * 4 // 2-6% growth
    };

    const marketTrends: MarketTrend[] = [
      { period: '30 days', trend: 'up', change: 1.2, confidence: 0.85 },
      { period: '90 days', trend: 'up', change: 3.1, confidence: 0.78 },
      { period: '1 year', trend: 'up', change: 8.5, confidence: 0.92 }
    ];

    return {
      priceHistory,
      neighborhoodStats,
      marketTrends
    };
  }

  // Export functionality
  exportComparison(format: ComparisonExport): void {
    const comparisons = this.comparisonSubject.value;
    
    switch (format.format) {
      case 'pdf':
        this.exportToPDF(comparisons, format);
        break;
      case 'excel':
        this.exportToExcel(comparisons, format);
        break;
      case 'csv':
        this.exportToCSV(comparisons, format);
        break;
    }
  }

  private exportToPDF(comparisons: PropertyComparison[], format: ComparisonExport): void {
    // Mock PDF export - in real app, would use library like jsPDF
    const data = this.prepareExportData(comparisons, format);
    console.log('Exporting to PDF:', data);
    
    // Create download link
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-comparison-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private exportToExcel(comparisons: PropertyComparison[], format: ComparisonExport): void {
    // Mock Excel export - in real app, would use library like SheetJS
    const data = this.prepareExportData(comparisons, format);
    console.log('Exporting to Excel:', data);
  }

  private exportToCSV(comparisons: PropertyComparison[], format: ComparisonExport): void {
    const data = this.prepareExportData(comparisons, format);
    const csv = this.convertToCSV(data.properties);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private prepareExportData(comparisons: PropertyComparison[], format: ComparisonExport) {
    return {
      exportDate: new Date().toISOString(),
      properties: comparisons.map(c => ({
        address: c.property.address,
        price: c.property.price,
        sqft: c.property.squareFeet,
        bedrooms: c.property.bedrooms,
        bathrooms: c.property.bathrooms,
        ...(format.includeFinancials && {
          monthlyPayment: c.financials.monthlyPayment,
          totalCost: c.financials.totalCost,
          loanToValue: c.financials.loanToValue
        }),
        ...(format.includeInvestment && c.investmentAnalysis && {
          estimatedRent: c.investmentAnalysis.estimatedRent,
          monthlyCashFlow: c.investmentAnalysis.monthlyCashFlow,
          roi: c.investmentAnalysis.roi,
          capRate: c.investmentAnalysis.capRate
        }),
        ...(format.includeMarket && c.marketData && {
          averagePrice: c.marketData.neighborhoodStats.averagePrice,
          daysOnMarket: c.marketData.neighborhoodStats.daysOnMarket,
          priceGrowth: c.marketData.neighborhoodStats.priceGrowth
        })
      }))
    };
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  // Storage management
  private saveToStorage(): void {
    try {
      const comparisons = this.comparisonSubject.value;
      localStorage.setItem('property-comparisons', JSON.stringify(comparisons));
    } catch (error) {
      console.error('Error saving comparisons to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('property-comparisons');
      if (stored) {
        const comparisons: PropertyComparison[] = JSON.parse(stored);
        this.comparisonSubject.next(comparisons);
      }
    } catch (error) {
      console.error('Error loading comparisons from storage:', error);
    }
  }
}