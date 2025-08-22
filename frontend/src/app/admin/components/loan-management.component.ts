import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, LoanApplication, LoanApplicationsResponse } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="loan-management-container">
      <div class="page-header">
        <h1>📋 Loan Management</h1>
        <p>Review and manage all loan applications</p>
        <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-filter">
          <input 
            type="text" 
            placeholder="Search by user name or email..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange($event)"
            class="search-input">
        </div>
        
        <div class="status-filter">
          <select [(ngModel)]="selectedStatus" (change)="onFilterChange()" class="filter-select">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>

        <div class="results-info" *ngIf="applicationsResponse">
          Showing {{((applicationsResponse.page - 1) * applicationsResponse.limit) + 1}} to 
          {{Math.min(applicationsResponse.page * applicationsResponse.limit, applicationsResponse.totalCount)}} 
          of {{applicationsResponse.totalCount}} applications
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading loan applications...</p>
      </div>

      <!-- Applications Table -->
      <div class="applications-table" *ngIf="!loading && applicationsResponse">
        <div class="table-responsive">
          <table class="applications-grid">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>Loan Amount</th>
                <th>Property Value</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let application of applicationsResponse.applications" class="application-row">
                <td class="app-id">#{{application.id}}</td>
                <td class="applicant-info">
                  <div class="applicant-name">{{application.userName}}</div>
                  <div class="applicant-income">\${{application.annualIncome | number:'1.0-0'}} annually</div>
                </td>
                <td class="loan-amount">
                  <div class="amount">\${{application.loanAmount | number:'1.0-0'}}</div>
                  <div class="term">{{application.loanTermYears}} years at {{application.interestRate}}%</div>
                </td>
                <td class="property-value">
                  <div class="value">\${{application.propertyValue | number:'1.0-0'}}</div>
                  <div class="down-payment">Down: \${{application.downPayment | number:'1.0-0'}}</div>
                </td>
                <td class="status-cell">
                  <span class="status-badge" [class]="'status-' + application.status.toLowerCase().replace(' ', '-')">
                    {{application.status}}
                  </span>
                </td>
                <td class="date-cell">{{formatDate(application.createdAt)}}</td>
                <td class="actions-cell">
                  <a routerLink="/admin/loans/{{application.id}}" class="review-btn">Review</a>
                  <button 
                    *ngIf="application.status === 'Pending'" 
                    (click)="quickApprove(application.id)"
                    class="quick-approve-btn"
                    [disabled]="updating === application.id">
                    {{updating === application.id ? 'Updating...' : 'Quick Approve'}}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Applications Message -->
        <div class="no-applications" *ngIf="applicationsResponse.applications.length === 0">
          <div class="no-data-icon">📋</div>
          <h3>No Applications Found</h3>
          <p>No loan applications match your current filters.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="applicationsResponse && applicationsResponse.totalPages > 1">
        <button 
          (click)="changePage(applicationsResponse.page - 1)"
          [disabled]="applicationsResponse.page === 1 || loading"
          class="pagination-btn">
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{applicationsResponse.page}} of {{applicationsResponse.totalPages}}
        </span>
        
        <button 
          (click)="changePage(applicationsResponse.page + 1)"
          [disabled]="applicationsResponse.page === applicationsResponse.totalPages || loading"
          class="pagination-btn">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .loan-management-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
      position: relative;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .page-header p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 20px;
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 0;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 25px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
    }

    .filters-section {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 30px;
    }

    .search-filter {
      flex: 2;
      min-width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .status-filter {
      flex: 1;
      min-width: 200px;
    }

    .filter-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .results-info {
      flex: 1;
      min-width: 200px;
      color: #666;
      font-size: 0.9rem;
      text-align: right;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255,255,255,0.3);
      border-top: 5px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .applications-table {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 30px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .applications-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .applications-grid th {
      background: #f8f9fa;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e9ecef;
      white-space: nowrap;
    }

    .application-row {
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.3s ease;
    }

    .application-row:hover {
      background-color: #f8f9fa;
    }

    .applications-grid td {
      padding: 20px 12px;
      vertical-align: top;
    }

    .app-id {
      font-weight: bold;
      color: #667eea;
    }

    .applicant-info .applicant-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .applicant-info .applicant-income {
      font-size: 0.85rem;
      color: #666;
    }

    .loan-amount .amount {
      font-weight: bold;
      color: #28a745;
      font-size: 1.1rem;
      margin-bottom: 4px;
    }

    .loan-amount .term {
      font-size: 0.85rem;
      color: #666;
    }

    .property-value .value {
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .property-value .down-payment {
      font-size: 0.85rem;
      color: #666;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background: #d4edda;
      color: #155724;
    }

    .status-denied {
      background: #f8d7da;
      color: #721c24;
    }

    .status-under-review {
      background: #d1ecf1;
      color: #0c5460;
    }

    .date-cell {
      color: #666;
      font-size: 0.9rem;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .review-btn {
      background: #007bff;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.85rem;
      margin-right: 8px;
      display: inline-block;
      transition: background 0.3s ease;
    }

    .review-btn:hover {
      background: #0056b3;
      color: white;
      text-decoration: none;
    }

    .quick-approve-btn {
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .quick-approve-btn:hover:not(:disabled) {
      background: #218838;
    }

    .quick-approve-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .no-applications {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .no-applications h3 {
      margin-bottom: 10px;
      color: #333;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      color: white;
      margin-bottom: 30px;
    }

    .pagination-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.3);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .loan-management-container {
        padding: 10px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .back-btn {
        position: relative;
        display: block;
        width: fit-content;
        margin: 0 auto 20px;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-filter, .status-filter {
        min-width: unset;
      }

      .results-info {
        text-align: center;
      }

      .applications-grid {
        font-size: 0.85rem;
      }

      .applications-grid th,
      .applications-grid td {
        padding: 12px 8px;
      }

      .actions-cell {
        white-space: normal;
      }

      .review-btn,
      .quick-approve-btn {
        display: block;
        margin-bottom: 5px;
        text-align: center;
      }
    }
  `]
})
export class LoanManagementComponent implements OnInit, OnDestroy {
  applicationsResponse: LoanApplicationsResponse | null = null;
  loading = true;
  updating: number | null = null;
  
  searchTerm = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 10;

  private subscription = new Subscription();
  private searchSubject = new Subject<string>();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadApplications();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.searchSubject.complete();
  }

  setupSearchDebounce() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.currentPage = 1;
        this.loadApplications();
      })
    );
  }

  loadApplications() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getAllLoanApplications(
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.applicationsResponse = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.notificationService.loadError('loan applications');
          this.loading = false;
        }
      })
    );
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadApplications();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadApplications();
  }

  quickApprove(applicationId: number) {
    this.updating = applicationId;
    this.subscription.add(
      this.adminService.updateLoanApplicationStatus(applicationId, 'Approved', 'Quick approved by admin').subscribe({
        next: () => {
          this.notificationService.success('Approved', 'Application approved successfully');
          this.updating = null;
          this.loadApplications();
        },
        error: (error) => {
          console.error('Error approving application:', error);
          this.notificationService.saveError('application approval');
          this.updating = null;
        }
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}