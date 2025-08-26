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
        <h1>Mortgage Calculator</h1>
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
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Pre-approval Check
            </h3>
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
                <div class="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <ng-container *ngIf="preapprovalResult; else deniedIcon">
                      <polyline points="20,6 9,17 4,12"/>
                    </ng-container>
                    <ng-template #deniedIcon>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </ng-template>
                  </svg>
                </div>
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
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Payment Summary
            </h2>
            
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
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Payment Breakdown
              </h3>
              
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
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                  <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                </svg>
                Amortization Schedule
              </h3>
              
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  Export
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
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"/>
                </svg>
                Recent Calculations
              </h3>
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
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <h3>Ready to Calculate</h3>
            <p>Enter your loan details on the left to see payment estimates and amortization schedules.</p>
          </div>
        </div>
      </div>
      <!-- Additional Tools -->
      <div class="additional-tools" *ngIf="result">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
            <path d="M14.7 6.3A1 1 0 0 0 13 5L5 13L9 17L17 9A1 1 0 0 0 15.7 7.3Z"/>
            <path d="M9 7L17 15"/>
            <circle cx="6" cy="8" r="2"/>
          </svg>
          Additional Calculators
        </h3>
        <div class="tools-grid">
          <a routerLink="/refinance-calculator" class="tool-card">
            <div class="tool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="tool-title">Refinance Calculator</div>
            <div class="tool-description">See if refinancing could save you money</div>
          </a>
          
          <a routerLink="/extra-payment-calculator" class="tool-card">
            <div class="tool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="tool-title">Extra Payment Calculator</div>
            <div class="tool-description">Calculate savings with extra payments</div>
          </a>
          
          <a routerLink="/rent-vs-buy-calculator" class="tool-card">
            <div class="tool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
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