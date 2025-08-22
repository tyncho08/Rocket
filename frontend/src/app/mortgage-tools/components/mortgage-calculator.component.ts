import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MortgageService } from '../services/mortgage.service';
import { NotificationService } from '../../shared/services/notification.service';
import { MortgageCalculation, MortgageCalculationResult } from '../../shared/models/mortgage.model';

@Component({
  selector: 'app-mortgage-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="calculator-container">
      <div class="calculator-header">
        <h1>🧮 Mortgage Calculator</h1>
        <p>Calculate your monthly mortgage payments and see detailed amortization schedules</p>
      </div>

      <div class="calculator-main">
        <div class="calculator-form-section">
          <form [formGroup]="calculatorForm" class="calculator-form">
            <h2>Loan Details</h2>
            
            <div class="form-group">
              <label for="propertyPrice">Property Price</label>
              <div class="input-with-prefix">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  id="propertyPrice"
                  formControlName="propertyPrice"
                  placeholder="450,000"
                  class="form-input"
                />
              </div>
              <div class="form-error" *ngIf="calculatorForm.get('propertyPrice')?.errors?.['required'] && calculatorForm.get('propertyPrice')?.touched">
                Property price is required
              </div>
            </div>

            <div class="form-group">
              <label for="downPayment">Down Payment</label>
              <div class="input-row">
                <div class="input-with-prefix">
                  <span class="input-prefix">$</span>
                  <input
                    type="number"
                    id="downPayment"
                    formControlName="downPayment"
                    placeholder="90,000"
                    class="form-input"
                  />
                </div>
                <div class="percentage-display">
                  {{ getDownPaymentPercentage() }}%
                </div>
              </div>
              <div class="form-error" *ngIf="calculatorForm.get('downPayment')?.errors?.['required'] && calculatorForm.get('downPayment')?.touched">
                Down payment is required
              </div>
            </div>

            <div class="form-group">
              <label for="interestRate">Interest Rate</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  id="interestRate"
                  formControlName="interestRate"
                  placeholder="6.5"
                  step="0.01"
                  min="0.01"
                  max="20"
                  class="form-input"
                />
                <span class="input-suffix">%</span>
              </div>
              <div class="current-rates" *ngIf="currentRates.length > 0">
                <small>Current rates: 
                  <span *ngFor="let rate of currentRates; let last = last">
                    {{ rate.term }}yr {{ rate.rate }}%{{ !last ? ', ' : '' }}
                  </span>
                </small>
              </div>
              <div class="form-error" *ngIf="calculatorForm.get('interestRate')?.errors?.['required'] && calculatorForm.get('interestRate')?.touched">
                Interest rate is required
              </div>
            </div>

            <div class="form-group">
              <label for="loanTermYears">Loan Term</label>
              <div class="term-buttons">
                <button
                  *ngFor="let term of loanTermOptions"
                  type="button"
                  class="term-btn"
                  [class.active]="calculatorForm.get('loanTermYears')?.value === term"
                  (click)="setLoanTerm(term)"
                >
                  {{ term }} years
                </button>
              </div>
              <div class="custom-term" *ngIf="showCustomTerm">
                <input
                  type="number"
                  formControlName="loanTermYears"
                  placeholder="Custom years"
                  class="form-input"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div class="quick-actions">
              <button type="button" (click)="calculateMortgage()" class="btn btn-primary btn-large">
                Calculate Payment
              </button>
              <button type="button" (click)="clearForm()" class="btn btn-secondary">
                Clear
              </button>
            </div>
          </form>

          <!-- Pre-approval Section -->
          <div class="preapproval-section" *ngIf="result">
            <h3>🏦 Pre-approval Check</h3>
            <form [formGroup]="preapprovalForm" class="preapproval-form">
              <div class="form-group">
                <label for="annualIncome">Annual Income</label>
                <div class="input-with-prefix">
                  <span class="input-prefix">$</span>
                  <input
                    type="number"
                    id="annualIncome"
                    formControlName="annualIncome"
                    placeholder="85,000"
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="monthlyDebts">Monthly Debts</label>
                <div class="input-with-prefix">
                  <span class="input-prefix">$</span>
                  <input
                    type="number"
                    id="monthlyDebts"
                    formControlName="monthlyDebts"
                    placeholder="500"
                    class="form-input"
                  />
                </div>
              </div>

              <button type="button" (click)="checkPreapproval()" class="btn btn-outline">
                Check Eligibility
              </button>
            </form>

            <div class="preapproval-result" *ngIf="preapprovalResult !== null">
              <div class="eligibility-status" [class.approved]="preapprovalResult" [class.denied]="!preapprovalResult">
                <div class="status-icon">{{ preapprovalResult ? '✅' : '❌' }}</div>
                <div class="status-text">
                  <h4>{{ preapprovalResult ? 'Likely Pre-approved' : 'Pre-approval Unlikely' }}</h4>
                  <p>{{ preapprovalMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="calculator-results-section">
          <!-- Loading State -->
          <div *ngIf="calculating" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Calculating...</p>
          </div>

          <!-- Results Display -->
          <div *ngIf="result && !calculating" class="results-display">
            <h2>💰 Payment Summary</h2>
            
            <div class="payment-summary">
              <div class="main-payment">
                <div class="payment-amount">{{ mortgageService.formatCurrency(result.monthlyPayment) }}</div>
                <div class="payment-label">Monthly Payment</div>
              </div>
              
              <div class="payment-breakdown">
                <div class="breakdown-item">
                  <span class="label">Loan Amount:</span>
                  <span class="value">{{ mortgageService.formatCurrency(result.loanAmount) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">Total Interest:</span>
                  <span class="value">{{ mortgageService.formatCurrency(result.totalInterest) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">Total Payment:</span>
                  <span class="value">{{ mortgageService.formatCurrency(result.totalPayment) }}</span>
                </div>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
              <h3>📊 Payment Breakdown</h3>
              
              <!-- Simple visual breakdown -->
              <div class="payment-chart">
                <div class="chart-item">
                  <div class="chart-bar principal" [style.height.%]="getPrincipalPercentage()">
                    <div class="bar-label">Principal<br>{{ mortgageService.formatCurrency(result.loanAmount) }}</div>
                  </div>
                </div>
                <div class="chart-item">
                  <div class="chart-bar interest" [style.height.%]="getInterestPercentage()">
                    <div class="bar-label">Interest<br>{{ mortgageService.formatCurrency(result.totalInterest) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amortization Schedule -->
            <div class="amortization-section">
              <h3>📋 Amortization Schedule</h3>
              
              <div class="schedule-controls">
                <button 
                  type="button" 
                  (click)="showFullSchedule = !showFullSchedule" 
                  class="btn btn-outline btn-sm"
                >
                  {{ showFullSchedule ? 'Show Summary' : 'Show Full Schedule' }}
                </button>
                <button 
                  type="button" 
                  (click)="exportSchedule()" 
                  class="btn btn-outline btn-sm"
                >
                  📄 Export
                </button>
              </div>

              <div class="schedule-table" *ngIf="result.amortizationSchedule">
                <div class="table-header">
                  <div class="col">Payment #</div>
                  <div class="col">Payment</div>
                  <div class="col">Principal</div>
                  <div class="col">Interest</div>
                  <div class="col">Balance</div>
                </div>
                
                <div class="table-body">
                  <div 
                    *ngFor="let payment of getDisplaySchedule(); trackBy: trackByPayment" 
                    class="table-row"
                  >
                    <div class="col">{{ payment.paymentNumber }}</div>
                    <div class="col">{{ mortgageService.formatCurrency(payment.paymentAmount) }}</div>
                    <div class="col">{{ mortgageService.formatCurrency(payment.principalAmount) }}</div>
                    <div class="col">{{ mortgageService.formatCurrency(payment.interestAmount) }}</div>
                    <div class="col">{{ mortgageService.formatCurrency(payment.remainingBalance) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- History -->
            <div class="calculation-history" *ngIf="calculationHistory.length > 0">
              <h3>📚 Recent Calculations</h3>
              <div class="history-list">
                <div 
                  *ngFor="let calc of calculationHistory.slice(0, 3)" 
                  class="history-item"
                  (click)="loadFromHistory(calc)"
                >
                  <div class="history-payment">{{ mortgageService.formatCurrency(calc.monthlyPayment) }}/mo</div>
                  <div class="history-details">
                    {{ mortgageService.formatCurrency(calc.loanAmount + (calculatorForm.get('downPayment')?.value || 0)) }} • 
                    {{ calculatorForm.get('loanTermYears')?.value }}yr
                  </div>
                </div>
              </div>
              <button (click)="clearHistory()" class="btn btn-link btn-sm">Clear History</button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!result && !calculating" class="empty-results">
            <div class="empty-icon">🏠</div>
            <h3>Ready to Calculate</h3>
            <p>Enter your loan details on the left to see payment estimates and amortization schedules.</p>
          </div>
        </div>
      </div>
      <!-- Additional Tools -->
      <div class="additional-tools" *ngIf="result">
        <h3>🔧 Additional Calculators</h3>
        <div class="tools-grid">
          <a routerLink="/refinance-calculator" class="tool-card">
            <div class="tool-icon">🏦</div>
            <div class="tool-title">Refinance Calculator</div>
            <div class="tool-description">See if refinancing could save you money</div>
          </a>
          
          <a routerLink="/extra-payment-calculator" class="tool-card">
            <div class="tool-icon">💰</div>
            <div class="tool-title">Extra Payment Calculator</div>
            <div class="tool-description">Calculate savings with extra payments</div>
          </a>
          
          <a routerLink="/rent-vs-buy-calculator" class="tool-card">
            <div class="tool-icon">🏠</div>
            <div class="tool-title">Rent vs Buy Calculator</div>
            <div class="tool-description">Decide between renting and buying</div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .calculator-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .calculator-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .calculator-header p {
      font-size: 1.1rem;
      color: #6c757d;
    }

    .calculator-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .calculator-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .preapproval-section {
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid #3498db;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .input-with-prefix, .input-with-suffix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix, .input-suffix {
      position: absolute;
      color: #6c757d;
      font-weight: 600;
    }

    .input-prefix {
      left: 0.75rem;
    }

    .input-suffix {
      right: 0.75rem;
    }

    .input-with-prefix .form-input {
      padding-left: 2rem;
    }

    .input-with-suffix .form-input {
      padding-right: 2rem;
    }

    .input-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .input-row .input-with-prefix {
      flex: 1;
    }

    .percentage-display {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }

    .current-rates {
      margin-top: 0.5rem;
    }

    .current-rates small {
      color: #6c757d;
    }

    .term-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .term-btn {
      padding: 0.75rem 1rem;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .term-btn.active {
      border-color: #3498db;
      background-color: #3498db;
      color: white;
    }

    .custom-term {
      margin-top: 0.5rem;
    }

    .form-error {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-outline {
      background: white;
      border: 2px solid #3498db;
      color: #3498db;
    }

    .btn-outline:hover {
      background-color: #3498db;
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #3498db;
      text-decoration: underline;
    }

    .results-display {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .payment-summary {
      background: linear-gradient(135deg, #3498db, #2c3e50);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 2rem;
    }

    .main-payment {
      margin-bottom: 1.5rem;
    }

    .payment-amount {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .payment-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .payment-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .breakdown-item {
      display: flex;
      flex-direction: column;
      text-align: center;
    }

    .breakdown-item .label {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 0.25rem;
    }

    .breakdown-item .value {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .payment-chart {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
    }

    .chart-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chart-bar {
      width: 80px;
      max-height: 200px;
      display: flex;
      align-items: end;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 6px 6px 0 0;
      color: white;
      font-weight: 600;
      text-align: center;
      font-size: 0.8rem;
      line-height: 1.2;
    }

    .chart-bar.principal {
      background: linear-gradient(to top, #27ae60, #2ecc71);
    }

    .chart-bar.interest {
      background: linear-gradient(to top, #e74c3c, #ec7063);
    }

    .schedule-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      justify-content: flex-end;
    }

    .schedule-table {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    }

    .table-header {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .table-header .col, .table-row .col {
      padding: 0.75rem;
      text-align: right;
      border-right: 1px solid #dee2e6;
    }

    .table-header .col:first-child, .table-row .col:first-child {
      text-align: center;
    }

    .table-header .col:last-child, .table-row .col:last-child {
      border-right: none;
    }

    .table-row {
      border-bottom: 1px solid #f1f3f4;
      font-size: 0.9rem;
    }

    .table-row:hover {
      background-color: #f8f9fa;
    }

    .table-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .preapproval-result {
      margin-top: 1.5rem;
    }

    .eligibility-status {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
    }

    .eligibility-status.approved {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .eligibility-status.denied {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .status-icon {
      font-size: 2rem;
    }

    .status-text h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .status-text p {
      margin: 0;
      color: #6c757d;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .history-item {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .history-item:hover {
      background: #e9ecef;
    }

    .history-payment {
      font-weight: 600;
      color: #3498db;
    }

    .history-details {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .loading-state, .empty-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .loading-spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .calculator-container {
        padding: 1rem;
      }

      .calculator-main {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .payment-breakdown {
        grid-template-columns: 1fr;
      }

      .payment-chart {
        flex-direction: column;
        gap: 1rem;
      }

      .table-header, .table-row {
        grid-template-columns: 0.8fr 1fr 1fr 1fr 1fr;
        font-size: 0.8rem;
      }

      .table-header .col, .table-row .col {
        padding: 0.5rem;
      }
    }

    /* Additional Tools Styles */
    .additional-tools {
      margin-top: 3rem;
      text-align: center;
    }

    .additional-tools h3 {
      margin-bottom: 2rem;
      color: #2c3e50;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .tool-card {
      display: block;
      padding: 1.5rem;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tool-card:hover {
      border-color: #3498db;
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(52, 152, 219, 0.2);
      color: inherit;
      text-decoration: none;
    }

    .tool-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .tool-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .tool-description {
      font-size: 0.9rem;
      color: #6c757d;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MortgageCalculatorComponent implements OnInit, OnDestroy {
  calculatorForm: FormGroup;
  preapprovalForm: FormGroup;
  result: MortgageCalculationResult | null = null;
  preapprovalResult: boolean | null = null;
  preapprovalMessage = '';
  calculating = false;
  currentRates: any[] = [];
  loanTermOptions = [15, 20, 25, 30];
  showCustomTerm = false;
  showFullSchedule = false;
  calculationHistory: MortgageCalculationResult[] = [];
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public mortgageService: MortgageService,
    private notificationService: NotificationService
  ) {
    this.calculatorForm = this.fb.group({
      propertyPrice: [450000, [Validators.required, Validators.min(10000), Validators.max(10000000)]],
      downPayment: [90000, [Validators.required, Validators.min(0)]],
      interestRate: [6.5, [Validators.required, Validators.min(0.01), Validators.max(20)]],
      loanTermYears: [30, [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    this.preapprovalForm = this.fb.group({
      annualIncome: [85000, [Validators.min(0)]],
      monthlyDebts: [500, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Check for query parameters (from property detail page)
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        if (params['propertyPrice']) {
          const price = +params['propertyPrice'];
          this.calculatorForm.patchValue({
            propertyPrice: price,
            downPayment: Math.round(price * 0.2) // Default 20% down
          });
          this.calculateMortgage();
        }
      })
    );

    // Auto-calculate when form values change (debounced)
    this.subscriptions.add(
      this.calculatorForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        if (this.calculatorForm.valid) {
          this.calculateMortgageInstant();
        }
      })
    );

    // Load current rates
    this.loadCurrentRates();

    // Load calculation history
    this.loadCalculationHistory();

    // Initial calculation if form is valid
    if (this.calculatorForm.valid) {
      this.calculateMortgage();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  calculateMortgage(): void {
    if (!this.calculatorForm.valid) {
      this.markFormGroupTouched(this.calculatorForm);
      return;
    }

    this.calculating = true;
    const formValue = this.calculatorForm.value;
    
    const calculation: MortgageCalculation = {
      propertyPrice: formValue.propertyPrice,
      downPayment: formValue.downPayment,
      interestRate: formValue.interestRate,
      loanTermYears: formValue.loanTermYears
    };

    this.mortgageService.calculateMortgage(calculation).subscribe({
      next: (result) => {
        this.result = result;
        this.calculating = false;
        this.notificationService.success('Calculation Complete', 'Your mortgage payment has been calculated');
      },
      error: (error) => {
        this.calculating = false;
        this.notificationService.error('Calculation Error', 'Unable to calculate mortgage payment');
        console.error('Mortgage calculation error:', error);
      }
    });
  }

  calculateMortgageInstant(): void {
    // Local instant calculation for real-time feedback
    if (!this.calculatorForm.valid) return;

    const formValue = this.calculatorForm.value;
    const loanAmount = formValue.propertyPrice - formValue.downPayment;
    const monthlyPayment = this.mortgageService.calculateMonthlyPaymentLocal(
      loanAmount,
      formValue.interestRate,
      formValue.loanTermYears
    );

    // Create a basic result for instant feedback
    this.result = {
      monthlyPayment,
      loanAmount,
      totalInterest: this.mortgageService.calculateTotalInterest(monthlyPayment, formValue.loanTermYears, loanAmount),
      totalPayment: monthlyPayment * formValue.loanTermYears * 12,
      amortizationSchedule: [] // Will be filled by API call
    };
  }

  checkPreapproval(): void {
    if (!this.result || !this.preapprovalForm.valid) {
      this.notificationService.warning('Missing Information', 'Please calculate mortgage payment first and enter income details');
      return;
    }

    const formValue = this.preapprovalForm.value;
    this.mortgageService.checkPreApproval(
      formValue.annualIncome,
      this.result.loanAmount,
      formValue.monthlyDebts
    ).subscribe({
      next: (result) => {
        this.preapprovalResult = result.isEligible;
        
        const dtiRatio = this.mortgageService.calculateDebtToIncomeRatio(
          formValue.annualIncome / 12,
          formValue.monthlyDebts,
          this.result!.monthlyPayment
        );

        if (result.isEligible) {
          this.preapprovalMessage = `Your debt-to-income ratio is ${dtiRatio.toFixed(1)}%, which is within acceptable limits.`;
        } else {
          this.preapprovalMessage = `Your debt-to-income ratio is ${dtiRatio.toFixed(1)}%, which exceeds the recommended 43% threshold.`;
        }
      },
      error: () => {
        this.notificationService.error('Pre-approval Error', 'Unable to check pre-approval eligibility');
      }
    });
  }

  setLoanTerm(term: number): void {
    this.calculatorForm.patchValue({ loanTermYears: term });
    this.showCustomTerm = false;
  }

  clearForm(): void {
    this.calculatorForm.reset({
      propertyPrice: 450000,
      downPayment: 90000,
      interestRate: 6.5,
      loanTermYears: 30
    });
    this.preapprovalForm.reset({
      annualIncome: 85000,
      monthlyDebts: 500
    });
    this.result = null;
    this.preapprovalResult = null;
    this.preapprovalMessage = '';
  }

  loadCurrentRates(): void {
    this.mortgageService.getCurrentRates().subscribe({
      next: (rates) => {
        this.currentRates = rates.slice(0, 3); // Show top 3 rates
      },
      error: () => {
        // Silently fail for rates as it's not critical
      }
    });
  }

  loadCalculationHistory(): void {
    this.subscriptions.add(
      this.mortgageService.calculationHistory$.subscribe(history => {
        this.calculationHistory = history;
      })
    );
  }

  loadFromHistory(calculation: MortgageCalculationResult): void {
    // Reconstruct form values from historical calculation
    const propertyPrice = calculation.loanAmount + this.calculatorForm.get('downPayment')?.value || 0;
    this.calculatorForm.patchValue({
      propertyPrice: propertyPrice
    });
    this.result = calculation;
  }

  clearHistory(): void {
    this.mortgageService.clearHistory();
  }

  exportSchedule(): void {
    if (!this.result?.amortizationSchedule) return;

    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amortization-schedule.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.notificationService.success('Export Complete', 'Amortization schedule exported successfully');
  }

  getDownPaymentPercentage(): number {
    const propertyPrice = this.calculatorForm.get('propertyPrice')?.value || 0;
    const downPayment = this.calculatorForm.get('downPayment')?.value || 0;
    if (propertyPrice === 0) return 0;
    return Math.round((downPayment / propertyPrice) * 100);
  }

  getPrincipalPercentage(): number {
    if (!this.result) return 0;
    return (this.result.loanAmount / this.result.totalPayment) * 100;
  }

  getInterestPercentage(): number {
    if (!this.result) return 0;
    return (this.result.totalInterest / this.result.totalPayment) * 100;
  }

  getDisplaySchedule() {
    if (!this.result?.amortizationSchedule) return [];
    
    if (this.showFullSchedule) {
      return this.result.amortizationSchedule;
    } else {
      // Show first 12 payments (first year)
      return this.result.amortizationSchedule.slice(0, 12);
    }
  }

  trackByPayment(index: number, payment: any) {
    return payment.paymentNumber;
  }

  private generateCSV(): string {
    if (!this.result?.amortizationSchedule) return '';

    let csv = 'Payment Number,Payment Amount,Principal,Interest,Remaining Balance\n';
    
    this.result.amortizationSchedule.forEach(payment => {
      csv += `${payment.paymentNumber},${payment.paymentAmount},${payment.principalAmount},${payment.interestAmount},${payment.remainingBalance}\n`;
    });

    return csv;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}