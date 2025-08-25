import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface RefinanceResult {
  currentLoan: LoanDetails;
  newLoan: LoanDetails;
  savings: SavingsAnalysis;
  breakEvenAnalysis: BreakEvenAnalysis;
  recommendation: string;
}

interface LoanDetails {
  balance: number;
  monthlyPayment: number;
  interestRate: number;
  remainingTerm: number;
  totalInterest: number;
  totalCost: number;
}

interface SavingsAnalysis {
  monthlyPaymentSavings: number;
  totalInterestSavings: number;
  lifetimeSavings: number;
  percentageSavings: number;
}

interface BreakEvenAnalysis {
  closingCosts: number;
  breakEvenMonths: number;
  breakEvenPoint: string;
  worthRefinancing: boolean;
}

@Component({
  selector: 'app-refinance-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="refinance-calculator-container">
      <div class="calculator-header">
        <h1>🏦 Refinancing Calculator</h1>
        <p>See if refinancing your mortgage could save you money</p>
        <a routerLink="/mortgage-tools" class="back-link">← Back to Mortgage Tools</a>
      </div>

      <div class="calculator-content">
        <div class="calculator-form">
          <h2>Current Loan Details</h2>
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <div class="form-section">
              <h3>📋 Current Mortgage</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="currentBalance">Current Loan Balance</label>
                  <input 
                    id="currentBalance"
                    type="number" 
                    formControlName="currentBalance"
                    placeholder="250000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="currentRate">Current Interest Rate (%)</label>
                  <input 
                    id="currentRate"
                    type="number" 
                    step="0.01"
                    formControlName="currentRate"
                    placeholder="6.5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="remainingYears">Years Remaining</label>
                  <input 
                    id="remainingYears"
                    type="number" 
                    formControlName="remainingYears"
                    placeholder="25"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="currentPayment">Current Monthly Payment</label>
                  <input 
                    id="currentPayment"
                    type="number" 
                    formControlName="currentPayment"
                    placeholder="1650"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>🆕 New Loan Options</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="newRate">New Interest Rate (%)</label>
                  <input 
                    id="newRate"
                    type="number" 
                    step="0.01"
                    formControlName="newRate"
                    placeholder="5.5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="newTerm">New Loan Term (years)</label>
                  <select id="newTerm" formControlName="newTerm" class="form-input">
                    <option value="15">15 years</option>
                    <option value="20">20 years</option>
                    <option value="25">25 years</option>
                    <option value="30">30 years</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="closingCosts">Estimated Closing Costs</label>
                  <input 
                    id="closingCosts"
                    type="number" 
                    formControlName="closingCosts"
                    placeholder="5000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="cashOut">Cash-Out Amount (optional)</label>
                  <input 
                    id="cashOut"
                    type="number" 
                    formControlName="cashOut"
                    placeholder="0"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="calculatorForm.invalid || calculating"
              >
                {{ calculating ? 'Calculating...' : '🧮 Calculate Refinance Savings' }}
              </button>
              <button type="button" (click)="reset()" class="btn btn-secondary">
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Results Section -->
        <div *ngIf="result" class="results-section">
          <!-- Savings Summary -->
          <div class="savings-summary" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive-savings' : 'negative-savings'">
            <div class="summary-header">
              <h3>💰 Refinancing Analysis</h3>
              <div class="recommendation" [class]="result.breakEvenAnalysis.worthRefinancing ? 'recommend-yes' : 'recommend-no'">
                {{ result.recommendation }}
              </div>
            </div>
            
            <div class="savings-grid">
              <div class="savings-card">
                <div class="savings-icon">📅</div>
                <div class="savings-amount" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                  {{ result.savings.monthlyPaymentSavings > 0 ? '+' : '' }}\${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                </div>
                <div class="savings-label">Monthly Payment Change</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">💵</div>
                <div class="savings-amount" [class]="result.savings.totalInterestSavings > 0 ? 'positive' : 'negative'">
                  {{ result.savings.totalInterestSavings > 0 ? '+' : '' }}\${{ Math.abs(result.savings.totalInterestSavings) | number:'1.0-0' }}
                </div>
                <div class="savings-label">Interest Savings</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">🎯</div>
                <div class="savings-amount">{{ result.breakEvenAnalysis.breakEvenMonths }} months</div>
                <div class="savings-label">Break-Even Point</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">💎</div>
                <div class="savings-amount positive">{{ result.savings.percentageSavings | number:'1.1-1' }}%</div>
                <div class="savings-label">Total Savings Rate</div>
              </div>
            </div>
          </div>

          <!-- Detailed Comparison -->
          <div class="comparison-table">
            <h3>📊 Loan Comparison</h3>
            <div class="table-container">
              <table class="comparison-grid">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Current Loan</th>
                    <th>New Loan</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Interest Rate</td>
                    <td>{{ result.currentLoan.interestRate }}%</td>
                    <td>{{ result.newLoan.interestRate }}%</td>
                    <td [class]="result.newLoan.interestRate < result.currentLoan.interestRate ? 'positive' : 'negative'">
                      {{ (result.newLoan.interestRate - result.currentLoan.interestRate) | number:'1.2-2' }}%
                    </td>
                  </tr>
                  <tr>
                    <td>Monthly Payment</td>
                    <td>\${{ result.currentLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.monthlyPaymentSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                  <tr>
                    <td>Remaining Term</td>
                    <td>{{ result.currentLoan.remainingTerm }} years</td>
                    <td>{{ result.newLoan.remainingTerm }} years</td>
                    <td>{{ (result.newLoan.remainingTerm - result.currentLoan.remainingTerm) | number:'1.0-0' }} years</td>
                  </tr>
                  <tr>
                    <td>Total Interest</td>
                    <td>\${{ result.currentLoan.totalInterest | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.totalInterest | number:'1.0-0' }}</td>
                    <td [class]="result.savings.totalInterestSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.totalInterestSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.totalInterestSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Cost</td>
                    <td>\${{ result.currentLoan.totalCost | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.totalCost + result.breakEvenAnalysis.closingCosts | number:'1.0-0' }}</td>
                    <td [class]="result.savings.lifetimeSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.lifetimeSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.lifetimeSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Break-Even Analysis -->
          <div class="breakeven-analysis">
            <h3>⚖️ Break-Even Analysis</h3>
            <div class="breakeven-content">
              <div class="breakeven-chart">
                <div class="chart-placeholder">
                  <div class="chart-bar" 
                       [style.height.%]="(result.breakEvenAnalysis.breakEvenMonths / 60) * 100">
                  </div>
                  <div class="chart-label">{{ result.breakEvenAnalysis.breakEvenPoint }}</div>
                </div>
              </div>
              
              <div class="breakeven-details">
                <div class="detail-item">
                  <span class="detail-label">Closing Costs:</span>
                  <span class="detail-value">\${{ result.breakEvenAnalysis.closingCosts | number:'1.0-0' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Monthly Savings:</span>
                  <span class="detail-value" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                    \${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Break-Even Time:</span>
                  <span class="detail-value">{{ result.breakEvenAnalysis.breakEvenMonths }} months</span>
                </div>
                <div class="detail-item recommendation-detail">
                  <span class="detail-label">Recommendation:</span>
                  <span class="detail-value" [class]="result.breakEvenAnalysis.worthRefinancing ? 'recommend-yes' : 'recommend-no'">
                    {{ result.breakEvenAnalysis.worthRefinancing ? '✅ Refinance' : '❌ Don\'t Refinance' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="result-actions">
            <button (click)="saveCalculation()" class="btn btn-primary">💾 Save Calculation</button>
            <button (click)="exportResults()" class="btn btn-secondary">📄 Export Report</button>
            <button (click)="shareResults()" class="btn btn-outline">📤 Share Results</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .refinance-calculator-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .calculator-header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .calculator-header h1 {
      font-size: 2.5rem;
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .calculator-header p {
      font-size: 1.2rem;
      margin-bottom: 20px;
      opacity: 0.9;
    }

    .back-link {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    .back-link:hover {
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
    }

    .calculator-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .calculator-form {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .calculator-form h2 {
      color: #333;
      margin-bottom: 25px;
      text-align: center;
    }

    .form-section {
      margin-bottom: 30px;
      padding: 25px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .form-section h3 {
      color: #333;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e6ed;
      border-radius: 6px;
      font-size: 1rem;
      background: white;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Results Section */
    .results-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .savings-summary {
      margin-bottom: 30px;
      padding: 25px;
      border-radius: 12px;
      border-left: 5px solid;
    }

    .savings-summary.positive-savings {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }

    .savings-summary.negative-savings {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-color: #dc3545;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .summary-header h3 {
      margin: 0;
      color: #333;
    }

    .recommendation {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .recommend-yes {
      background: #28a745;
      color: white;
    }

    .recommend-no {
      background: #dc3545;
      color: white;
    }

    .savings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .savings-card {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .savings-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .savings-amount {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .savings-amount.positive {
      color: #28a745;
    }

    .savings-amount.negative {
      color: #dc3545;
    }

    .savings-label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .comparison-table {
      margin-bottom: 30px;
    }

    .comparison-table h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .comparison-grid {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .comparison-grid th {
      background: #667eea;
      color: white;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
    }

    .comparison-grid td {
      padding: 15px 12px;
      border-bottom: 1px solid #e9ecef;
    }

    .comparison-grid tr:hover {
      background: #f8f9fa;
    }

    .comparison-grid .positive {
      color: #28a745;
      font-weight: 600;
    }

    .comparison-grid .negative {
      color: #dc3545;
      font-weight: 600;
    }

    .breakeven-analysis {
      margin-bottom: 30px;
    }

    .breakeven-analysis h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .breakeven-content {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 30px;
      align-items: center;
    }

    .breakeven-chart {
      position: relative;
      height: 150px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
    }

    .chart-bar {
      width: 60px;
      background: linear-gradient(0deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      min-height: 20px;
    }

    .chart-label {
      position: absolute;
      bottom: 5px;
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .breakeven-details {
      display: grid;
      gap: 15px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item.recommendation-detail {
      border-bottom: none;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
    }

    .detail-value {
      font-weight: 600;
      color: #333;
    }

    .detail-value.positive {
      color: #28a745;
    }

    .detail-value.negative {
      color: #dc3545;
    }

    .result-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Expose Math to component */
    .savings-amount {
      /* Math functions will be available in component */
    }

    /* Responsive */
    @media (max-width: 768px) {
      .refinance-calculator-container {
        padding: 10px;
      }

      .calculator-header h1 {
        font-size: 2rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .savings-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .breakeven-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .result-actions {
        flex-direction: column;
        align-items: center;
      }

      .summary-header {
        flex-direction: column;
        gap: 15px;
        align-items: center;
      }
    }
  `]
})
export class RefinanceCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: RefinanceResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      currentBalance: [250000, [Validators.required, Validators.min(1000)]],
      currentRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      remainingYears: [25, [Validators.required, Validators.min(1), Validators.max(50)]],
      currentPayment: [1650, [Validators.required, Validators.min(100)]],
      newRate: [5.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      newTerm: [30, [Validators.required]],
      closingCosts: [5000, [Validators.required, Validators.min(0)]],
      cashOut: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Auto-calculate when form changes
    this.calculatorForm.valueChanges.subscribe(() => {
      if (this.calculatorForm.valid) {
        setTimeout(() => this.calculate(), 500); // Debounce
      }
    });
  }

  calculate() {
    if (this.calculatorForm.invalid) return;

    this.calculating = true;
    
    // Simulate calculation delay
    setTimeout(() => {
      const formData = this.calculatorForm.value;
      this.result = this.performCalculation(formData);
      this.calculating = false;
    }, 1000);
  }

  private performCalculation(data: any): RefinanceResult {
    const currentLoan = this.calculateLoanDetails(
      data.currentBalance,
      data.currentRate,
      data.remainingYears
    );

    const newLoan = this.calculateLoanDetails(
      data.currentBalance + data.cashOut,
      data.newRate,
      data.newTerm
    );

    const savings = this.calculateSavings(currentLoan, newLoan, data.closingCosts);
    const breakEvenAnalysis = this.calculateBreakEven(savings, data.closingCosts);
    const recommendation = this.generateRecommendation(breakEvenAnalysis, savings);

    return {
      currentLoan,
      newLoan,
      savings,
      breakEvenAnalysis,
      recommendation
    };
  }

  private calculateLoanDetails(balance: number, rate: number, term: number): LoanDetails {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;
    
    const monthlyPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - balance;

    return {
      balance,
      monthlyPayment,
      interestRate: rate,
      remainingTerm: term,
      totalInterest,
      totalCost
    };
  }

  private calculateSavings(currentLoan: LoanDetails, newLoan: LoanDetails, closingCosts: number): SavingsAnalysis {
    const monthlyPaymentSavings = currentLoan.monthlyPayment - newLoan.monthlyPayment;
    const totalInterestSavings = currentLoan.totalInterest - newLoan.totalInterest;
    const lifetimeSavings = totalInterestSavings - closingCosts;
    const percentageSavings = (lifetimeSavings / currentLoan.totalCost) * 100;

    return {
      monthlyPaymentSavings,
      totalInterestSavings,
      lifetimeSavings,
      percentageSavings
    };
  }

  private calculateBreakEven(savings: SavingsAnalysis, closingCosts: number): BreakEvenAnalysis {
    const breakEvenMonths = savings.monthlyPaymentSavings > 0 ? 
                           Math.ceil(closingCosts / savings.monthlyPaymentSavings) : 
                           999;

    const breakEvenPoint = breakEvenMonths < 999 ? 
                          `${Math.floor(breakEvenMonths / 12)} years, ${breakEvenMonths % 12} months` :
                          'Never';

    const worthRefinancing = breakEvenMonths <= 60 && savings.lifetimeSavings > 0; // 5 years or less

    return {
      closingCosts,
      breakEvenMonths,
      breakEvenPoint,
      worthRefinancing
    };
  }

  private generateRecommendation(breakEven: BreakEvenAnalysis, savings: SavingsAnalysis): string {
    if (breakEven.worthRefinancing) {
      return `✅ We recommend refinancing. You'll save $${Math.abs(savings.monthlyPaymentSavings).toLocaleString()} monthly and break even in ${breakEven.breakEvenMonths} months.`;
    } else if (breakEven.breakEvenMonths > 60) {
      return `❌ We don't recommend refinancing. Break-even period is too long (${breakEven.breakEvenMonths} months).`;
    } else {
      return `⚠️ Refinancing may not be beneficial. Consider your long-term plans and break-even period of ${breakEven.breakEvenMonths} months.`;
    }
  }

  reset() {
    this.calculatorForm.reset({
      currentBalance: 250000,
      currentRate: 6.5,
      remainingYears: 25,
      currentPayment: 1650,
      newRate: 5.5,
      newTerm: 30,
      closingCosts: 5000,
      cashOut: 0
    });
    this.result = null;
  }

  saveCalculation() {
    if (this.result) {
      // Save to localStorage or send to backend
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`refinance-calc-${Date.now()}`, JSON.stringify(calculationData));
      // Show success message
    }
  }

  exportResults() {
    if (this.result) {
      // Create CSV or PDF export
      const data = {
        calculation: this.calculatorForm.value,
        results: this.result,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `refinance-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      navigator.share({
        title: 'Refinancing Analysis Results',
        text: `My refinancing analysis shows ${this.result.savings.monthlyPaymentSavings > 0 ? 'savings' : 'costs'} of $${Math.abs(this.result.savings.monthlyPaymentSavings)} per month.`,
        url: window.location.href
      }).catch(console.error);
    }
  }
}