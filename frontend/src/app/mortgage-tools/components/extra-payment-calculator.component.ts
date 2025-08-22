import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

interface ExtraPaymentResult {
  originalLoan: LoanDetails;
  withExtraPayment: LoanDetails;
  savings: PaymentSavings;
  paymentSchedule: PaymentScheduleItem[];
  breakdownAnalysis: BreakdownAnalysis;
  scenarios: PaymentScenario[];
}

interface LoanDetails {
  balance: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  yearsToPayoff: number;
}

interface PaymentSavings {
  interestSaved: number;
  timeSaved: number; // in months
  percentageSaved: number;
  totalSavings: number;
}

interface PaymentScheduleItem {
  paymentNumber: number;
  paymentDate: string;
  regularPayment: number;
  extraPayment: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

interface BreakdownAnalysis {
  firstYear: YearlyBreakdown;
  fifthYear: YearlyBreakdown;
  totalBreakdown: TotalBreakdown;
}

interface YearlyBreakdown {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  remainingBalance: number;
}

interface TotalBreakdown {
  totalRegularPayments: number;
  totalExtraPayments: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
}

interface PaymentScenario {
  name: string;
  extraPayment: number;
  timeSaved: number;
  interestSaved: number;
  totalSavings: number;
}

@Component({
  selector: 'app-extra-payment-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="extra-payment-container">
      <div class="calculator-header">
        <h1>💰 Extra Payment Calculator</h1>
        <p>See how extra mortgage payments can save you time and money</p>
        <a routerLink="/mortgage-tools" class="back-link">← Back to Mortgage Tools</a>
      </div>

      <div class="calculator-content">
        <div class="calculator-form">
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <!-- Current Loan Details -->
            <div class="form-section">
              <h3>🏠 Current Mortgage Details</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="loanBalance">Current Loan Balance</label>
                  <input 
                    id="loanBalance"
                    type="number" 
                    formControlName="loanBalance"
                    placeholder="350000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="interestRate">Interest Rate (%)</label>
                  <input 
                    id="interestRate"
                    type="number" 
                    step="0.01"
                    formControlName="interestRate"
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
                  <label for="monthlyPayment">Current Monthly Payment</label>
                  <input 
                    id="monthlyPayment"
                    type="number" 
                    formControlName="monthlyPayment"
                    placeholder="2200"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Extra Payment Options -->
            <div class="form-section">
              <h3>➕ Extra Payment Strategy</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="extraPaymentType">Payment Type</label>
                  <select id="extraPaymentType" formControlName="extraPaymentType" class="form-input">
                    <option value="monthly">Monthly Extra Payment</option>
                    <option value="yearly">Annual Extra Payment</option>
                    <option value="oneTime">One-Time Payment</option>
                  </select>
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'monthly'">
                  <label for="monthlyExtra">Monthly Extra Payment</label>
                  <input 
                    id="monthlyExtra"
                    type="number" 
                    formControlName="monthlyExtra"
                    placeholder="200"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'yearly'">
                  <label for="yearlyExtra">Annual Extra Payment</label>
                  <input 
                    id="yearlyExtra"
                    type="number" 
                    formControlName="yearlyExtra"
                    placeholder="5000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'oneTime'">
                  <label for="oneTimeAmount">One-Time Payment Amount</label>
                  <input 
                    id="oneTimeAmount"
                    type="number" 
                    formControlName="oneTimeAmount"
                    placeholder="10000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'oneTime'">
                  <label for="oneTimeMonth">Payment Month (1-12)</label>
                  <input 
                    id="oneTimeMonth"
                    type="number" 
                    min="1"
                    max="12"
                    formControlName="oneTimeMonth"
                    placeholder="12"
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
                {{ calculating ? 'Calculating...' : '🧮 Calculate Savings' }}
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
          <div class="savings-summary">
            <div class="summary-header">
              <h3>📊 Extra Payment Impact</h3>
              <div class="recommendation-badge">
                {{ getSavingsRecommendation() }}
              </div>
            </div>
            
            <div class="savings-grid">
              <div class="savings-card highlight">
                <div class="savings-icon">💰</div>
                <div class="savings-amount">\${{ result.savings.interestSaved | number:'1.0-0' }}</div>
                <div class="savings-label">Interest Saved</div>
              </div>
              
              <div class="savings-card highlight">
                <div class="savings-icon">⏰</div>
                <div class="savings-amount">{{ Math.floor(result.savings.timeSaved / 12) }} years {{ result.savings.timeSaved % 12 }} months</div>
                <div class="savings-label">Time Saved</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">📈</div>
                <div class="savings-amount">{{ result.savings.percentageSaved | number:'1.1-1' }}%</div>
                <div class="savings-label">Percentage Saved</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">🎯</div>
                <div class="savings-amount">{{ result.withExtraPayment.payoffDate }}</div>
                <div class="savings-label">New Payoff Date</div>
              </div>
            </div>
          </div>

          <!-- Comparison Table -->
          <div class="comparison-table">
            <h3>📋 Loan Comparison</h3>
            <div class="table-container">
              <table class="loan-comparison">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Without Extra Payments</th>
                    <th>With Extra Payments</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monthly Payment</td>
                    <td>\${{ result.originalLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td>\${{ result.originalLoan.monthlyPayment + getAverageExtraPayment() | number:'1.0-0' }}</td>
                    <td class="positive">+\${{ getAverageExtraPayment() | number:'1.0-0' }}</td>
                  </tr>
                  <tr>
                    <td>Total Payments</td>
                    <td>{{ result.originalLoan.totalPayments }}</td>
                    <td>{{ result.withExtraPayment.totalPayments }}</td>
                    <td class="positive">-{{ result.originalLoan.totalPayments - result.withExtraPayment.totalPayments }}</td>
                  </tr>
                  <tr>
                    <td>Total Interest</td>
                    <td>\${{ result.originalLoan.totalInterest | number:'1.0-0' }}</td>
                    <td>\${{ result.withExtraPayment.totalInterest | number:'1.0-0' }}</td>
                    <td class="positive">-\${{ result.savings.interestSaved | number:'1.0-0' }}</td>
                  </tr>
                  <tr>
                    <td>Payoff Date</td>
                    <td>{{ result.originalLoan.payoffDate }}</td>
                    <td>{{ result.withExtraPayment.payoffDate }}</td>
                    <td class="positive">{{ Math.floor(result.savings.timeSaved / 12) }}y {{ result.savings.timeSaved % 12 }}m earlier</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Cost</td>
                    <td>\${{ result.originalLoan.totalCost | number:'1.0-0' }}</td>
                    <td>\${{ result.withExtraPayment.totalCost | number:'1.0-0' }}</td>
                    <td class="positive">-\${{ result.savings.totalSavings | number:'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payment Scenarios -->
          <div class="scenarios-section">
            <h3>🔬 Payment Scenarios</h3>
            <div class="scenarios-grid">
              <div 
                *ngFor="let scenario of result.scenarios" 
                class="scenario-card"
                [class.selected]="isSelectedScenario(scenario)"
              >
                <div class="scenario-header">
                  <h4>{{ scenario.name }}</h4>
                  <div class="scenario-amount">+\${{ scenario.extraPayment | number:'1.0-0' }}/month</div>
                </div>
                <div class="scenario-benefits">
                  <div class="benefit-item">
                    <span class="benefit-label">Interest Saved:</span>
                    <span class="benefit-value">\${{ scenario.interestSaved | number:'1.0-0' }}</span>
                  </div>
                  <div class="benefit-item">
                    <span class="benefit-label">Time Saved:</span>
                    <span class="benefit-value">{{ Math.floor(scenario.timeSaved / 12) }}y {{ scenario.timeSaved % 12 }}m</span>
                  </div>
                  <div class="benefit-item">
                    <span class="benefit-label">Total Savings:</span>
                    <span class="benefit-value highlight">\${{ scenario.totalSavings | number:'1.0-0' }}</span>
                  </div>
                </div>
                <button 
                  (click)="applyScenario(scenario)"
                  class="btn btn-sm btn-outline"
                >
                  Apply Scenario
                </button>
              </div>
            </div>
          </div>

          <!-- Breakdown Analysis -->
          <div class="breakdown-analysis">
            <h3>📊 Payment Breakdown</h3>
            <div class="breakdown-cards">
              <div class="breakdown-card">
                <h4>First Year</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Total Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.totalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Principal Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.principalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Interest Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.interestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Extra Payments:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.extraPaid | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="breakdown-card" *ngIf="result.breakdownAnalysis.fifthYear.year <= result.withExtraPayment.yearsToPayoff">
                <h4>Fifth Year</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Total Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.totalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Principal Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.principalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Interest Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.interestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Remaining Balance:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.remainingBalance | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="breakdown-card total">
                <h4>Total Summary</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Regular Payments:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalRegularPayments | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Extra Payments:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalExtraPayments | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Total Interest:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalInterestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row total-row">
                    <span>Grand Total:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalAmountPaid | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="result-actions">
            <button (click)="saveCalculation()" class="btn btn-primary">💾 Save Calculation</button>
            <button (click)="exportResults()" class="btn btn-secondary">📄 Export Report</button>
            <button (click)="shareResults()" class="btn btn-outline">📤 Share Results</button>
            <button (click)="viewPaymentSchedule()" class="btn btn-outline">📅 View Payment Schedule</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-payment-container {
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
      max-width: 1400px;
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

    .form-input[readonly] {
      background: #f8f9fa;
      color: #6c757d;
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

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
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
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-radius: 12px;
      border-left: 5px solid #28a745;
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

    .recommendation-badge {
      padding: 8px 16px;
      background: #28a745;
      color: white;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
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

    .savings-card.highlight {
      border: 2px solid #28a745;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    }

    .savings-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .savings-amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 5px;
      line-height: 1.2;
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

    .loan-comparison {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .loan-comparison th {
      background: #667eea;
      color: white;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
    }

    .loan-comparison td {
      padding: 15px 12px;
      border-bottom: 1px solid #e9ecef;
    }

    .loan-comparison tr:hover {
      background: #f8f9fa;
    }

    .loan-comparison .positive {
      color: #28a745;
      font-weight: 600;
    }

    .loan-comparison .total-row {
      background: #f8f9fa;
      font-weight: 600;
    }

    .scenarios-section {
      margin-bottom: 30px;
    }

    .scenarios-section h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .scenario-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .scenario-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .scenario-card.selected {
      border-color: #28a745;
      background: #f8fff9;
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .scenario-header h4 {
      margin: 0;
      color: #333;
    }

    .scenario-amount {
      font-weight: bold;
      color: #667eea;
    }

    .scenario-benefits {
      margin-bottom: 15px;
    }

    .benefit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .benefit-label {
      color: #666;
      font-size: 0.9rem;
    }

    .benefit-value {
      font-weight: 600;
      color: #333;
    }

    .benefit-value.highlight {
      color: #28a745;
      font-size: 1.1rem;
    }

    .breakdown-analysis {
      margin-bottom: 30px;
    }

    .breakdown-analysis h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .breakdown-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .breakdown-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
    }

    .breakdown-card.total {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .breakdown-card h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .breakdown-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
    }

    .detail-row.total-row {
      border-top: 2px solid #e9ecef;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: bold;
      color: #667eea;
    }

    .result-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Math functions available in template */
    .savings-amount {
      /* Math functions will be accessible */
    }

    /* Responsive */
    @media (max-width: 768px) {
      .extra-payment-container {
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

      .scenarios-grid {
        grid-template-columns: 1fr;
      }

      .breakdown-cards {
        grid-template-columns: 1fr;
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
export class ExtraPaymentCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: ExtraPaymentResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      loanBalance: [350000, [Validators.required, Validators.min(1000)]],
      interestRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      remainingYears: [25, [Validators.required, Validators.min(1), Validators.max(50)]],
      monthlyPayment: [{ value: 0, disabled: true }],
      extraPaymentType: ['monthly', [Validators.required]],
      monthlyExtra: [200, [Validators.min(0)]],
      yearlyExtra: [5000, [Validators.min(0)]],
      oneTimeAmount: [10000, [Validators.min(0)]],
      oneTimeMonth: [12, [Validators.min(1), Validators.max(12)]]
    });
  }

  ngOnInit() {
    // Calculate monthly payment when loan details change
    this.calculatorForm.get('loanBalance')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    this.calculatorForm.get('interestRate')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    this.calculatorForm.get('remainingYears')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    
    // Initial calculation
    this.updateMonthlyPayment();
    
    // Auto-calculate when form changes
    this.calculatorForm.valueChanges.subscribe(() => {
      if (this.calculatorForm.valid) {
        setTimeout(() => this.calculate(), 500); // Debounce
      }
    });
  }

  private updateMonthlyPayment() {
    const balance = this.calculatorForm.get('loanBalance')?.value;
    const rate = this.calculatorForm.get('interestRate')?.value;
    const years = this.calculatorForm.get('remainingYears')?.value;
    
    if (balance && rate && years) {
      const monthlyRate = rate / 100 / 12;
      const numberOfPayments = years * 12;
      
      const monthlyPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      this.calculatorForm.get('monthlyPayment')?.setValue(monthlyPayment);
    }
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

  private performCalculation(data: any): ExtraPaymentResult {
    const originalLoan = this.calculateOriginalLoan(data);
    const withExtraPayment = this.calculateLoanWithExtraPayments(data);
    const savings = this.calculateSavings(originalLoan, withExtraPayment);
    const paymentSchedule = this.generatePaymentSchedule(data);
    const breakdownAnalysis = this.calculateBreakdownAnalysis(paymentSchedule);
    const scenarios = this.generateScenarios(data);

    return {
      originalLoan,
      withExtraPayment,
      savings,
      paymentSchedule,
      breakdownAnalysis,
      scenarios
    };
  }

  private calculateOriginalLoan(data: any): LoanDetails {
    const balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const years = data.remainingYears;
    const numberOfPayments = years * 12;
    
    const monthlyPayment = balance * (rate * Math.pow(1 + rate, numberOfPayments)) / 
                          (Math.pow(1 + rate, numberOfPayments) - 1);
    
    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - balance;
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

    return {
      balance,
      monthlyPayment,
      totalPayments: numberOfPayments,
      totalInterest,
      totalCost,
      payoffDate: payoffDate.toLocaleDateString(),
      yearsToPayoff: years
    };
  }

  private calculateLoanWithExtraPayments(data: any): LoanDetails {
    let balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const regularPayment = this.calculatorForm.get('monthlyPayment')?.value;
    
    let totalInterest = 0;
    let totalRegularPayments = 0;
    let totalExtraPayments = 0;
    let paymentCount = 0;
    const maxPayments = data.remainingYears * 12;

    while (balance > 0 && paymentCount < maxPayments) {
      paymentCount++;
      const interestPayment = balance * rate;
      const principalPayment = Math.min(regularPayment - interestPayment, balance);
      
      // Calculate extra payment
      let extraPayment = 0;
      if (data.extraPaymentType === 'monthly') {
        extraPayment = data.monthlyExtra || 0;
      } else if (data.extraPaymentType === 'yearly' && paymentCount % 12 === 0) {
        extraPayment = data.yearlyExtra || 0;
      } else if (data.extraPaymentType === 'oneTime' && paymentCount === data.oneTimeMonth) {
        extraPayment = data.oneTimeAmount || 0;
      }
      
      // Apply extra payment to principal
      extraPayment = Math.min(extraPayment, balance - principalPayment);
      
      totalInterest += interestPayment;
      totalRegularPayments += regularPayment;
      totalExtraPayments += extraPayment;
      
      balance -= (principalPayment + extraPayment);
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + paymentCount);

    return {
      balance: 0,
      monthlyPayment: regularPayment,
      totalPayments: paymentCount,
      totalInterest,
      totalCost: totalRegularPayments + totalExtraPayments,
      payoffDate: payoffDate.toLocaleDateString(),
      yearsToPayoff: Math.round(paymentCount / 12 * 10) / 10
    };
  }

  private calculateSavings(originalLoan: LoanDetails, withExtraLoan: LoanDetails): PaymentSavings {
    const interestSaved = originalLoan.totalInterest - withExtraLoan.totalInterest;
    const timeSaved = originalLoan.totalPayments - withExtraLoan.totalPayments;
    const totalSavings = originalLoan.totalCost - withExtraLoan.totalCost;
    const percentageSaved = (interestSaved / originalLoan.totalInterest) * 100;

    return {
      interestSaved,
      timeSaved,
      percentageSaved,
      totalSavings
    };
  }

  private generatePaymentSchedule(data: any): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    let balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const regularPayment = this.calculatorForm.get('monthlyPayment')?.value;
    
    let paymentCount = 0;
    let cumulativeInterest = 0;
    const maxPayments = data.remainingYears * 12;

    while (balance > 0.01 && paymentCount < maxPayments && paymentCount < 60) { // Limit to 5 years for display
      paymentCount++;
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + paymentCount);
      
      const interestPaid = balance * rate;
      const principalPaid = Math.min(regularPayment - interestPaid, balance);
      
      // Calculate extra payment
      let extraPayment = 0;
      if (data.extraPaymentType === 'monthly') {
        extraPayment = data.monthlyExtra || 0;
      } else if (data.extraPaymentType === 'yearly' && paymentCount % 12 === 0) {
        extraPayment = data.yearlyExtra || 0;
      } else if (data.extraPaymentType === 'oneTime' && paymentCount === data.oneTimeMonth) {
        extraPayment = data.oneTimeAmount || 0;
      }
      
      extraPayment = Math.min(extraPayment, balance - principalPaid);
      
      cumulativeInterest += interestPaid;
      balance -= (principalPaid + extraPayment);

      schedule.push({
        paymentNumber: paymentCount,
        paymentDate: paymentDate.toLocaleDateString(),
        regularPayment,
        extraPayment,
        totalPayment: regularPayment + extraPayment,
        principalPaid: principalPaid + extraPayment,
        interestPaid,
        remainingBalance: Math.max(0, balance),
        cumulativeInterest
      });
    }

    return schedule;
  }

  private calculateBreakdownAnalysis(paymentSchedule: PaymentScheduleItem[]): BreakdownAnalysis {
    const firstYear = this.calculateYearlyBreakdown(paymentSchedule, 1);
    const fifthYear = this.calculateYearlyBreakdown(paymentSchedule, 5);
    
    const totalRegularPayments = paymentSchedule.reduce((sum, payment) => sum + payment.regularPayment, 0);
    const totalExtraPayments = paymentSchedule.reduce((sum, payment) => sum + payment.extraPayment, 0);
    const totalInterestPaid = paymentSchedule.reduce((sum, payment) => sum + payment.interestPaid, 0);
    
    const totalBreakdown: TotalBreakdown = {
      totalRegularPayments,
      totalExtraPayments,
      totalInterestPaid,
      totalAmountPaid: totalRegularPayments + totalExtraPayments
    };

    return {
      firstYear,
      fifthYear,
      totalBreakdown
    };
  }

  private calculateYearlyBreakdown(paymentSchedule: PaymentScheduleItem[], year: number): YearlyBreakdown {
    const startPayment = (year - 1) * 12 + 1;
    const endPayment = year * 12;
    
    const yearPayments = paymentSchedule.filter(p => 
      p.paymentNumber >= startPayment && p.paymentNumber <= endPayment
    );

    const totalPaid = yearPayments.reduce((sum, payment) => sum + payment.totalPayment, 0);
    const principalPaid = yearPayments.reduce((sum, payment) => sum + payment.principalPaid, 0);
    const interestPaid = yearPayments.reduce((sum, payment) => sum + payment.interestPaid, 0);
    const extraPaid = yearPayments.reduce((sum, payment) => sum + payment.extraPayment, 0);
    const remainingBalance = yearPayments.length > 0 ? yearPayments[yearPayments.length - 1].remainingBalance : 0;

    return {
      year,
      totalPaid,
      principalPaid,
      interestPaid,
      extraPaid,
      remainingBalance
    };
  }

  private generateScenarios(data: any): PaymentScenario[] {
    const scenarios: PaymentScenario[] = [];
    const extraAmounts = [50, 100, 200, 500];
    
    for (const extra of extraAmounts) {
      const scenarioData = { ...data, extraPaymentType: 'monthly', monthlyExtra: extra };
      const originalLoan = this.calculateOriginalLoan(data);
      const withExtra = this.calculateLoanWithExtraPayments(scenarioData);
      const savings = this.calculateSavings(originalLoan, withExtra);
      
      scenarios.push({
        name: `$${extra} Monthly`,
        extraPayment: extra,
        timeSaved: savings.timeSaved,
        interestSaved: savings.interestSaved,
        totalSavings: savings.totalSavings
      });
    }

    return scenarios;
  }

  getSavingsRecommendation(): string {
    if (!this.result) return '';
    
    const savings = this.result.savings;
    if (savings.interestSaved > 50000) {
      return '🌟 Excellent Strategy';
    } else if (savings.interestSaved > 20000) {
      return '👍 Good Strategy';
    } else if (savings.interestSaved > 5000) {
      return '✅ Beneficial';
    } else {
      return '💡 Modest Impact';
    }
  }

  getAverageExtraPayment(): number {
    if (!this.result) return 0;
    
    const form = this.calculatorForm.value;
    if (form.extraPaymentType === 'monthly') {
      return form.monthlyExtra || 0;
    } else if (form.extraPaymentType === 'yearly') {
      return (form.yearlyExtra || 0) / 12;
    } else {
      return (form.oneTimeAmount || 0) / this.result.withExtraPayment.totalPayments;
    }
  }

  isSelectedScenario(scenario: PaymentScenario): boolean {
    const currentExtra = this.getAverageExtraPayment();
    return Math.abs(scenario.extraPayment - currentExtra) < 1;
  }

  applyScenario(scenario: PaymentScenario) {
    this.calculatorForm.patchValue({
      extraPaymentType: 'monthly',
      monthlyExtra: scenario.extraPayment
    });
    this.calculate();
  }

  reset() {
    this.calculatorForm.reset({
      loanBalance: 350000,
      interestRate: 6.5,
      remainingYears: 25,
      extraPaymentType: 'monthly',
      monthlyExtra: 200,
      yearlyExtra: 5000,
      oneTimeAmount: 10000,
      oneTimeMonth: 12
    });
    this.result = null;
    this.updateMonthlyPayment();
  }

  saveCalculation() {
    if (this.result) {
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`extra-payment-calc-${Date.now()}`, JSON.stringify(calculationData));
      // Show success message
    }
  }

  exportResults() {
    if (this.result) {
      const data = {
        calculation: this.calculatorForm.value,
        results: this.result,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extra-payment-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      navigator.share({
        title: 'Extra Payment Calculator Results',
        text: `Making extra payments could save me $${Math.round(this.result.savings.interestSaved)} in interest and ${Math.floor(this.result.savings.timeSaved / 12)} years off my mortgage.`,
        url: window.location.href
      }).catch(console.error);
    }
  }

  viewPaymentSchedule() {
    if (this.result) {
      // Create a simple table view of the payment schedule
      console.table(this.result.paymentSchedule);
      // In a real app, this would open a detailed modal or navigate to a schedule page
    }
  }
}