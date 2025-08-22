import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

interface RentVsBuyResult {
  buying: BuyingAnalysis;
  renting: RentingAnalysis;
  comparison: ComparisonAnalysis;
  breakEvenPoint: number;
  recommendation: RecommendationResult;
  yearlyComparison: YearlyData[];
}

interface BuyingAnalysis {
  monthlyPayment: number;
  totalMonthlyCost: number;
  downPayment: number;
  closingCosts: number;
  initialCashOutlay: number;
  yearlyAppreciation: number;
  equityBuilt: number;
  totalCost5Years: number;
  totalCost10Years: number;
  netWorth5Years: number;
  netWorth10Years: number;
}

interface RentingAnalysis {
  monthlyRent: number;
  totalMonthlyCost: number;
  initialDeposit: number;
  yearlyRentIncrease: number;
  totalCost5Years: number;
  totalCost10Years: number;
  investmentGrowth5Years: number;
  investmentGrowth10Years: number;
  netWorth5Years: number;
  netWorth10Years: number;
}

interface ComparisonAnalysis {
  monthlyDifference: number;
  cashOutlayDifference: number;
  fiveYearAdvantage: 'buy' | 'rent' | 'neutral';
  tenYearAdvantage: 'buy' | 'rent' | 'neutral';
  fiveYearSavings: number;
  tenYearSavings: number;
}

interface RecommendationResult {
  decision: 'buy' | 'rent' | 'neutral';
  confidence: number;
  primaryReason: string;
  considerations: string[];
}

interface YearlyData {
  year: number;
  buyingCumulativeCost: number;
  rentingCumulativeCost: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
}

@Component({
  selector: 'app-rent-vs-buy-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="rent-vs-buy-container">
      <div class="calculator-header">
        <h1>🏠 Rent vs Buy Calculator</h1>
        <p>Make an informed decision about renting versus buying a home</p>
        <a routerLink="/mortgage-tools" class="back-link">← Back to Mortgage Tools</a>
      </div>

      <div class="calculator-content">
        <div class="calculator-form">
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <!-- Property Details -->
            <div class="form-section">
              <h3>🏡 Property Details</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="homePrice">Home Purchase Price</label>
                  <input 
                    id="homePrice"
                    type="number" 
                    formControlName="homePrice"
                    placeholder="400000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="monthlyRent">Monthly Rent</label>
                  <input 
                    id="monthlyRent"
                    type="number" 
                    formControlName="monthlyRent"
                    placeholder="2200"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Buying Costs -->
            <div class="form-section">
              <h3>💰 Buying Costs</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="downPaymentPercent">Down Payment (%)</label>
                  <input 
                    id="downPaymentPercent"
                    type="number" 
                    min="0"
                    max="100"
                    formControlName="downPaymentPercent"
                    placeholder="20"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="interestRate">Mortgage Rate (%)</label>
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
                  <label for="loanTerm">Loan Term (years)</label>
                  <select id="loanTerm" formControlName="loanTerm" class="form-input">
                    <option value="15">15 years</option>
                    <option value="30">30 years</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="closingCosts">Closing Costs ($)</label>
                  <input 
                    id="closingCosts"
                    type="number" 
                    formControlName="closingCosts"
                    placeholder="8000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="propertyTaxRate">Property Tax Rate (%)</label>
                  <input 
                    id="propertyTaxRate"
                    type="number" 
                    step="0.01"
                    formControlName="propertyTaxRate"
                    placeholder="1.2"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="homeInsurance">Home Insurance (monthly)</label>
                  <input 
                    id="homeInsurance"
                    type="number" 
                    formControlName="homeInsurance"
                    placeholder="200"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="maintenance">Maintenance & Repairs (%/year)</label>
                  <input 
                    id="maintenance"
                    type="number" 
                    step="0.1"
                    formControlName="maintenance"
                    placeholder="1.5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="hoaFees">HOA Fees (monthly)</label>
                  <input 
                    id="hoaFees"
                    type="number" 
                    formControlName="hoaFees"
                    placeholder="0"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Market Assumptions -->
            <div class="form-section">
              <h3>📈 Market Assumptions</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="homeAppreciation">Home Appreciation (%/year)</label>
                  <input 
                    id="homeAppreciation"
                    type="number" 
                    step="0.1"
                    formControlName="homeAppreciation"
                    placeholder="3.0"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="rentIncrease">Rent Increase (%/year)</label>
                  <input 
                    id="rentIncrease"
                    type="number" 
                    step="0.1"
                    formControlName="rentIncrease"
                    placeholder="3.0"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="investmentReturn">Investment Return (%/year)</label>
                  <input 
                    id="investmentReturn"
                    type="number" 
                    step="0.1"
                    formControlName="investmentReturn"
                    placeholder="7.0"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="inflationRate">Inflation Rate (%/year)</label>
                  <input 
                    id="inflationRate"
                    type="number" 
                    step="0.1"
                    formControlName="inflationRate"
                    placeholder="2.5"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Renting Costs -->
            <div class="form-section">
              <h3>🏠 Renting Costs</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="securityDeposit">Security Deposit</label>
                  <input 
                    id="securityDeposit"
                    type="number" 
                    formControlName="securityDeposit"
                    placeholder="2200"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="rentersInsurance">Renters Insurance (monthly)</label>
                  <input 
                    id="rentersInsurance"
                    type="number" 
                    formControlName="rentersInsurance"
                    placeholder="25"
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
                {{ calculating ? 'Analyzing...' : '📊 Compare Rent vs Buy' }}
              </button>
              <button type="button" (click)="reset()" class="btn btn-secondary">
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Results Section -->
        <div *ngIf="result" class="results-section">
          <!-- Quick Decision -->
          <div class="decision-summary" [class]="'decision-' + result.recommendation.decision">
            <div class="decision-header">
              <h3>🎯 Our Recommendation</h3>
              <div class="confidence-meter">
                <div class="confidence-bar" [style.width.%]="result.recommendation.confidence"></div>
                <span class="confidence-text">{{ result.recommendation.confidence }}% confident</span>
              </div>
            </div>
            
            <div class="decision-result">
              <div class="decision-icon">
                {{ result.recommendation.decision === 'buy' ? '🏠' : result.recommendation.decision === 'rent' ? '🔑' : '🤔' }}
              </div>
              <div class="decision-content">
                <h4 class="decision-title">
                  {{ result.recommendation.decision === 'buy' ? 'Buy the Home' : 
                     result.recommendation.decision === 'rent' ? 'Keep Renting' : 'It\'s a Tie' }}
                </h4>
                <p class="decision-reason">{{ result.recommendation.primaryReason }}</p>
              </div>
            </div>
            
            <div class="decision-considerations">
              <h5>Consider These Factors:</h5>
              <ul>
                <li *ngFor="let consideration of result.recommendation.considerations">{{ consideration }}</li>
              </ul>
            </div>
          </div>

          <!-- Cost Comparison -->
          <div class="cost-comparison">
            <h3>💵 Cost Comparison</h3>
            <div class="comparison-grid">
              <div class="comparison-item">
                <div class="comparison-header">
                  <h4>🏠 Buying</h4>
                  <div class="monthly-cost">\${{ result.buying.totalMonthlyCost | number:'1.0-0' }}/month</div>
                </div>
                <div class="cost-breakdown">
                  <div class="cost-item">
                    <span>Mortgage Payment:</span>
                    <span>\${{ result.buying.monthlyPayment | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Initial Cash Needed:</span>
                    <span>\${{ result.buying.initialCashOutlay | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>5-Year Net Worth:</span>
                    <span [class]="result.buying.netWorth5Years > 0 ? 'positive' : 'negative'">
                      \${{ result.buying.netWorth5Years | number:'1.0-0' }}
                    </span>
                  </div>
                  <div class="cost-item">
                    <span>10-Year Net Worth:</span>
                    <span [class]="result.buying.netWorth10Years > 0 ? 'positive' : 'negative'">
                      \${{ result.buying.netWorth10Years | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="comparison-item">
                <div class="comparison-header">
                  <h4>🔑 Renting</h4>
                  <div class="monthly-cost">\${{ result.renting.totalMonthlyCost | number:'1.0-0' }}/month</div>
                </div>
                <div class="cost-breakdown">
                  <div class="cost-item">
                    <span>Monthly Rent:</span>
                    <span>\${{ result.renting.monthlyRent | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Initial Cash Needed:</span>
                    <span>\${{ result.renting.initialDeposit | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>5-Year Net Worth:</span>
                    <span [class]="result.renting.netWorth5Years > 0 ? 'positive' : 'negative'">
                      \${{ result.renting.netWorth5Years | number:'1.0-0' }}
                    </span>
                  </div>
                  <div class="cost-item">
                    <span>10-Year Net Worth:</span>
                    <span [class]="result.renting.netWorth10Years > 0 ? 'positive' : 'negative'">
                      \${{ result.renting.netWorth10Years | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Break-Even Analysis -->
          <div class="breakeven-section">
            <h3>⚖️ Break-Even Analysis</h3>
            <div class="breakeven-content">
              <div class="breakeven-chart">
                <div class="chart-info">
                  <div class="breakeven-point">
                    <div class="breakeven-value">{{ result.breakEvenPoint }}</div>
                    <div class="breakeven-label">years to break even</div>
                  </div>
                </div>
              </div>
              <div class="breakeven-insights">
                <div class="insight-item">
                  <span class="insight-label">Monthly Difference:</span>
                  <span class="insight-value" [class]="result.comparison.monthlyDifference > 0 ? 'positive' : 'negative'">
                    {{ result.comparison.monthlyDifference > 0 ? 'Renting costs ' : 'Buying costs ' }}
                    \${{ Math.abs(result.comparison.monthlyDifference) | number:'1.0-0' }} more
                  </span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">5-Year Advantage:</span>
                  <span class="insight-value">
                    {{ result.comparison.fiveYearAdvantage === 'buy' ? '🏠 Buying' : '🔑 Renting' }} 
                    saves \${{ Math.abs(result.comparison.fiveYearSavings) | number:'1.0-0' }}
                  </span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">10-Year Advantage:</span>
                  <span class="insight-value">
                    {{ result.comparison.tenYearAdvantage === 'buy' ? '🏠 Buying' : '🔑 Renting' }} 
                    saves \${{ Math.abs(result.comparison.tenYearSavings) | number:'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Yearly Comparison Chart -->
          <div class="yearly-chart">
            <h3>📈 10-Year Financial Projection</h3>
            <div class="chart-container">
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color buying"></div>
                  <span>Buying Net Worth</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color renting"></div>
                  <span>Renting Net Worth</span>
                </div>
              </div>
              
              <div class="chart-grid">
                <div 
                  *ngFor="let data of result.yearlyComparison; let i = index"
                  class="chart-bar-group"
                  [style.width.%]="10"
                >
                  <div class="bar-container">
                    <div 
                      class="chart-bar buying"
                      [style.height.px]="getBarHeight(data.buyingNetWorth)"
                      [title]="'Year ' + data.year + ': $' + (data.buyingNetWorth | number:'1.0-0')"
                    ></div>
                    <div 
                      class="chart-bar renting"
                      [style.height.px]="getBarHeight(data.rentingNetWorth)"
                      [title]="'Year ' + data.year + ': $' + (data.rentingNetWorth | number:'1.0-0')"
                    ></div>
                  </div>
                  <div class="year-label">{{ data.year }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="result-actions">
            <button (click)="saveCalculation()" class="btn btn-primary">💾 Save Analysis</button>
            <button (click)="exportResults()" class="btn btn-secondary">📄 Export Report</button>
            <button (click)="shareResults()" class="btn btn-outline">📤 Share Results</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rent-vs-buy-container {
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

    .decision-summary {
      margin-bottom: 30px;
      padding: 25px;
      border-radius: 12px;
      border-left: 5px solid;
    }

    .decision-summary.decision-buy {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }

    .decision-summary.decision-rent {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-color: #17a2b8;
    }

    .decision-summary.decision-neutral {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
      border-color: #ffc107;
    }

    .decision-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .decision-header h3 {
      margin: 0;
      color: #333;
    }

    .confidence-meter {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .confidence-bar {
      width: 100px;
      height: 8px;
      background: #28a745;
      border-radius: 4px;
      position: relative;
    }

    .confidence-text {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }

    .decision-result {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .decision-icon {
      font-size: 3rem;
    }

    .decision-title {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 5px;
    }

    .decision-reason {
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    .decision-considerations h5 {
      color: #333;
      margin-bottom: 10px;
    }

    .decision-considerations ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .decision-considerations li {
      padding: 5px 0;
      color: #666;
      position: relative;
      padding-left: 20px;
    }

    .decision-considerations li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
    }

    .cost-comparison {
      margin-bottom: 30px;
    }

    .cost-comparison h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .comparison-item {
      border: 2px solid #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }

    .comparison-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }

    .comparison-header h4 {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
    }

    .monthly-cost {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .cost-breakdown {
      padding: 20px;
    }

    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .cost-item:last-child {
      border-bottom: none;
    }

    .cost-item span:first-child {
      color: #666;
    }

    .cost-item span:last-child {
      font-weight: 600;
      color: #333;
    }

    .positive {
      color: #28a745 !important;
    }

    .negative {
      color: #dc3545 !important;
    }

    .breakeven-section {
      margin-bottom: 30px;
    }

    .breakeven-section h3 {
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
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .breakeven-point {
      text-align: center;
    }

    .breakeven-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
    }

    .breakeven-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
    }

    .breakeven-insights {
      display: grid;
      gap: 15px;
    }

    .insight-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .insight-label {
      color: #666;
      font-weight: 500;
    }

    .insight-value {
      font-weight: 600;
      color: #333;
    }

    .yearly-chart {
      margin-bottom: 30px;
    }

    .yearly-chart h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .chart-container {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    .legend-color.buying {
      background: #28a745;
    }

    .legend-color.renting {
      background: #17a2b8;
    }

    .chart-grid {
      display: flex;
      align-items: flex-end;
      gap: 5px;
      height: 200px;
      border-bottom: 2px solid #e9ecef;
      border-left: 2px solid #e9ecef;
      padding: 10px;
    }

    .chart-bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .bar-container {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      height: 180px;
    }

    .chart-bar {
      width: 8px;
      border-radius: 2px 2px 0 0;
      min-height: 5px;
    }

    .chart-bar.buying {
      background: #28a745;
    }

    .chart-bar.renting {
      background: #17a2b8;
    }

    .year-label {
      font-size: 0.75rem;
      color: #666;
      margin-top: 5px;
    }

    .result-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .rent-vs-buy-container {
        padding: 10px;
      }

      .calculator-header h1 {
        font-size: 2rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .comparison-grid {
        grid-template-columns: 1fr;
      }

      .breakeven-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .decision-result {
        flex-direction: column;
        text-align: center;
      }

      .chart-legend {
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }

      .result-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class RentVsBuyCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: RentVsBuyResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      homePrice: [400000, [Validators.required, Validators.min(10000)]],
      monthlyRent: [2200, [Validators.required, Validators.min(100)]],
      downPaymentPercent: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      interestRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      loanTerm: [30, [Validators.required]],
      closingCosts: [8000, [Validators.required, Validators.min(0)]],
      propertyTaxRate: [1.2, [Validators.required, Validators.min(0)]],
      homeInsurance: [200, [Validators.required, Validators.min(0)]],
      maintenance: [1.5, [Validators.required, Validators.min(0)]],
      hoaFees: [0, [Validators.min(0)]],
      homeAppreciation: [3.0, [Validators.required]],
      rentIncrease: [3.0, [Validators.required]],
      investmentReturn: [7.0, [Validators.required]],
      inflationRate: [2.5, [Validators.required]],
      securityDeposit: [2200, [Validators.required, Validators.min(0)]],
      rentersInsurance: [25, [Validators.required, Validators.min(0)]]
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

  private performCalculation(data: any): RentVsBuyResult {
    const buying = this.calculateBuying(data);
    const renting = this.calculateRenting(data);
    const comparison = this.compareOptions(buying, renting);
    const breakEvenPoint = this.calculateBreakEven(buying, renting, data);
    const recommendation = this.generateRecommendation(buying, renting, comparison);
    const yearlyComparison = this.generateYearlyComparison(data, buying, renting);

    return {
      buying,
      renting,
      comparison,
      breakEvenPoint,
      recommendation,
      yearlyComparison
    };
  }

  private calculateBuying(data: any): BuyingAnalysis {
    const downPayment = data.homePrice * (data.downPaymentPercent / 100);
    const loanAmount = data.homePrice - downPayment;
    
    const monthlyRate = data.interestRate / 100 / 12;
    const numberOfPayments = data.loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const monthlyPropertyTax = (data.homePrice * (data.propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (data.homePrice * (data.maintenance / 100)) / 12;
    const totalMonthlyCost = monthlyPayment + monthlyPropertyTax + data.homeInsurance + monthlyMaintenance + data.hoaFees;

    const initialCashOutlay = downPayment + data.closingCosts;
    const yearlyAppreciation = data.homePrice * (data.homeAppreciation / 100);

    // 5-year calculations
    const totalCost5Years = totalMonthlyCost * 60 + initialCashOutlay;
    const homeValue5Years = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, 5);
    const remainingBalance5Years = this.calculateRemainingBalance(loanAmount, monthlyRate, numberOfPayments, 60);
    const equityBuilt5Years = homeValue5Years - remainingBalance5Years;
    const netWorth5Years = equityBuilt5Years - totalCost5Years;

    // 10-year calculations
    const totalCost10Years = totalMonthlyCost * 120 + initialCashOutlay;
    const homeValue10Years = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, 10);
    const remainingBalance10Years = this.calculateRemainingBalance(loanAmount, monthlyRate, numberOfPayments, 120);
    const equityBuilt10Years = homeValue10Years - remainingBalance10Years;
    const netWorth10Years = equityBuilt10Years - totalCost10Years;

    return {
      monthlyPayment,
      totalMonthlyCost,
      downPayment,
      closingCosts: data.closingCosts,
      initialCashOutlay,
      yearlyAppreciation,
      equityBuilt: equityBuilt5Years,
      totalCost5Years,
      totalCost10Years,
      netWorth5Years,
      netWorth10Years
    };
  }

  private calculateRenting(data: any): RentingAnalysis {
    const totalMonthlyCost = data.monthlyRent + data.rentersInsurance;
    const initialDeposit = data.securityDeposit;

    // 5-year calculations with rent increases
    let totalCost5Years = initialDeposit;
    let currentRent = data.monthlyRent;
    for (let year = 0; year < 5; year++) {
      totalCost5Years += (currentRent + data.rentersInsurance) * 12;
      currentRent *= (1 + data.rentIncrease / 100);
    }

    // 10-year calculations
    let totalCost10Years = initialDeposit;
    currentRent = data.monthlyRent;
    for (let year = 0; year < 10; year++) {
      totalCost10Years += (currentRent + data.rentersInsurance) * 12;
      currentRent *= (1 + data.rentIncrease / 100);
    }

    // Investment growth assuming investing the down payment difference
    const investmentPrincipal = data.homePrice * (data.downPaymentPercent / 100) + data.closingCosts;
    const investmentGrowth5Years = investmentPrincipal * Math.pow(1 + data.investmentReturn / 100, 5);
    const investmentGrowth10Years = investmentPrincipal * Math.pow(1 + data.investmentReturn / 100, 10);

    const netWorth5Years = investmentGrowth5Years - totalCost5Years;
    const netWorth10Years = investmentGrowth10Years - totalCost10Years;

    return {
      monthlyRent: data.monthlyRent,
      totalMonthlyCost,
      initialDeposit,
      yearlyRentIncrease: data.rentIncrease,
      totalCost5Years,
      totalCost10Years,
      investmentGrowth5Years,
      investmentGrowth10Years,
      netWorth5Years,
      netWorth10Years
    };
  }

  private compareOptions(buying: BuyingAnalysis, renting: RentingAnalysis): ComparisonAnalysis {
    const monthlyDifference = buying.totalMonthlyCost - renting.totalMonthlyCost;
    const cashOutlayDifference = buying.initialCashOutlay - renting.initialDeposit;
    
    const fiveYearSavings = buying.netWorth5Years - renting.netWorth5Years;
    const tenYearSavings = buying.netWorth10Years - renting.netWorth10Years;
    
    const fiveYearAdvantage = fiveYearSavings > 1000 ? 'buy' : fiveYearSavings < -1000 ? 'rent' : 'neutral';
    const tenYearAdvantage = tenYearSavings > 1000 ? 'buy' : tenYearSavings < -1000 ? 'rent' : 'neutral';

    return {
      monthlyDifference,
      cashOutlayDifference,
      fiveYearAdvantage,
      tenYearAdvantage,
      fiveYearSavings,
      tenYearSavings
    };
  }

  private calculateBreakEven(buying: BuyingAnalysis, renting: RentingAnalysis, data: any): number {
    // Simplified break-even calculation based on when net worth crosses over
    for (let year = 1; year <= 20; year++) {
      const buyingNetWorth = this.calculateNetWorthAtYear(buying, data, year);
      const rentingNetWorth = this.calculateRentingNetWorthAtYear(renting, data, year);
      
      if (buyingNetWorth > rentingNetWorth) {
        return year;
      }
    }
    return 20; // Max 20 years
  }

  private generateRecommendation(
    buying: BuyingAnalysis, 
    renting: RentingAnalysis, 
    comparison: ComparisonAnalysis
  ): RecommendationResult {
    let decision: 'buy' | 'rent' | 'neutral';
    let confidence: number;
    let primaryReason: string;
    const considerations: string[] = [];

    // Decision logic based on 5-year and 10-year advantages
    if (comparison.fiveYearAdvantage === 'buy' && comparison.tenYearAdvantage === 'buy') {
      decision = 'buy';
      confidence = 85;
      primaryReason = `Buying provides significant financial advantages in both 5 and 10-year scenarios, with potential savings of $${Math.abs(comparison.tenYearSavings).toLocaleString()} over 10 years.`;
    } else if (comparison.fiveYearAdvantage === 'rent' && comparison.tenYearAdvantage === 'rent') {
      decision = 'rent';
      confidence = 85;
      primaryReason = `Renting is more cost-effective in both short and long-term scenarios, potentially saving $${Math.abs(comparison.tenYearSavings).toLocaleString()} over 10 years.`;
    } else if (comparison.tenYearAdvantage === 'buy' && Math.abs(comparison.tenYearSavings) > 50000) {
      decision = 'buy';
      confidence = 70;
      primaryReason = `While renting may be cheaper initially, buying becomes significantly more advantageous over the long term.`;
    } else if (comparison.fiveYearAdvantage === 'rent' && comparison.monthlyDifference > 500) {
      decision = 'rent';
      confidence = 75;
      primaryReason = `Renting provides immediate monthly savings of $${Math.abs(comparison.monthlyDifference).toLocaleString()} and short-term financial flexibility.`;
    } else {
      decision = 'neutral';
      confidence = 60;
      primaryReason = `Both options have similar financial outcomes. Your personal circumstances and preferences should guide the decision.`;
    }

    // Add considerations
    if (comparison.monthlyDifference > 300) {
      considerations.push(`Buying requires $${Math.abs(comparison.monthlyDifference).toLocaleString()} more per month`);
    }
    if (buying.initialCashOutlay > 50000) {
      considerations.push(`Significant upfront investment required: $${buying.initialCashOutlay.toLocaleString()}`);
    }
    if (comparison.tenYearAdvantage === 'buy') {
      considerations.push('Long-term wealth building potential through home equity');
    }
    if (comparison.fiveYearAdvantage === 'rent') {
      considerations.push('Greater flexibility and lower maintenance responsibilities with renting');
    }

    return {
      decision,
      confidence,
      primaryReason,
      considerations
    };
  }

  private generateYearlyComparison(data: any, buying: BuyingAnalysis, renting: RentingAnalysis): YearlyData[] {
    const yearlyData: YearlyData[] = [];

    for (let year = 1; year <= 10; year++) {
      const buyingNetWorth = this.calculateNetWorthAtYear(buying, data, year);
      const rentingNetWorth = this.calculateRentingNetWorthAtYear(renting, data, year);

      yearlyData.push({
        year,
        buyingCumulativeCost: buying.totalMonthlyCost * 12 * year + buying.initialCashOutlay,
        rentingCumulativeCost: renting.totalMonthlyCost * 12 * year + renting.initialDeposit,
        buyingNetWorth,
        rentingNetWorth
      });
    }

    return yearlyData;
  }

  private calculateNetWorthAtYear(buying: BuyingAnalysis, data: any, year: number): number {
    const homeValue = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, year);
    const totalCost = buying.totalMonthlyCost * 12 * year + buying.initialCashOutlay;
    return homeValue - totalCost;
  }

  private calculateRentingNetWorthAtYear(renting: RentingAnalysis, data: any, year: number): number {
    const investmentGrowth = (data.homePrice * (data.downPaymentPercent / 100) + data.closingCosts) * 
                            Math.pow(1 + data.investmentReturn / 100, year);
    const totalCost = renting.totalMonthlyCost * 12 * year + renting.initialDeposit;
    return investmentGrowth - totalCost;
  }

  private calculateRemainingBalance(principal: number, monthlyRate: number, totalPayments: number, paymentsMade: number): number {
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    const remainingPayments = totalPayments - paymentsMade;
    return monthlyPayment * ((Math.pow(1 + monthlyRate, remainingPayments) - 1) / monthlyRate) / 
           Math.pow(1 + monthlyRate, remainingPayments);
  }

  getBarHeight(value: number): number {
    if (!this.result) return 0;
    
    const maxValue = Math.max(
      ...this.result.yearlyComparison.map(d => Math.max(d.buyingNetWorth, d.rentingNetWorth))
    );
    const minValue = Math.min(
      ...this.result.yearlyComparison.map(d => Math.min(d.buyingNetWorth, d.rentingNetWorth))
    );
    
    const range = maxValue - minValue;
    const normalizedValue = (value - minValue) / range;
    return Math.max(5, normalizedValue * 160); // Min 5px, max 160px
  }

  reset() {
    this.calculatorForm.reset({
      homePrice: 400000,
      monthlyRent: 2200,
      downPaymentPercent: 20,
      interestRate: 6.5,
      loanTerm: 30,
      closingCosts: 8000,
      propertyTaxRate: 1.2,
      homeInsurance: 200,
      maintenance: 1.5,
      hoaFees: 0,
      homeAppreciation: 3.0,
      rentIncrease: 3.0,
      investmentReturn: 7.0,
      inflationRate: 2.5,
      securityDeposit: 2200,
      rentersInsurance: 25
    });
    this.result = null;
  }

  saveCalculation() {
    if (this.result) {
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`rent-vs-buy-calc-${Date.now()}`, JSON.stringify(calculationData));
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
      link.download = `rent-vs-buy-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      const decision = this.result.recommendation.decision === 'buy' ? 'buying' : 
                      this.result.recommendation.decision === 'rent' ? 'renting' : 'both options are similar';
      
      navigator.share({
        title: 'Rent vs Buy Analysis Results',
        text: `My rent vs buy analysis recommends ${decision}. ${this.result.recommendation.primaryReason}`,
        url: window.location.href
      }).catch(console.error);
    }
  }
}