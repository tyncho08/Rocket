import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { MarketTrendsService, MarketTrendData } from '../services/market-trends.service';

export interface PropertyPriceHistory {
  address: string;
  propertyId: number;
  currentPrice: number;
  priceHistory: PriceHistoryPoint[];
  comparables: ComparableProperty[];
  marketStats: PropertyMarketStats;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  pricePerSqFt: number;
  eventType: 'sale' | 'listing' | 'price_change' | 'appraisal';
  notes?: string;
}

export interface ComparableProperty {
  address: string;
  price: number;
  pricePerSqFt: number;
  distance: number;
  similarity: number;
  daysOnMarket: number;
}

export interface PropertyMarketStats {
  averageDaysOnMarket: number;
  priceAppreciation1Year: number;
  priceAppreciation5Year: number;
  neighborhoodAppreciation: number;
  marketVolatility: number;
  investmentGrade: 'A' | 'B' | 'C' | 'D';
}

@Component({
  selector: 'app-price-history-charts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="price-history-container">
      <div class="charts-header">
        <h1>📈 Property Price History & Analysis</h1>
        <p>Detailed price trends and market analysis for properties</p>
        <div class="header-actions">
          <a routerLink="/market-trends" class="btn btn-secondary">← Market Dashboard</a>
          <a routerLink="/search" class="btn btn-secondary">Property Search</a>
        </div>
      </div>

      <!-- Property Search/Selection -->
      <div class="property-selector">
        <form [formGroup]="searchForm">
          <div class="form-row">
            <div class="form-group">
              <label for="propertySearch">Search Property Address:</label>
              <input 
                id="propertySearch"
                type="text"
                formControlName="propertySearch"
                placeholder="Enter property address..."
                class="form-input"
                (input)="onSearchInput()"
              />
              <div class="search-suggestions" *ngIf="searchSuggestions.length > 0">
                <div 
                  *ngFor="let suggestion of searchSuggestions"
                  class="suggestion-item"
                  (click)="selectProperty(suggestion)"
                >
                  {{ suggestion.address }}
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="timeRange">Time Range:</label>
              <select id="timeRange" formControlName="timeRange" class="form-input" (change)="onTimeRangeChange()">
                <option value="1">Last Year</option>
                <option value="2">Last 2 Years</option>
                <option value="5">Last 5 Years</option>
                <option value="10">Last 10 Years</option>
                <option value="all">All Available</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="chartType">Chart Type:</label>
              <select id="chartType" formControlName="chartType" class="form-input" (change)="onChartTypeChange()">
                <option value="line">Line Chart</option>
                <option value="candlestick">Price Range</option>
                <option value="comparison">Compare with Market</option>
                <option value="appreciation">Appreciation Rate</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div class="charts-content" *ngIf="!loading && selectedProperty; else loadingTemplate">
        <!-- Property Overview -->
        <div class="property-overview">
          <div class="property-info">
            <h2>{{ selectedProperty.address }}</h2>
            <div class="current-metrics">
              <div class="metric">
                <span class="metric-label">Current Value:</span>
                <span class="metric-value highlight">\${{ selectedProperty.currentPrice | number:'1.0-0' }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">1-Year Change:</span>
                <span class="metric-value" [class]="selectedProperty.marketStats.priceAppreciation1Year > 0 ? 'positive' : 'negative'">
                  {{ selectedProperty.marketStats.priceAppreciation1Year > 0 ? '+' : '' }}{{ selectedProperty.marketStats.priceAppreciation1Year | number:'1.1-1' }}%
                </span>
              </div>
              <div class="metric">
                <span class="metric-label">5-Year Change:</span>
                <span class="metric-value" [class]="selectedProperty.marketStats.priceAppreciation5Year > 0 ? 'positive' : 'negative'">
                  {{ selectedProperty.marketStats.priceAppreciation5Year > 0 ? '+' : '' }}{{ selectedProperty.marketStats.priceAppreciation5Year | number:'1.1-1' }}%
                </span>
              </div>
              <div class="metric">
                <span class="metric-label">Investment Grade:</span>
                <span class="metric-value grade" [class]="'grade-' + selectedProperty.marketStats.investmentGrade.toLowerCase()">
                  {{ selectedProperty.marketStats.investmentGrade }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Price Chart -->
        <div class="main-chart-section">
          <h3>📊 Price History Chart</h3>
          <div class="chart-container">
            <div class="chart-wrapper" [ngSwitch]="currentChartType">
              <!-- Line Chart -->
              <div *ngSwitchCase="'line'" class="line-chart">
                <div class="chart-area">
                  <div class="price-grid">
                    <div class="grid-lines">
                      <div class="grid-line" *ngFor="let line of getGridLines()" [style.bottom.%]="line"></div>
                    </div>
                    
                    <!-- Price Points -->
                    <div 
                      *ngFor="let point of getDisplayHistory(); let i = index"
                      class="price-point"
                      [style.left.%]="(i / (getDisplayHistory().length - 1)) * 100"
                      [style.bottom.%]="getPricePointHeight(point)"
                      [title]="getPointTooltip(point)"
                      [class]="'event-' + point.eventType"
                    >
                      <div class="point-dot"></div>
                      <div class="point-label" *ngIf="shouldShowLabel(i)">
                        \${{ (point.price / 1000).toFixed(0) }}K
                      </div>
                    </div>
                    
                    <!-- Connecting Line -->
                    <svg class="price-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline 
                        [attr.points]="getPriceLinePoints()"
                        fill="none"
                        stroke="#667eea"
                        stroke-width="0.8"
                      />
                    </svg>
                  </div>
                  
                  <!-- Y-Axis Labels -->
                  <div class="y-axis-labels">
                    <div 
                      *ngFor="let label of getPriceLabels()"
                      class="y-label"
                      [style.bottom.%]="label.position"
                    >
                      \${{ label.value }}
                    </div>
                  </div>
                  
                  <!-- X-Axis Labels -->
                  <div class="x-axis-labels">
                    <div 
                      *ngFor="let point of getDisplayHistory(); let i = index"
                      class="x-label"
                      [style.left.%]="(i / (getDisplayHistory().length - 1)) * 100"
                    >
                      <span *ngIf="shouldShowDateLabel(i)">
                        {{ formatDate(point.date) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Comparison Chart -->
              <div *ngSwitchCase="'comparison'" class="comparison-chart">
                <div class="comparison-legend">
                  <div class="legend-item">
                    <div class="legend-color property"></div>
                    <span>Property Price</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color market"></div>
                    <span>Market Average</span>
                  </div>
                </div>
                
                <div class="chart-area">
                  <!-- Property Line -->
                  <svg class="comparison-line property-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                      [attr.points]="getPriceLinePoints()"
                      fill="none"
                      stroke="#667eea"
                      stroke-width="1"
                    />
                  </svg>
                  
                  <!-- Market Line -->
                  <svg class="comparison-line market-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                      [attr.points]="getMarketComparisonPoints()"
                      fill="none"
                      stroke="#e74c3c"
                      stroke-width="1"
                      stroke-dasharray="3,3"
                    />
                  </svg>
                </div>
              </div>
              
              <!-- Appreciation Chart -->
              <div *ngSwitchCase="'appreciation'" class="appreciation-chart">
                <div class="appreciation-metrics">
                  <div class="appreciation-card">
                    <div class="card-title">Annual Appreciation</div>
                    <div class="card-value">{{ calculateAnnualAppreciation() | number:'1.2-2' }}%</div>
                  </div>
                  <div class="appreciation-card">
                    <div class="card-title">Total Return</div>
                    <div class="card-value">{{ calculateTotalReturn() | number:'1.1-1' }}%</div>
                  </div>
                  <div class="appreciation-card">
                    <div class="card-title">vs. Market</div>
                    <div class="card-value" [class]="getMarketPerformanceClass()">
                      {{ calculateMarketOutperformance() | number:'1.1-1' }}%
                    </div>
                  </div>
                </div>
                
                <div class="appreciation-bars">
                  <div 
                    *ngFor="let year of getAnnualPerformance()"
                    class="appreciation-bar"
                    [style.height.%]="getBarHeight(year.appreciation)"
                    [title]="year.year + ': ' + year.appreciation.toFixed(1) + '%'"
                    [class]="year.appreciation > 0 ? 'positive' : 'negative'"
                  >
                    <div class="bar-value">{{ year.appreciation | number:'1.0-0' }}%</div>
                    <div class="bar-year">{{ year.year }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparable Properties -->
        <div class="comparables-section" *ngIf="selectedProperty.comparables.length > 0">
          <h3>🏘️ Comparable Properties</h3>
          <div class="comparables-grid">
            <div 
              *ngFor="let comp of selectedProperty.comparables"
              class="comparable-card"
            >
              <div class="comparable-header">
                <h4>{{ comp.address }}</h4>
                <div class="similarity-score">{{ comp.similarity * 100 | number:'1.0-0' }}% similar</div>
              </div>
              
              <div class="comparable-metrics">
                <div class="metric-row">
                  <span class="metric-label">Price:</span>
                  <span class="metric-value">\${{ comp.price | number:'1.0-0' }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Price/sq ft:</span>
                  <span class="metric-value">\${{ comp.pricePerSqFt | number:'1.0-0' }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Distance:</span>
                  <span class="metric-value">{{ comp.distance | number:'1.1-1' }} miles</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Days on Market:</span>
                  <span class="metric-value">{{ comp.daysOnMarket }}</span>
                </div>
              </div>
              
              <div class="price-difference" [class]="comp.price > selectedProperty.currentPrice ? 'higher' : 'lower'">
                {{ comp.price > selectedProperty.currentPrice ? '+' : '' }}{{ ((comp.price - selectedProperty.currentPrice) / selectedProperty.currentPrice * 100) | number:'1.1-1' }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Market Statistics -->
        <div class="market-stats-section">
          <h3>📊 Market Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-value">{{ selectedProperty.marketStats.averageDaysOnMarket }}</div>
              <div class="stat-label">Avg Days on Market</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🏘️</div>
              <div class="stat-value">{{ selectedProperty.marketStats.neighborhoodAppreciation | number:'1.1-1' }}%</div>
              <div class="stat-label">Neighborhood Growth</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-value">{{ selectedProperty.marketStats.marketVolatility | number:'1.1-1' }}</div>
              <div class="stat-label">Market Volatility</div>
            </div>
            
            <div class="stat-card grade" [class]="'grade-' + selectedProperty.marketStats.investmentGrade.toLowerCase()">
              <div class="stat-icon">🏆</div>
              <div class="stat-value">{{ selectedProperty.marketStats.investmentGrade }}</div>
              <div class="stat-label">Investment Grade</div>
            </div>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="chart-actions">
          <button (click)="exportChartData()" class="btn btn-primary">📊 Export Chart Data</button>
          <button (click)="generatePriceReport()" class="btn btn-secondary">📄 Generate Report</button>
          <button (click)="shareChart()" class="btn btn-outline">📤 Share Chart</button>
          <button (click)="addToComparison()" class="btn btn-outline">➕ Add to Comparison</button>
        </div>
      </div>

      <!-- Loading/Empty States -->
      <ng-template #loadingTemplate>
        <div class="loading-container" *ngIf="loading">
          <app-loading-spinner></app-loading-spinner>
          <p>Loading price history data...</p>
        </div>
        
        <div class="empty-state" *ngIf="!loading && !selectedProperty">
          <div class="empty-icon">🏠</div>
          <h3>No Property Selected</h3>
          <p>Search for a property address above to view detailed price history and analysis.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .price-history-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .charts-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .charts-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .charts-header p {
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

    .property-selector {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      align-items: end;
    }

    .form-group {
      position: relative;
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

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e0e6ed;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .suggestion-item {
      padding: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f8f9fa;
    }

    .charts-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .property-overview {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .property-info h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }

    .current-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: 1.3rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .metric-value.highlight {
      color: #667eea;
      font-size: 1.5rem;
    }

    .metric-value.positive {
      color: #28a745;
    }

    .metric-value.negative {
      color: #dc3545;
    }

    .metric-value.grade {
      font-size: 1.8rem;
      text-align: center;
    }

    .grade-a {
      color: #28a745;
    }

    .grade-b {
      color: #17a2b8;
    }

    .grade-c {
      color: #ffc107;
    }

    .grade-d {
      color: #dc3545;
    }

    .main-chart-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .main-chart-section h3 {
      color: #333;
      margin-bottom: 25px;
    }

    .chart-container {
      position: relative;
      height: 400px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .chart-wrapper {
      width: 100%;
      height: 100%;
      padding: 20px;
    }

    .line-chart {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .chart-area {
      position: relative;
      width: 100%;
      height: calc(100% - 40px);
      margin-bottom: 20px;
    }

    .price-grid {
      position: relative;
      width: calc(100% - 60px);
      height: 100%;
      margin-left: 60px;
      background: white;
      border: 1px solid #e9ecef;
    }

    .grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0,0,0,0.1);
    }

    .price-point {
      position: absolute;
      transform: translateX(-50%);
      z-index: 3;
    }

    .point-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }

    .price-point.event-sale .point-dot {
      background: #28a745;
      width: 10px;
      height: 10px;
    }

    .price-point.event-listing .point-dot {
      background: #17a2b8;
    }

    .price-point.event-price_change .point-dot {
      background: #ffc107;
    }

    .point-label {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      white-space: nowrap;
    }

    .price-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }

    .y-axis-labels {
      position: absolute;
      top: 0;
      left: 0;
      width: 50px;
      height: 100%;
    }

    .y-label {
      position: absolute;
      right: 10px;
      transform: translateY(-50%);
      font-size: 0.8rem;
      color: #666;
    }

    .x-axis-labels {
      position: relative;
      height: 20px;
      margin-top: 10px;
      margin-left: 60px;
    }

    .x-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
    }

    .comparison-chart {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .comparison-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 20px;
      height: 4px;
      border-radius: 2px;
    }

    .legend-color.property {
      background: #667eea;
    }

    .legend-color.market {
      background: #e74c3c;
    }

    .comparison-line {
      position: absolute;
      top: 0;
      left: 60px;
      width: calc(100% - 60px);
      height: calc(100% - 40px);
      pointer-events: none;
    }

    .appreciation-chart {
      width: 100%;
      height: 100%;
    }

    .appreciation-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .appreciation-card {
      text-align: center;
      padding: 15px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 8px;
    }

    .card-title {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .appreciation-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 200px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px 10px;
    }

    .appreciation-bar {
      width: 40px;
      background: linear-gradient(to top, #667eea, #764ba2);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .appreciation-bar.negative {
      background: linear-gradient(to top, #e74c3c, #c0392b);
    }

    .appreciation-bar:hover {
      opacity: 0.8;
    }

    .bar-value {
      margin-bottom: 5px;
    }

    .bar-year {
      position: absolute;
      bottom: -20px;
      color: #666;
      font-size: 0.8rem;
    }

    .comparables-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .comparables-section h3 {
      color: #333;
      margin-bottom: 25px;
    }

    .comparables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .comparable-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      background: #f8f9fa;
      transition: border-color 0.3s ease;
    }

    .comparable-card:hover {
      border-color: #667eea;
    }

    .comparable-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .comparable-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .similarity-score {
      font-size: 0.8rem;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: bold;
    }

    .comparable-metrics {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-row .metric-label {
      font-size: 0.9rem;
      color: #666;
    }

    .metric-row .metric-value {
      font-weight: 600;
      color: #2c3e50;
    }

    .price-difference {
      text-align: center;
      padding: 8px;
      border-radius: 6px;
      font-weight: bold;
    }

    .price-difference.higher {
      background: #f8d7da;
      color: #721c24;
    }

    .price-difference.lower {
      background: #d4edda;
      color: #155724;
    }

    .market-stats-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .market-stats-section h3 {
      color: #333;
      margin-bottom: 25px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card.grade {
      border: 3px solid;
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .chart-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
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

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
    }

    .loading-container {
      color: white;
    }

    .empty-state {
      background: white;
      border-radius: 15px;
      margin: 30px auto;
      max-width: 500px;
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
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .price-history-container {
        padding: 10px;
      }

      .charts-header h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        align-items: center;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .current-metrics {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .comparables-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .chart-actions {
        flex-direction: column;
        align-items: center;
      }

      .appreciation-metrics {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PriceHistoryChartsComponent implements OnInit, OnDestroy {
  @Input() propertyId?: number;

  searchForm: FormGroup;
  selectedProperty: PropertyPriceHistory | null = null;
  searchSuggestions: any[] = [];
  loading = false;
  currentChartType = 'line';
  marketTrendData: MarketTrendData[] = [];

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private marketTrendsService: MarketTrendsService
  ) {
    this.searchForm = this.fb.group({
      propertySearch: [''],
      timeRange: ['5'],
      chartType: ['line']
    });
  }

  ngOnInit() {
    this.setupFormSubscriptions();
    this.loadMarketData();
    
    // If propertyId is provided, load that property directly
    if (this.propertyId) {
      this.loadPropertyById(this.propertyId);
    } else {
      // Load default property for demo
      this.loadDefaultProperty();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setupFormSubscriptions() {
    this.subscription.add(
      this.searchForm.get('chartType')?.valueChanges.subscribe(value => {
        this.currentChartType = value;
      })
    );
  }

  private loadMarketData() {
    this.subscription.add(
      this.marketTrendsService.getMarketTrends('National', 60).subscribe({
        next: (data) => this.marketTrendData = data,
        error: (error) => console.error('Error loading market data:', error)
      })
    );
  }

  private loadDefaultProperty() {
    // Load a sample property for demonstration
    this.selectedProperty = this.generateSampleProperty();
  }

  private loadPropertyById(id: number) {
    this.loading = true;
    // In a real app, this would fetch from API
    setTimeout(() => {
      this.selectedProperty = this.generateSampleProperty();
      this.loading = false;
    }, 1000);
  }

  onSearchInput() {
    const query = this.searchForm.get('propertySearch')?.value;
    if (query && query.length > 2) {
      this.searchSuggestions = this.generateSearchSuggestions(query);
    } else {
      this.searchSuggestions = [];
    }
  }

  selectProperty(property: any) {
    this.searchForm.patchValue({ propertySearch: property.address });
    this.searchSuggestions = [];
    this.loadPropertyData(property);
  }

  onTimeRangeChange() {
    if (this.selectedProperty) {
      this.updatePropertyData();
    }
  }

  onChartTypeChange() {
    this.currentChartType = this.searchForm.get('chartType')?.value;
  }

  private loadPropertyData(property: any) {
    this.loading = true;
    setTimeout(() => {
      this.selectedProperty = this.generateSampleProperty(property.address);
      this.loading = false;
    }, 800);
  }

  private updatePropertyData() {
    if (this.selectedProperty) {
      const timeRange = this.searchForm.get('timeRange')?.value;
      // Update price history based on time range
      this.selectedProperty.priceHistory = this.generatePriceHistory(timeRange);
    }
  }

  private generateSearchSuggestions(query: string): any[] {
    const suggestions = [
      { address: '123 Main Street, Austin TX 78701', propertyId: 1 },
      { address: '456 Oak Avenue, Austin TX 78702', propertyId: 2 },
      { address: '789 Pine Drive, Austin TX 78703', propertyId: 3 },
      { address: '321 Elm Street, Austin TX 78704', propertyId: 4 },
      { address: '654 Maple Lane, Austin TX 78705', propertyId: 5 }
    ];

    return suggestions.filter(s => 
      s.address.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private generateSampleProperty(address?: string): PropertyPriceHistory {
    const baseAddress = address || '123 Main Street, Austin TX 78701';
    const currentPrice = 450000 + Math.random() * 200000;
    const timeRange = this.searchForm.get('timeRange')?.value || '5';
    
    return {
      address: baseAddress,
      propertyId: 1,
      currentPrice: Math.round(currentPrice),
      priceHistory: this.generatePriceHistory(timeRange),
      comparables: this.generateComparables(currentPrice),
      marketStats: this.generateMarketStats()
    };
  }

  private generatePriceHistory(timeRange: string): PriceHistoryPoint[] {
    const history: PriceHistoryPoint[] = [];
    const years = timeRange === 'all' ? 10 : parseInt(timeRange);
    const currentPrice = 450000;
    const events = ['sale', 'listing', 'price_change', 'appraisal'] as const;
    
    // Generate initial sale
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);
    const initialPrice = currentPrice * (0.7 + Math.random() * 0.3);
    
    history.push({
      date: startDate.toISOString().split('T')[0],
      price: Math.round(initialPrice),
      pricePerSqFt: Math.round(initialPrice / 2000),
      eventType: 'sale',
      notes: 'Initial purchase'
    });

    // Generate appreciation over time
    const monthsTotal = years * 12;
    const monthlyAppreciation = Math.pow(currentPrice / initialPrice, 1/monthsTotal) - 1;
    
    for (let i = 3; i < monthsTotal; i += 3) { // Every 3 months
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const expectedPrice = initialPrice * Math.pow(1 + monthlyAppreciation, i);
      const volatility = 0.05; // 5% volatility
      const actualPrice = expectedPrice * (1 + (Math.random() - 0.5) * volatility);
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(actualPrice),
        pricePerSqFt: Math.round(actualPrice / 2000),
        eventType: events[Math.floor(Math.random() * events.length)],
        notes: i % 12 === 0 ? 'Annual appraisal' : undefined
      });
    }

    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private generateComparables(basePrice: number): ComparableProperty[] {
    const comparables: ComparableProperty[] = [];
    const addresses = [
      '456 Oak Avenue, Austin TX 78702',
      '789 Pine Drive, Austin TX 78703',  
      '321 Elm Street, Austin TX 78704',
      '654 Maple Lane, Austin TX 78705'
    ];

    for (let i = 0; i < 4; i++) {
      const priceVariation = 0.8 + Math.random() * 0.4; // ±20% variation
      const price = Math.round(basePrice * priceVariation);
      
      comparables.push({
        address: addresses[i],
        price,
        pricePerSqFt: Math.round(price / (1800 + Math.random() * 400)),
        distance: 0.2 + Math.random() * 2,
        similarity: 0.75 + Math.random() * 0.2,
        daysOnMarket: Math.floor(20 + Math.random() * 60)
      });
    }

    return comparables;
  }

  private generateMarketStats(): PropertyMarketStats {
    return {
      averageDaysOnMarket: Math.floor(30 + Math.random() * 40),
      priceAppreciation1Year: 5 + Math.random() * 15,
      priceAppreciation5Year: 45 + Math.random() * 30,
      neighborhoodAppreciation: 6 + Math.random() * 8,
      marketVolatility: 10 + Math.random() * 20,
      investmentGrade: (['A', 'B', 'C', 'D'] as const)[Math.floor(Math.random() * 4)]
    };
  }

  // Chart calculation methods
  getDisplayHistory(): PriceHistoryPoint[] {
    if (!this.selectedProperty) return [];
    return this.selectedProperty.priceHistory;
  }

  getGridLines(): number[] {
    return [0, 20, 40, 60, 80, 100];
  }

  getPricePointHeight(point: PriceHistoryPoint): number {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length === 0) return 0;
    
    const prices = this.selectedProperty.priceHistory.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (max === min) return 50;
    
    return ((point.price - min) / (max - min)) * 80 + 10;
  }

  getPriceLinePoints(): string {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length === 0) return '';
    
    return this.selectedProperty.priceHistory.map((point, index) => {
      const x = (index / (this.selectedProperty!.priceHistory.length - 1)) * 100;
      const y = 100 - this.getPricePointHeight(point);
      return `${x},${y}`;
    }).join(' ');
  }

  getMarketComparisonPoints(): string {
    if (this.marketTrendData.length === 0) return '';
    
    return this.marketTrendData.map((point, index) => {
      const x = (index / (this.marketTrendData.length - 1)) * 100;
      // Normalize market data to chart space
      const y = 50 + (Math.sin(index * 0.1) * 20); // Sample wave pattern
      return `${x},${y}`;
    }).join(' ');
  }

  getPriceLabels(): { value: string, position: number }[] {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length === 0) return [];
    
    const prices = this.selectedProperty.priceHistory.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + ((max - min) * i / 4);
      labels.push({
        value: (value / 1000).toFixed(0) + 'K',
        position: (i / 4) * 80 + 10
      });
    }
    
    return labels;
  }

  getPointTooltip(point: PriceHistoryPoint): string {
    return `${this.formatDate(point.date)}: $${point.price.toLocaleString()} (${point.eventType})`;
  }

  shouldShowLabel(index: number): boolean {
    if (!this.selectedProperty) return false;
    return index % Math.max(1, Math.floor(this.selectedProperty.priceHistory.length / 6)) === 0;
  }

  shouldShowDateLabel(index: number): boolean {
    if (!this.selectedProperty) return false;
    return index % Math.max(1, Math.floor(this.selectedProperty.priceHistory.length / 8)) === 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  // Appreciation calculations
  calculateAnnualAppreciation(): number {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length < 2) return 0;
    
    const history = this.selectedProperty.priceHistory;
    const firstPrice = history[0].price;
    const lastPrice = history[history.length - 1].price;
    const years = (new Date(history[history.length - 1].date).getTime() - 
                  new Date(history[0].date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return (Math.pow(lastPrice / firstPrice, 1/years) - 1) * 100;
  }

  calculateTotalReturn(): number {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length < 2) return 0;
    
    const history = this.selectedProperty.priceHistory;
    const firstPrice = history[0].price;
    const lastPrice = history[history.length - 1].price;
    
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }

  calculateMarketOutperformance(): number {
    // Compare property performance vs market average
    const propertyReturn = this.calculateAnnualAppreciation();
    const marketReturn = 6.5; // Assume 6.5% market average
    
    return propertyReturn - marketReturn;
  }

  getMarketPerformanceClass(): string {
    const outperformance = this.calculateMarketOutperformance();
    return outperformance > 0 ? 'positive' : 'negative';
  }

  getAnnualPerformance(): { year: string, appreciation: number }[] {
    if (!this.selectedProperty || this.selectedProperty.priceHistory.length < 2) return [];
    
    const performance = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const appreciation = 5 + (Math.random() - 0.5) * 10; // Mock data
      performance.unshift({
        year: year.toString(),
        appreciation
      });
    }
    
    return performance;
  }

  getBarHeight(appreciation: number): number {
    const maxAbs = 15; // Max expected appreciation
    return (Math.abs(appreciation) / maxAbs) * 100;
  }

  // Action methods
  exportChartData() {
    if (!this.selectedProperty) return;
    
    const exportData = {
      property: this.selectedProperty,
      chartType: this.currentChartType,
      timeRange: this.searchForm.get('timeRange')?.value,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price-history-${this.selectedProperty.address.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  generatePriceReport() {
    if (!this.selectedProperty) return;
    
    const reportData = {
      property: this.selectedProperty,
      analysis: {
        annualAppreciation: this.calculateAnnualAppreciation(),
        totalReturn: this.calculateTotalReturn(),
        marketOutperformance: this.calculateMarketOutperformance()
      }
    };
    
    console.log('Generating price report:', reportData);
    // In a real app, would generate PDF report
  }

  shareChart() {
    if (!this.selectedProperty || !navigator.share) return;
    
    navigator.share({
      title: `Price History - ${this.selectedProperty.address}`,
      text: `Property appreciation: ${this.calculateAnnualAppreciation().toFixed(1)}% annually`,
      url: window.location.href
    }).catch(console.error);
  }

  addToComparison() {
    if (!this.selectedProperty) return;
    
    console.log('Adding property to comparison:', this.selectedProperty.address);
    // In a real app, would add to comparison service
  }
}