import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComparisonService, PropertyComparison, ComparisonExport } from '../services/comparison.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-property-comparison',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="comparison-container">
      <div class="comparison-header">
        <h1>🏠 Property Comparison</h1>
        <p>Compare up to 4 properties side by side</p>
        <div class="header-actions">
          <a routerLink="/search" class="btn btn-secondary">← Back to Search</a>
          <button 
            *ngIf="comparisons.length > 0" 
            (click)="clearAll()" 
            class="btn btn-outline"
          >
            Clear All
          </button>
          <button 
            *ngIf="comparisons.length > 1" 
            (click)="showExportModal = true" 
            class="btn btn-primary"
          >
            📊 Export Comparison
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="comparisons.length === 0" class="empty-state">
        <div class="empty-icon">🏡</div>
        <h3>No Properties to Compare</h3>
        <p>Start by searching for properties and adding them to your comparison list.</p>
        <a routerLink="/search" class="btn btn-primary">Start Property Search</a>
      </div>

      <!-- Comparison Table -->
      <div *ngIf="comparisons.length > 0" class="comparison-content">
        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            (click)="activeView = 'overview'"
            [class.active]="activeView === 'overview'"
            class="toggle-btn"
          >
            Overview
          </button>
          <button 
            (click)="activeView = 'financial'"
            [class.active]="activeView === 'financial'"
            class="toggle-btn"
          >
            Financial
          </button>
          <button 
            (click)="activeView = 'investment'"
            [class.active]="activeView === 'investment'"
            class="toggle-btn"
          >
            Investment
          </button>
          <button 
            (click)="activeView = 'market'"
            [class.active]="activeView === 'market'"
            class="toggle-btn"
          >
            Market Data
          </button>
        </div>

        <!-- Comparison Grid -->
        <div class="comparison-grid">
          <!-- Row Labels -->
          <div class="row-labels">
            <div class="label-header">Property Details</div>
            <ng-container *ngIf="activeView === 'overview'">
              <div class="row-label" *ngFor="let label of overviewLabels">
                {{ label.label }}
              </div>
            </ng-container>
            <ng-container *ngIf="activeView === 'financial'">
              <div class="row-label" *ngFor="let label of financialLabels">
                {{ label.label }}
              </div>
            </ng-container>
            <ng-container *ngIf="activeView === 'investment'">
              <div class="row-label" *ngFor="let label of investmentLabels">
                {{ label.label }}
              </div>
            </ng-container>
            <ng-container *ngIf="activeView === 'market'">
              <div class="row-label" *ngFor="let label of marketLabels">
                {{ label.label }}
              </div>
            </ng-container>
          </div>

          <!-- Property Columns -->
          <div 
            *ngFor="let comparison of comparisons; let i = index"
            class="property-column"
            [class.winner]="isWinner(comparison, i)"
          >
            <!-- Property Header -->
            <div class="property-header">
              <img 
                [src]="comparison.property.imageUrl" 
                [alt]="comparison.property.address"
                class="property-image"
                (error)="onImageError($event)"
              />
              <div class="property-info">
                <h3 class="property-address">{{ comparison.property.address }}</h3>
                <p class="property-price">\${{ comparison.property.price | number:'1.0-0' }}</p>
                <button 
                  (click)="removeProperty(comparison.property.id)"
                  class="remove-btn"
                  title="Remove from comparison"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Property Data -->
            <div class="property-data">
              <!-- Overview Data -->
              <div *ngIf="activeView === 'overview'" class="data-values">
                <div class="data-value">{{ comparison.property.bedrooms }}</div>
                <div class="data-value">{{ comparison.property.bathrooms }}</div>
                <div class="data-value">{{ comparison.property.squareFeet | number:'1.0-0' }}</div>
                <div class="data-value">\${{ (comparison.property.price / comparison.property.squareFeet) | number:'1.0-0' }}</div>
                <div class="data-value">{{ comparison.property.yearBuilt || 'N/A' }}</div>
                <div class="data-value">{{ comparison.property.propertyType || 'Single Family' }}</div>
              </div>

              <!-- Financial Data -->
              <div *ngIf="activeView === 'financial'" class="data-values">
                <div class="data-value">\${{ comparison.financials.downPayment | number:'1.0-0' }}</div>
                <div class="data-value">\${{ comparison.financials.loanAmount | number:'1.0-0' }}</div>
                <div class="data-value">{{ comparison.financials.interestRate }}%</div>
                <div class="data-value">\${{ comparison.financials.monthlyPayment | number:'1.0-0' }}</div>
                <div class="data-value">\${{ comparison.financials.totalCost | number:'1.0-0' }}</div>
                <div class="data-value">{{ comparison.financials.loanToValue | number:'1.1-1' }}%</div>
              </div>

              <!-- Investment Data -->
              <div *ngIf="activeView === 'investment' && comparison.investmentAnalysis" class="data-values">
                <div class="data-value">\${{ comparison.investmentAnalysis.estimatedRent | number:'1.0-0' }}</div>
                <div class="data-value" [class.positive]="comparison.investmentAnalysis.monthlyCashFlow > 0" [class.negative]="comparison.investmentAnalysis.monthlyCashFlow < 0">
                  \${{ comparison.investmentAnalysis.monthlyCashFlow | number:'1.0-0' }}
                </div>
                <div class="data-value">{{ comparison.investmentAnalysis.roi | number:'1.1-1' }}%</div>
                <div class="data-value">{{ comparison.investmentAnalysis.capRate | number:'1.1-1' }}%</div>
                <div class="data-value">{{ comparison.investmentAnalysis.paybackPeriod | number:'1.1-1' }} years</div>
                <div class="data-value">{{ comparison.investmentAnalysis.totalReturn | number:'1.1-1' }}%</div>
              </div>

              <!-- Market Data -->
              <div *ngIf="activeView === 'market' && comparison.marketData" class="data-values">
                <div class="data-value">\${{ comparison.marketData.neighborhoodStats.averagePrice | number:'1.0-0' }}</div>
                <div class="data-value">{{ comparison.marketData.neighborhoodStats.daysOnMarket }} days</div>
                <div class="data-value">{{ comparison.marketData.neighborhoodStats.priceGrowth | number:'1.1-1' }}%</div>
                <div class="data-value rating">
                  <span class="stars">{{ getStars(comparison.marketData.neighborhoodStats.schoolRating) }}</span>
                  <span class="rating-value">{{ comparison.marketData.neighborhoodStats.schoolRating }}/10</span>
                </div>
                <div class="data-value">{{ comparison.marketData.neighborhoodStats.walkability }}/10</div>
                <div class="data-value">{{ comparison.marketData.neighborhoodStats.crimeSafety }}/5</div>
              </div>
            </div>

            <!-- Edit Financial Button -->
            <div class="property-actions">
              <button 
                (click)="editFinancials(comparison.property.id)"
                class="btn btn-sm btn-outline"
              >
                ✏️ Edit Terms
              </button>
            </div>
          </div>
        </div>

        <!-- Comparison Insights -->
        <div class="comparison-insights">
          <h3>💡 Insights & Recommendations</h3>
          <div class="insights-grid">
            <div 
              *ngFor="let insight of getInsights()"
              class="insight-card"
              [class]="'insight-' + insight.type"
            >
              <div class="insight-icon">{{ insight.icon }}</div>
              <div class="insight-content">
                <h4>{{ insight.title }}</h4>
                <p>{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Edit Modal -->
      <div *ngIf="showFinancialModal" class="modal-overlay" (click)="closeFinancialModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit Financial Terms</h3>
            <button (click)="closeFinancialModal()" class="modal-close">×</button>
          </div>
          
          <form [formGroup]="financialForm" (ngSubmit)="updateFinancials()">
            <div class="form-grid">
              <div class="form-group">
                <label for="downPayment">Down Payment</label>
                <input 
                  id="downPayment"
                  type="number" 
                  formControlName="downPayment"
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
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="loanTerm">Loan Term (years)</label>
                <select id="loanTerm" formControlName="loanTerm" class="form-input">
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="30">30 years</option>
                </select>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" (click)="closeFinancialModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Update</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Export Modal -->
      <div *ngIf="showExportModal" class="modal-overlay" (click)="closeExportModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Export Comparison</h3>
            <button (click)="closeExportModal()" class="modal-close">×</button>
          </div>
          
          <form [formGroup]="exportForm" (ngSubmit)="exportComparison()">
            <div class="form-group">
              <label>Export Format</label>
              <div class="radio-group">
                <label><input type="radio" formControlName="format" value="pdf"> PDF Report</label>
                <label><input type="radio" formControlName="format" value="excel"> Excel Spreadsheet</label>
                <label><input type="radio" formControlName="format" value="csv"> CSV Data</label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Include Sections</label>
              <div class="checkbox-group">
                <label><input type="checkbox" formControlName="includeFinancials"> Financial Analysis</label>
                <label><input type="checkbox" formControlName="includeInvestment"> Investment Analysis</label>
                <label><input type="checkbox" formControlName="includeMarket"> Market Data</label>
                <label><input type="checkbox" formControlName="includeCharts"> Charts & Graphs</label>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" (click)="closeExportModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">📥 Export</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comparison-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .comparison-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .comparison-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .comparison-header p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 25px;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .btn-primary {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-outline {
      background: transparent;
      color: white;
      border-color: white;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .empty-state {
      text-align: center;
      background: white;
      border-radius: 15px;
      padding: 60px 40px;
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      color: #333;
      margin-bottom: 15px;
    }

    .empty-state p {
      color: #6c757d;
      margin-bottom: 30px;
    }

    .comparison-content {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 1400px;
      margin: 0 auto;
    }

    .view-toggle {
      display: flex;
      gap: 5px;
      margin-bottom: 30px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 5px;
    }

    .toggle-btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      color: #6c757d;
    }

    .toggle-btn.active {
      background: #667eea;
      color: white;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 200px repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .row-labels {
      border-right: 2px solid #e9ecef;
      padding-right: 20px;
    }

    .label-header {
      height: 200px;
      display: flex;
      align-items: flex-end;
      font-weight: bold;
      color: #333;
      padding-bottom: 20px;
    }

    .row-label {
      height: 60px;
      display: flex;
      align-items: center;
      font-weight: 500;
      color: #666;
      border-bottom: 1px solid #f1f3f4;
    }

    .property-column {
      border: 2px solid transparent;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .property-column.winner {
      border-color: #28a745;
      box-shadow: 0 5px 20px rgba(40, 167, 69, 0.2);
    }

    .property-header {
      position: relative;
      height: 200px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .property-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .property-info {
      padding: 10px 15px;
      position: relative;
    }

    .property-address {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
      line-height: 1.2;
    }

    .property-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #28a745;
      margin: 0;
    }

    .remove-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      background: #dc3545;
    }

    .property-data {
      margin-bottom: 20px;
    }

    .data-values {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .data-value {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      border-bottom: 1px solid #f1f3f4;
      text-align: center;
    }

    .data-value.positive {
      color: #28a745;
    }

    .data-value.negative {
      color: #dc3545;
    }

    .data-value.rating {
      flex-direction: column;
      gap: 4px;
    }

    .stars {
      color: #ffc107;
    }

    .rating-value {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .property-actions {
      text-align: center;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    .comparison-insights {
      border-top: 2px solid #e9ecef;
      padding-top: 30px;
    }

    .comparison-insights h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .insight-card {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid;
    }

    .insight-positive {
      background: #d4edda;
      border-color: #28a745;
    }

    .insight-warning {
      background: #fff3cd;
      border-color: #ffc107;
    }

    .insight-info {
      background: #d1ecf1;
      border-color: #17a2b8;
    }

    .insight-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .insight-content h4 {
      margin-bottom: 8px;
      color: #333;
      font-size: 1rem;
    }

    .insight-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e6ed;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .radio-group label, .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
      margin-bottom: 0;
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .comparison-container {
        padding: 10px;
      }

      .comparison-header h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        align-items: center;
      }

      .comparison-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .row-labels {
        display: none;
      }

      .property-column {
        border: 2px solid #e9ecef;
        padding: 15px;
      }

      .view-toggle {
        flex-wrap: wrap;
      }

      .toggle-btn {
        min-width: 120px;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyComparisonComponent implements OnInit, OnDestroy {
  comparisons: PropertyComparison[] = [];
  activeView: 'overview' | 'financial' | 'investment' | 'market' = 'overview';
  
  showFinancialModal = false;
  showExportModal = false;
  selectedPropertyId: number | null = null;

  financialForm!: FormGroup;
  exportForm!: FormGroup;

  overviewLabels = [
    { label: 'Bedrooms', key: 'bedrooms' },
    { label: 'Bathrooms', key: 'bathrooms' },
    { label: 'Square Feet', key: 'sqft' },
    { label: 'Price per Sq Ft', key: 'pricePerSqFt' },
    { label: 'Year Built', key: 'yearBuilt' },
    { label: 'Property Type', key: 'propertyType' }
  ];

  financialLabels = [
    { label: 'Down Payment', key: 'downPayment' },
    { label: 'Loan Amount', key: 'loanAmount' },
    { label: 'Interest Rate', key: 'interestRate' },
    { label: 'Monthly Payment', key: 'monthlyPayment' },
    { label: 'Total Cost', key: 'totalCost' },
    { label: 'Loan-to-Value', key: 'loanToValue' }
  ];

  investmentLabels = [
    { label: 'Est. Monthly Rent', key: 'estimatedRent' },
    { label: 'Monthly Cash Flow', key: 'monthlyCashFlow' },
    { label: 'ROI', key: 'roi' },
    { label: 'Cap Rate', key: 'capRate' },
    { label: 'Payback Period', key: 'paybackPeriod' },
    { label: 'Total Return', key: 'totalReturn' }
  ];

  marketLabels = [
    { label: 'Neighborhood Avg', key: 'averagePrice' },
    { label: 'Days on Market', key: 'daysOnMarket' },
    { label: 'Price Growth', key: 'priceGrowth' },
    { label: 'School Rating', key: 'schoolRating' },
    { label: 'Walkability', key: 'walkability' },
    { label: 'Safety Rating', key: 'crimeSafety' }
  ];

  private subscription = new Subscription();

  constructor(
    private comparisonService: ComparisonService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.subscription.add(
      this.comparisonService.comparisons$.subscribe(
        comparisons => this.comparisons = comparisons
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initializeForms() {
    this.financialForm = this.fb.group({
      downPayment: [0],
      interestRate: [6.5],
      loanTerm: [30]
    });

    this.exportForm = this.fb.group({
      format: ['pdf'],
      includeFinancials: [true],
      includeInvestment: [true],
      includeMarket: [false],
      includeCharts: [true]
    });
  }

  removeProperty(propertyId: number) {
    this.comparisonService.removeFromComparison(propertyId);
    this.notificationService.success('Removed', 'Property removed from comparison');
  }

  clearAll() {
    this.comparisonService.clearComparisons();
    this.notificationService.success('Cleared', 'All properties removed from comparison');
  }

  editFinancials(propertyId: number) {
    this.selectedPropertyId = propertyId;
    const comparison = this.comparisons.find(c => c.property.id === propertyId);
    
    if (comparison) {
      this.financialForm.patchValue({
        downPayment: comparison.financials.downPayment,
        interestRate: comparison.financials.interestRate,
        loanTerm: comparison.financials.loanTerm
      });
      this.showFinancialModal = true;
    }
  }

  updateFinancials() {
    if (this.selectedPropertyId && this.financialForm.valid) {
      const formData = this.financialForm.value;
      this.comparisonService.updateFinancials(this.selectedPropertyId, formData);
      this.closeFinancialModal();
      this.notificationService.success('Updated', 'Financial terms updated');
    }
  }

  closeFinancialModal() {
    this.showFinancialModal = false;
    this.selectedPropertyId = null;
  }

  exportComparison() {
    if (this.exportForm.valid) {
      const exportData: ComparisonExport = this.exportForm.value;
      this.comparisonService.exportComparison(exportData);
      this.closeExportModal();
      this.notificationService.success('Exported', `Comparison exported as ${exportData.format.toUpperCase()}`);
    }
  }

  closeExportModal() {
    this.showExportModal = false;
  }

  isWinner(comparison: PropertyComparison, index: number): boolean {
    // Simple logic to highlight the "best" property based on current view
    if (this.comparisons.length < 2) return false;

    switch (this.activeView) {
      case 'financial':
        const lowestPayment = Math.min(...this.comparisons.map(c => c.financials.monthlyPayment));
        return comparison.financials.monthlyPayment === lowestPayment;
      
      case 'investment':
        if (!comparison.investmentAnalysis) return false;
        const highestROI = Math.max(...this.comparisons.map(c => c.investmentAnalysis?.roi || 0));
        return comparison.investmentAnalysis.roi === highestROI;
      
      default:
        return false;
    }
  }

  getInsights(): any[] {
    if (this.comparisons.length < 2) return [];

    const insights = [];

    // Best value insight
    const bestValue = this.comparisons.reduce((best, current) => {
      const bestRatio = best.property.price / best.property.squareFeet;
      const currentRatio = current.property.price / current.property.squareFeet;
      return currentRatio < bestRatio ? current : best;
    });

    insights.push({
      type: 'positive',
      icon: '💰',
      title: 'Best Value',
      description: `${bestValue.property.address} offers the best price per square foot at $${Math.round(bestValue.property.price / bestValue.property.squareFeet)}/sq ft.`
    });

    // Lowest payment insight
    const lowestPayment = this.comparisons.reduce((lowest, current) => 
      current.financials.monthlyPayment < lowest.financials.monthlyPayment ? current : lowest
    );

    insights.push({
      type: 'info',
      icon: '🏦',
      title: 'Lowest Monthly Payment',
      description: `${lowestPayment.property.address} has the lowest monthly payment at $${Math.round(lowestPayment.financials.monthlyPayment)}.`
    });

    // Investment insight
    const investmentComparisons = this.comparisons.filter(c => c.investmentAnalysis);
    if (investmentComparisons.length > 0) {
      const bestInvestment = investmentComparisons.reduce((best, current) => 
        (current.investmentAnalysis?.roi || 0) > (best.investmentAnalysis?.roi || 0) ? current : best
      );

      if (bestInvestment.investmentAnalysis && bestInvestment.investmentAnalysis.roi > 0) {
        insights.push({
          type: 'positive',
          icon: '📈',
          title: 'Best Investment',
          description: `${bestInvestment.property.address} offers the highest ROI at ${bestInvestment.investmentAnalysis.roi.toFixed(1)}%.`
        });
      }
    }

    return insights;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x200?text=Property+Image';
  }
}