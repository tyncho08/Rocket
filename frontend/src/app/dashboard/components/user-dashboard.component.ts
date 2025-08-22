import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { PropertyService } from '../../home-search/services/property.service';
import { MortgageService } from '../../mortgage-tools/services/mortgage.service';
import { LoanService } from '../services/loan.service';
import { Property } from '../../shared/models/property.model';
import { MortgageCalculationResult } from '../../shared/models/mortgage.model';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  joinDate: string;
}

export interface LoanApplication {
  id: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied';
  propertyAddress: string;
  loanAmount: number;
  monthlyPayment: number;
  applicationDate: string;
  lastUpdated: string;
  nextStep: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>👤 My Dashboard</h1>
        <p>Manage your mortgage journey and track your applications</p>
      </div>

      <div class="dashboard-main">
        <!-- Quick Stats -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon">🏠</div>
            <div class="stat-content">
              <div class="stat-value">{{ favoriteProperties.length }}</div>
              <div class="stat-label">Saved Properties</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ loanApplications.length }}</div>
              <div class="stat-label">Loan Applications</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🧮</div>
            <div class="stat-content">
              <div class="stat-value">{{ calculationHistory.length }}</div>
              <div class="stat-label">Calculations</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="getActiveApplication()">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ getActiveApplication()?.status | titlecase }}</div>
              <div class="stat-label">Current Status</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
          <!-- Profile Section -->
          <div class="dashboard-section profile-section">
            <h2>Profile Information</h2>
            
            <div class="profile-content" *ngIf="!editingProfile; else profileTemplate">
              <div class="profile-info">
                <div class="profile-avatar">
                  <div class="avatar-placeholder">
                    {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                  </div>
                </div>
                
                <div class="profile-details">
                  <h3>{{ user?.firstName }} {{ user?.lastName }}</h3>
                  <div class="profile-item">
                    <span class="label">📧 Email:</span>
                    <span class="value">{{ user?.email }}</span>
                  </div>
                  <div class="profile-item">
                    <span class="label">📱 Phone:</span>
                    <span class="value">{{ user?.phone || 'Not provided' }}</span>
                  </div>
                  <div class="profile-item">
                    <span class="label">🏠 Address:</span>
                    <span class="value">
                      {{ user?.address }}<br>
                      {{ user?.city }}, {{ user?.state }} {{ user?.zipCode }}
                    </span>
                  </div>
                  <div class="profile-item">
                    <span class="label">📅 Member Since:</span>
                    <span class="value">{{ formatDate(user?.joinDate) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="profile-actions">
                <button (click)="editProfile()" class="btn btn-primary">
                  ✏️ Edit Profile
                </button>
              </div>
            </div>

            <ng-template #profileTemplate>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" formControlName="firstName" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" formControlName="lastName" class="form-input" />
                  </div>
                  
                  <div class="form-group full-width">
                    <label for="email">Email</label>
                    <input type="email" id="email" formControlName="email" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" formControlName="phone" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label for="address">Address</label>
                    <input type="text" id="address" formControlName="address" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label for="city">City</label>
                    <input type="text" id="city" formControlName="city" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label for="state">State</label>
                    <select id="state" formControlName="state" class="form-input">
                      <option value="">Select State</option>
                      <option value="TX">Texas</option>
                      <option value="CA">California</option>
                      <option value="FL">Florida</option>
                      <option value="NY">New York</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="zipCode">ZIP Code</label>
                    <input type="text" id="zipCode" formControlName="zipCode" class="form-input" />
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="button" (click)="cancelEdit()" class="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </ng-template>
          </div>

          <!-- Loan Applications -->
          <div class="dashboard-section applications-section">
            <div class="section-header">
              <h2>Loan Applications</h2>
              <button [routerLink]="['/loan-application']" class="btn btn-primary">
                📝 New Application
              </button>
            </div>
            
            <div *ngIf="loanApplications.length === 0" class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>No applications yet</h3>
              <p>Ready to start your mortgage journey?</p>
              <button [routerLink]="['/loan-application']" class="btn btn-primary">
                Start Application
              </button>
            </div>
            
            <div *ngIf="loanApplications.length > 0" class="applications-list">
              <div 
                *ngFor="let app of loanApplications" 
                class="application-card"
                [class]="'status-' + app.status"
              >
                <div class="app-header">
                  <div class="app-status">
                    <span class="status-badge">{{ app.status | titlecase }}</span>
                    <span class="app-date">{{ formatDate(app.applicationDate) }}</span>
                  </div>
                  <div class="app-id">App #{{ app.id }}</div>
                </div>
                
                <div class="app-content">
                  <div class="app-property">
                    <h4>{{ app.propertyAddress }}</h4>
                  </div>
                  
                  <div class="app-details">
                    <div class="detail-item">
                      <span class="label">Loan Amount:</span>
                      <span class="value">{{ formatCurrency(app.loanAmount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Monthly Payment:</span>
                      <span class="value">{{ formatCurrency(app.monthlyPayment) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Last Updated:</span>
                      <span class="value">{{ formatDate(app.lastUpdated) }}</span>
                    </div>
                  </div>
                  
                  <div class="app-next-step" *ngIf="app.nextStep">
                    <strong>Next Step:</strong> {{ app.nextStep }}
                  </div>
                </div>
                
                <div class="app-actions">
                  <button class="btn btn-outline btn-sm">
                    👁️ View Details
                  </button>
                  <button *ngIf="app.status === 'draft'" class="btn btn-primary btn-sm">
                    ✏️ Continue
                  </button>
                  <button *ngIf="app.status !== 'draft'" class="btn btn-secondary btn-sm">
                    📄 Documents
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Favorite Properties -->
          <div class="dashboard-section favorites-section">
            <div class="section-header">
              <h2>Saved Properties</h2>
              <button [routerLink]="['/search']" class="btn btn-outline">
                🔍 Search More
              </button>
            </div>
            
            <div *ngIf="favoriteProperties.length === 0" class="empty-state">
              <div class="empty-icon">🏠</div>
              <h3>No saved properties</h3>
              <p>Save properties you're interested in to track them here</p>
              <button [routerLink]="['/search']" class="btn btn-primary">
                Browse Properties
              </button>
            </div>
            
            <div *ngIf="favoriteProperties.length > 0" class="favorites-grid">
              <div 
                *ngFor="let property of favoriteProperties.slice(0, 6)" 
                class="favorite-card"
                [routerLink]="['/properties', property.id]"
              >
                <img 
                  [src]="property.imageUrl || '/assets/images/property-placeholder.jpg'" 
                  [alt]="property.address"
                  (error)="onImageError($event)"
                />
                <div class="favorite-content">
                  <div class="favorite-price">{{ formatCurrency(property.price) }}</div>
                  <div class="favorite-address">{{ property.address }}</div>
                  <div class="favorite-specs">
                    {{ property.bedrooms }}bd • {{ property.bathrooms }}ba • {{ formatNumber(property.squareFeet) }} sqft
                  </div>
                </div>
                <button 
                  class="unfavorite-btn"
                  (click)="removeFavorite(property, $event)"
                  title="Remove from favorites"
                >
                  ❌
                </button>
              </div>
            </div>
            
            <div *ngIf="favoriteProperties.length > 6" class="view-all">
              <button [routerLink]="['/favorites']" class="btn btn-link">
                View All {{ favoriteProperties.length }} Properties →
              </button>
            </div>
          </div>

          <!-- Recent Calculations -->
          <div class="dashboard-section calculations-section">
            <div class="section-header">
              <h2>Recent Calculations</h2>
              <button [routerLink]="['/mortgage-tools']" class="btn btn-outline">
                🧮 Calculate
              </button>
            </div>
            
            <div *ngIf="calculationHistory.length === 0" class="empty-state">
              <div class="empty-icon">🧮</div>
              <h3>No calculations yet</h3>
              <p>Use our mortgage calculator to estimate payments</p>
              <button [routerLink]="['/mortgage-tools']" class="btn btn-primary">
                Calculate Now
              </button>
            </div>
            
            <div *ngIf="calculationHistory.length > 0" class="calculations-list">
              <div 
                *ngFor="let calc of calculationHistory.slice(0, 5)" 
                class="calculation-card"
                (click)="loadCalculation(calc)"
              >
                <div class="calc-payment">{{ formatCurrency(calc.monthlyPayment) }}/month</div>
                <div class="calc-details">
                  <div class="calc-amount">Loan: {{ formatCurrency(calc.loanAmount) }}</div>
                  <div class="calc-term">{{ getLoanTerm(calc) }} years</div>
                </div>
                <div class="calc-date">{{ calc.calculatedAt ? getRelativeTime(calc.calculatedAt.toString()) : 'Just now' }}</div>
              </div>
            </div>
            
            <div *ngIf="calculationHistory.length > 5" class="view-all">
              <button (click)="viewAllCalculations()" class="btn btn-link">
                View All Calculations →
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-section actions-section">
            <h2>Quick Actions</h2>
            
            <div class="quick-actions">
              <button [routerLink]="['/search']" class="action-btn">
                <div class="action-icon">🏠</div>
                <div class="action-content">
                  <div class="action-title">Search Properties</div>
                  <div class="action-subtitle">Find your dream home</div>
                </div>
              </button>
              
              <button [routerLink]="['/mortgage-tools']" class="action-btn">
                <div class="action-icon">🧮</div>
                <div class="action-content">
                  <div class="action-title">Calculate Payments</div>
                  <div class="action-subtitle">Estimate monthly costs</div>
                </div>
              </button>
              
              <button [routerLink]="['/loan-application']" class="action-btn">
                <div class="action-icon">📝</div>
                <div class="action-content">
                  <div class="action-title">Apply for Loan</div>
                  <div class="action-subtitle">Start your application</div>
                </div>
              </button>
              
              <button (click)="contactSupport()" class="action-btn">
                <div class="action-icon">📞</div>
                <div class="action-content">
                  <div class="action-title">Contact Support</div>
                  <div class="action-subtitle">Get help from experts</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: #6c757d;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .dashboard-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dashboard-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin-bottom: 0;
    }

    /* Profile Section */
    .profile-section {
      grid-column: span 2;
    }

    .profile-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .profile-info {
      display: flex;
      gap: 2rem;
      flex: 1;
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3498db, #2c3e50);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .profile-details h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .profile-item {
      display: flex;
      margin-bottom: 0.75rem;
    }

    .profile-item .label {
      width: 120px;
      color: #6c757d;
      font-weight: 600;
    }

    .profile-item .value {
      color: #2c3e50;
    }

    .profile-form .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-group.full-width {
      grid-column: span 2;
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

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* Applications Section */
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .application-card {
      border: 2px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s;
    }

    .application-card.status-approved {
      border-color: #27ae60;
      background: #f8fff9;
    }

    .application-card.status-denied {
      border-color: #e74c3c;
      background: #fff8f8;
    }

    .application-card.status-under_review {
      border-color: #f39c12;
      background: #fffcf8;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .status-badge {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .app-date {
      color: #6c757d;
      font-size: 0.875rem;
      margin-left: 1rem;
    }

    .app-property h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .app-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item .label {
      color: #6c757d;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .detail-item .value {
      color: #2c3e50;
      font-weight: 600;
    }

    .app-next-step {
      background: #e3f2fd;
      padding: 1rem;
      border-radius: 6px;
      color: #1976d2;
      margin-bottom: 1rem;
    }

    .app-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Favorites Section */
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .favorite-card {
      position: relative;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
    }

    .favorite-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .favorite-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .favorite-content {
      padding: 1rem;
    }

    .favorite-price {
      font-weight: 700;
      color: #3498db;
      margin-bottom: 0.25rem;
    }

    .favorite-address {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .favorite-specs {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .unfavorite-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    /* Calculations Section */
    .calculations-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .calculation-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .calculation-card:hover {
      background: #e9ecef;
    }

    .calc-payment {
      font-weight: 700;
      color: #3498db;
      font-size: 1.1rem;
    }

    .calc-details {
      flex: 1;
      margin-left: 1rem;
    }

    .calc-amount {
      font-size: 0.9rem;
      color: #2c3e50;
    }

    .calc-term {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .calc-date {
      font-size: 0.8rem;
      color: #6c757d;
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
    }

    .action-btn:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 1.5rem;
      width: 50px;
      height: 50px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .action-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
    }

    /* Common Elements */
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

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
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

    .btn-link {
      background: none;
      border: none;
      color: #3498db;
      text-decoration: underline;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6c757d;
      margin-bottom: 1.5rem;
    }

    .view-all {
      text-align: center;
      margin-top: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .profile-section {
        grid-column: span 1;
      }

      .profile-content {
        flex-direction: column;
        gap: 1.5rem;
      }

      .profile-info {
        flex-direction: column;
        gap: 1rem;
      }

      .profile-form .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .app-details {
        grid-template-columns: 1fr;
      }

      .favorites-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loanApplications: LoanApplication[] = [];
  favoriteProperties: Property[] = [];
  calculationHistory: MortgageCalculationResult[] = [];
  
  editingProfile = false;
  profileForm: FormGroup;
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private propertyService: PropertyService,
    private mortgageService: MortgageService,
    private loanService: LoanService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    // Load user profile
    this.loadUserProfile();
    
    // Load favorite properties
    this.loadFavoriteProperties();
    
    // Load calculation history
    this.loadCalculationHistory();
    
    // Load loan applications
    this.loadLoanApplications();
  }

  loadUserProfile(): void {
    // Mock user data - in real app, this would come from an API
    this.user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      joinDate: '2024-01-15T00:00:00Z'
    };
  }

  loadFavoriteProperties(): void {
    this.subscriptions.add(
      this.propertyService.getFavoriteProperties().subscribe({
        next: (properties) => {
          this.favoriteProperties = properties;
        },
        error: () => {
          // Silently handle error for favorites
          this.favoriteProperties = [];
        }
      })
    );
  }

  loadCalculationHistory(): void {
    this.subscriptions.add(
      this.mortgageService.calculationHistory$.subscribe(history => {
        this.calculationHistory = history;
      })
    );
  }

  loadLoanApplications(): void {
    // Mock loan applications - in real app, this would come from an API
    this.loanApplications = [
      {
        id: 1001,
        status: 'under_review',
        propertyAddress: '456 Oak Avenue, Austin, TX 78702',
        loanAmount: 320000,
        monthlyPayment: 2145.67,
        applicationDate: '2024-08-15T00:00:00Z',
        lastUpdated: '2024-08-18T00:00:00Z',
        nextStep: 'Provide income verification documents'
      },
      {
        id: 1002,
        status: 'draft',
        propertyAddress: '789 Pine Street, Austin, TX 78703',
        loanAmount: 275000,
        monthlyPayment: 1842.33,
        applicationDate: '2024-08-20T00:00:00Z',
        lastUpdated: '2024-08-20T00:00:00Z',
        nextStep: 'Complete application form'
      }
    ];
  }

  editProfile(): void {
    if (this.user) {
      this.profileForm.patchValue(this.user);
      this.editingProfile = true;
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      const formValue = this.profileForm.value;
      this.user = { ...this.user, ...formValue };
      this.editingProfile = false;
      
      this.notificationService.success(
        'Profile Updated',
        'Your profile information has been saved successfully'
      );
    }
  }

  cancelEdit(): void {
    this.editingProfile = false;
    this.profileForm.reset();
  }

  removeFavorite(property: Property, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.propertyService.toggleFavorite(property.id).subscribe({
      next: () => {
        this.favoriteProperties = this.favoriteProperties.filter(p => p.id !== property.id);
        this.notificationService.success(
          'Removed from Favorites',
          'Property removed from your favorites'
        );
      },
      error: () => {
        this.notificationService.error('Error', 'Unable to remove property from favorites');
      }
    });
  }

  loadCalculation(calculation: MortgageCalculationResult): void {
    this.router.navigate(['/mortgage-tools'], {
      queryParams: { loadCalculation: JSON.stringify(calculation) }
    });
  }

  viewAllCalculations(): void {
    this.router.navigate(['/mortgage-tools']);
  }

  contactSupport(): void {
    this.notificationService.info(
      'Contact Support',
      'Support feature coming soon! Call (555) 123-LOAN for immediate assistance.'
    );
  }

  getActiveApplication(): LoanApplication | undefined {
    return this.loanApplications.find(app => 
      app.status === 'under_review' || app.status === 'submitted'
    );
  }

  getLoanTerm(calculation: MortgageCalculationResult): number {
    // Extract loan term from calculation - this would be stored with the calculation
    return 30; // Default to 30 years for now
  }

  getRelativeTime(date: string): string {
    const now = new Date();
    const calcDate = new Date(date || now);
    const diffMs = now.getTime() - calcDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/property-placeholder.jpg';
  }
}