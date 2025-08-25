import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { MarketTrendsService, MarketTrendData, RegionData, InterestRateData, MarketIndicators, MarketInsight } from '../services/market-trends.service';

@Component({
  selector: 'app-market-trends-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="market-dashboard-container">
      <div class="dashboard-header">
        <h1>📈 Market Trends Dashboard</h1>
        <p>Real estate market analysis and insights</p>
        <div class="header-actions">
          <a routerLink="/search" class="btn btn-secondary">← Property Search</a>
          <a routerLink="/comparison" class="btn btn-secondary">Property Comparison</a>
        </div>
      </div>

      <!-- Region Selector -->
      <div class="region-selector">
        <form [formGroup]="filterForm">
          <div class="form-group">
            <label for="region">Select Region:</label>
            <select id="region" formControlName="region" class="form-input" (change)="onRegionChange()">
              <option value="National">National</option>
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="Florida">Florida</option>
              <option value="New York">New York</option>
              <option value="Arizona">Arizona</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="timeframe">Time Period:</label>
            <select id="timeframe" formControlName="timeframe" class="form-input" (change)="onTimeframeChange()">
              <option value="12">Last 12 Months</option>
              <option value="24">Last 2 Years</option>
              <option value="36">Last 3 Years</option>
            </select>
          </div>
        </form>
      </div>

      <div class="dashboard-content" *ngIf="!loading; else loadingTemplate">
        <!-- Market Indicators -->
        <div class="indicators-section" *ngIf="marketIndicators">
          <h2>🎯 Market Health Indicators</h2>
          <div class="indicators-grid">
            <div class="indicator-card temperature" [class]="'temp-' + marketIndicators.marketTemperature">
              <div class="indicator-icon">🌡️</div>
              <div class="indicator-value">{{ marketIndicators.marketTemperature | titlecase }}</div>
              <div class="indicator-label">Market Temperature</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">💰</div>
              <div class="indicator-value">{{ marketIndicators.priceToIncomeRatio | number:'1.1-1' }}</div>
              <div class="indicator-label">Price-to-Income Ratio</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">🏠</div>
              <div class="indicator-value">{{ marketIndicators.affordabilityIndex | number:'1.0-0' }}</div>
              <div class="indicator-label">Affordability Index</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">📊</div>
              <div class="indicator-value">{{ marketIndicators.buyerDemand | number:'1.0-0' }}%</div>
              <div class="indicator-label">Buyer Demand</div>
            </div>
          </div>
        </div>

        <!-- Price Trends Chart -->
        <div class="chart-section" *ngIf="trendData.length > 0">
          <h2>📈 Price Trends</h2>
          <div class="chart-controls">
            <button 
              *ngFor="let metric of chartMetrics" 
              (click)="setActiveMetric(metric.key)"
              [class.active]="activeMetric === metric.key"
              class="metric-btn"
            >
              {{ metric.label }}
            </button>
          </div>
          
          <div class="price-chart-container">
            <div class="chart-wrapper">
              <div class="chart-area">
                <div class="chart-grid">
                  <div 
                    *ngFor="let point of trendData; let i = index"
                    class="chart-point"
                    [style.left.%]="(i / (trendData.length - 1)) * 100"
                    [style.bottom.%]="getChartPointHeight(point, i)"
                    [title]="getPointTooltip(point)"
                  >
                    <div class="point-dot"></div>
                    <div class="point-value" *ngIf="i % 3 === 0">
                      {{ formatChartValue(getPointValue(point)) }}
                    </div>
                  </div>
                  
                  <!-- Chart Line -->
                  <svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                      [attr.points]="getChartPoints()"
                      fill="none"
                      stroke="#667eea"
                      stroke-width="0.5"
                    />
                  </svg>
                </div>
                
                <!-- X-Axis Labels -->
                <div class="chart-x-axis">
                  <div 
                    *ngFor="let point of trendData; let i = index"
                    class="x-label"
                    [style.left.%]="(i / (trendData.length - 1)) * 100"
                  >
                    <span *ngIf="i % 3 === 0">
                      {{ formatDate(point.date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interest Rate Trends -->
        <div class="chart-section" *ngIf="interestRateData.length > 0">
          <h2>📉 Interest Rate Trends</h2>
          <div class="interest-rate-chart">
            <div class="rate-legend">
              <div class="legend-item">
                <div class="legend-color rate-30"></div>
                <span>30-Year Fixed</span>
              </div>
              <div class="legend-item">
                <div class="legend-color rate-15"></div>
                <span>15-Year Fixed</span>
              </div>
              <div class="legend-item">
                <div class="legend-color rate-arm"></div>
                <span>ARM</span>
              </div>
            </div>
            
            <div class="rate-chart-area">
              <div class="rate-chart-grid">
                <!-- 30-Year Rate Line -->
                <svg class="rate-line rate-30-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rate30Year')"
                    fill="none"
                    stroke="#e74c3c"
                    stroke-width="0.8"
                  />
                </svg>
                
                <!-- 15-Year Rate Line -->
                <svg class="rate-line rate-15-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rate15Year')"
                    fill="none"
                    stroke="#27ae60"
                    stroke-width="0.8"
                  />
                </svg>
                
                <!-- ARM Rate Line -->
                <svg class="rate-line rate-arm-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rateARM')"
                    fill="none"
                    stroke="#f39c12"
                    stroke-width="0.8"
                  />
                </svg>
              </div>
              
              <!-- Current Rate Values -->
              <div class="current-rates">
                <div class="current-rate" *ngIf="interestRateData.length > 0">
                  <span class="rate-label">Current 30-Year:</span>
                  <span class="rate-value">{{ interestRateData[interestRateData.length - 1].rate30Year }}%</span>
                </div>
                <div class="current-rate" *ngIf="interestRateData.length > 0">
                  <span class="rate-label">Current 15-Year:</span>
                  <span class="rate-value">{{ interestRateData[interestRateData.length - 1].rate15Year }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Regional Comparison -->
        <div class="regional-section" *ngIf="regionalData.length > 0">
          <h2>🗺️ Regional Market Comparison</h2>
          <div class="regional-grid">
            <div 
              *ngFor="let region of regionalData.slice(0, 6)" 
              class="region-card"
              [class.selected]="region.region === selectedRegion"
              (click)="selectRegion(region.region)"
            >
              <div class="region-header">
                <h3>{{ region.region }}</h3>
                <div class="region-trend" [class]="region.priceChangePercent > 0 ? 'positive' : 'negative'">
                  {{ region.priceChangePercent > 0 ? '↗' : '↘' }} {{ Math.abs(region.priceChangePercent) | number:'1.1-1' }}%
                </div>
              </div>
              
              <div class="region-metrics">
                <div class="metric">
                  <span class="metric-label">Avg Price:</span>
                  <span class="metric-value">\${{ region.currentPrice | number:'1.0-0' }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Sales Volume:</span>
                  <span class="metric-value">{{ region.salesVolume | number:'1.0-0' }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">YoY Change:</span>
                  <span class="metric-value" [class]="region.priceChangePercent > 0 ? 'positive' : 'negative'">
                    \${{ region.priceChange | number:'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Insights -->
        <div class="insights-section" *ngIf="marketInsights.length > 0">
          <h2>💡 Market Insights & Analysis</h2>
          <div class="insights-grid">
            <div 
              *ngFor="let insight of marketInsights" 
              class="insight-card"
              [class]="'insight-' + insight.impact"
            >
              <div class="insight-header">
                <div class="insight-icon">
                  {{ insight.impact === 'positive' ? '📈' : insight.impact === 'negative' ? '📉' : '📊' }}
                </div>
                <div class="insight-confidence">{{ insight.confidence }}% confidence</div>
              </div>
              
              <div class="insight-content">
                <h4>{{ insight.title }}</h4>
                <p>{{ insight.description }}</p>
                <div class="insight-timeframe">
                  <span class="timeframe-label">Timeframe:</span>
                  <span class="timeframe-value">{{ insight.timeframe }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export and Actions -->
        <div class="dashboard-actions">
          <button (click)="exportData()" class="btn btn-primary">📊 Export Market Data</button>
          <button (click)="generateReport()" class="btn btn-secondary">📄 Generate Report</button>
          <button (click)="shareInsights()" class="btn btn-outline">📤 Share Insights</button>
          <button (click)="refreshData()" class="btn btn-outline">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <app-loading-spinner></app-loading-spinner>
          <p>Loading market data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .market-dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .dashboard-header p {
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

    .region-selector {
      background: white;
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .region-selector form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .indicators-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .indicators-section h2 {
      color: #333;
      margin-bottom: 25px;
    }

    .indicators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .indicator-card {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .indicator-card.temperature {
      border-width: 3px;
    }

    .indicator-card.temp-hot {
      border-color: #e74c3c;
      background: linear-gradient(135deg, #fdedec, #fadbd8);
    }

    .indicator-card.temp-warm {
      border-color: #f39c12;
      background: linear-gradient(135deg, #fef9e7, #fcf3cf);
    }

    .indicator-card.temp-balanced {
      border-color: #3498db;
      background: linear-gradient(135deg, #ebf5fb, #d6eaf8);
    }

    .indicator-card.temp-cool {
      border-color: #27ae60;
      background: linear-gradient(135deg, #eafaf1, #d5f4e6);
    }

    .indicator-card.temp-cold {
      border-color: #8e44ad;
      background: linear-gradient(135deg, #f4ecf7, #e8daef);
    }

    .indicator-icon {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .indicator-value {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .indicator-label {
      font-size: 0.9rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .chart-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .chart-section h2 {
      color: #333;
      margin-bottom: 25px;
    }

    .chart-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .metric-btn {
      padding: 8px 16px;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .metric-btn:hover:not(.active) {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .price-chart-container {
      position: relative;
      height: 300px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .chart-wrapper {
      position: relative;
      height: 100%;
      padding: 20px;
    }

    .chart-area {
      position: relative;
      height: calc(100% - 40px);
      background: linear-gradient(to top, #f8f9fa 0%, transparent 100%);
    }

    .chart-grid {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .chart-point {
      position: absolute;
      transform: translateX(-50%);
    }

    .point-dot {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }

    .point-value {
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

    .chart-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .chart-x-axis {
      position: relative;
      height: 20px;
      margin-top: 10px;
    }

    .x-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
    }

    .interest-rate-chart {
      position: relative;
    }

    .rate-legend {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      justify-content: center;
      flex-wrap: wrap;
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

    .legend-color.rate-30 {
      background: #e74c3c;
    }

    .legend-color.rate-15 {
      background: #27ae60;
    }

    .legend-color.rate-arm {
      background: #f39c12;
    }

    .rate-chart-area {
      position: relative;
      height: 250px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .rate-chart-grid {
      position: relative;
      width: 100%;
      height: 200px;
      padding: 20px;
    }

    .rate-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .current-rates {
      display: flex;
      justify-content: space-around;
      padding: 15px;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .current-rate {
      text-align: center;
    }

    .rate-label {
      display: block;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 4px;
    }

    .rate-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .regional-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .regional-section h2 {
      color: #333;
      margin-bottom: 25px;
    }

    .regional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .region-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }

    .region-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .region-card.selected {
      border-color: #28a745;
      background: #f8fff9;
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
    }

    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .region-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .region-trend {
      font-size: 0.9rem;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .region-trend.positive {
      background: #d4edda;
      color: #155724;
    }

    .region-trend.negative {
      background: #f8d7da;
      color: #721c24;
    }

    .region-metrics {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #666;
    }

    .metric-value {
      font-weight: 600;
      color: #2c3e50;
    }

    .metric-value.positive {
      color: #28a745;
    }

    .metric-value.negative {
      color: #dc3545;
    }

    .insights-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .insights-section h2 {
      color: #333;
      margin-bottom: 25px;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .insight-card {
      padding: 20px;
      border-radius: 12px;
      border-left: 5px solid;
    }

    .insight-positive {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }

    .insight-negative {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-color: #dc3545;
    }

    .insight-neutral {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-color: #17a2b8;
    }

    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .insight-icon {
      font-size: 1.5rem;
    }

    .insight-confidence {
      font-size: 0.8rem;
      background: rgba(255,255,255,0.8);
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: bold;
    }

    .insight-content h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .insight-content p {
      margin: 0 0 15px 0;
      color: #495057;
      line-height: 1.5;
    }

    .insight-timeframe {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .timeframe-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: bold;
    }

    .timeframe-value {
      font-size: 0.8rem;
      background: rgba(255,255,255,0.9);
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 500;
    }

    .dashboard-actions {
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: white;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      font-size: 1.1rem;
    }

    /* Expose Math to template */
    .region-trend {
      /* Math.abs will be available in component */
    }

    /* Responsive */
    @media (max-width: 768px) {
      .market-dashboard-container {
        padding: 10px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        align-items: center;
      }

      .chart-controls {
        justify-content: center;
      }

      .regional-grid {
        grid-template-columns: 1fr;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-actions {
        flex-direction: column;
        align-items: center;
      }

      .indicators-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class MarketTrendsDashboardComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  trendData: MarketTrendData[] = [];
  regionalData: RegionData[] = [];
  interestRateData: InterestRateData[] = [];
  marketIndicators: MarketIndicators | null = null;
  marketInsights: MarketInsight[] = [];
  
  loading = true;
  selectedRegion = 'National';
  activeMetric = 'averagePrice';
  
  chartMetrics = [
    { key: 'averagePrice', label: 'Average Price' },
    { key: 'medianPrice', label: 'Median Price' },
    { key: 'pricePerSqFt', label: 'Price per Sq Ft' },
    { key: 'salesVolume', label: 'Sales Volume' },
    { key: 'daysOnMarket', label: 'Days on Market' }
  ];

  private subscription = new Subscription();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private marketTrendsService: MarketTrendsService
  ) {
    this.filterForm = this.fb.group({
      region: ['National'],
      timeframe: ['12']
    });
  }

  ngOnInit() {
    this.loadAllData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setupFormSubscriptions() {
    this.subscription.add(
      this.filterForm.valueChanges.subscribe(() => {
        this.loadAllData();
      })
    );
  }

  private loadAllData() {
    this.loading = true;
    const region = this.filterForm.get('region')?.value || 'National';
    const timeframe = parseInt(this.filterForm.get('timeframe')?.value || '12');

    this.subscription.add(
      this.marketTrendsService.getMarketTrends(region, timeframe).subscribe({
        next: (data) => {
          this.trendData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading trend data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getRegionalData().subscribe({
        next: (data) => {
          this.regionalData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading regional data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getInterestRateHistory(timeframe).subscribe({
        next: (data) => {
          this.interestRateData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading interest rate data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getMarketIndicators(region).subscribe({
        next: (data) => {
          this.marketIndicators = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading market indicators:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getMarketInsights(region).subscribe({
        next: (data) => {
          this.marketInsights = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading market insights:', error)
      })
    );
  }

  private checkLoadingComplete() {
    if (this.trendData.length > 0 && this.regionalData.length > 0 && 
        this.interestRateData.length > 0 && this.marketIndicators && 
        this.marketInsights.length > 0) {
      this.loading = false;
    }
  }

  onRegionChange() {
    this.selectedRegion = this.filterForm.get('region')?.value || 'National';
    this.marketTrendsService.setCurrentRegion(this.selectedRegion);
  }

  onTimeframeChange() {
    // Data will reload automatically via form subscription
  }

  setActiveMetric(metric: string) {
    this.activeMetric = metric;
  }

  selectRegion(region: string) {
    this.selectedRegion = region;
    this.filterForm.patchValue({ region });
  }

  getChartPointHeight(point: MarketTrendData, index: number): number {
    if (this.trendData.length === 0) return 0;
    
    const values = this.trendData.map(p => this.getPointValue(p));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = this.getPointValue(point);
    
    if (max === min) return 50;
    
    return ((current - min) / (max - min)) * 80 + 10;
  }

  getPointValue(point: MarketTrendData): number {
    switch (this.activeMetric) {
      case 'averagePrice': return point.averagePrice;
      case 'medianPrice': return point.medianPrice;
      case 'pricePerSqFt': return point.pricePerSqFt;
      case 'salesVolume': return point.salesVolume;
      case 'daysOnMarket': return point.daysOnMarket;
      default: return point.averagePrice;
    }
  }

  getChartPoints(): string {
    if (this.trendData.length === 0) return '';
    
    return this.trendData.map((point, index) => {
      const x = (index / (this.trendData.length - 1)) * 100;
      const y = 100 - this.getChartPointHeight(point, index);
      return `${x},${y}`;
    }).join(' ');
  }

  getRateChartPoints(rateType: keyof InterestRateData): string {
    if (this.interestRateData.length === 0) return '';
    
    const rates = this.interestRateData.map(d => d[rateType] as number);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    
    return this.interestRateData.map((data, index) => {
      const x = (index / (this.interestRateData.length - 1)) * 100;
      const rate = data[rateType] as number;
      const y = max === min ? 50 : 100 - (((rate - min) / (max - min)) * 80 + 10);
      return `${x},${y}`;
    }).join(' ');
  }

  getPointTooltip(point: MarketTrendData): string {
    const value = this.formatChartValue(this.getPointValue(point));
    const date = this.formatDate(point.date);
    return `${date}: ${value}`;
  }

  formatChartValue(value: number): string {
    if (this.activeMetric.includes('Price') || this.activeMetric === 'pricePerSqFt') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  refreshData() {
    this.loadAllData();
  }

  exportData() {
    const exportData = {
      region: this.selectedRegion,
      trendData: this.trendData,
      regionalData: this.regionalData,
      interestRates: this.interestRateData,
      indicators: this.marketIndicators,
      insights: this.marketInsights,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `market-trends-${this.selectedRegion}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  generateReport() {
    // In a real app, this would generate a comprehensive PDF report
    const reportData = {
      title: `Market Analysis Report - ${this.selectedRegion}`,
      date: new Date().toLocaleDateString(),
      indicators: this.marketIndicators,
      insights: this.marketInsights,
      summary: this.generateReportSummary()
    };

    console.log('Generating market report:', reportData);
    // Could integrate with PDF generation library here
  }

  shareInsights() {
    if (navigator.share) {
      const insights = this.marketInsights.slice(0, 2).map(i => i.title).join(', ');
      navigator.share({
        title: `Market Trends - ${this.selectedRegion}`,
        text: `Latest market insights: ${insights}. Market temperature: ${this.marketIndicators?.marketTemperature}.`,
        url: window.location.href
      }).catch(console.error);
    }
  }

  private generateReportSummary(): string {
    if (!this.marketIndicators || this.marketInsights.length === 0) return '';
    
    const temp = this.marketIndicators.marketTemperature;
    const affordability = this.marketIndicators.affordabilityIndex;
    const topInsight = this.marketInsights[0];
    
    return `The ${this.selectedRegion} market is currently ${temp} with an affordability index of ${affordability.toFixed(0)}. Key insight: ${topInsight.title} - ${topInsight.description}`;
  }
}