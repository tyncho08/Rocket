import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService, DashboardMetrics } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-dashboard-container">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage applications, users, and monitor platform activity</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>

      <div class="dashboard-content" *ngIf="!loading && metrics">
        <!-- Key Metrics Cards -->
        <div class="metrics-section">
          <h2>Key Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                  <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                </svg>
              </div>
              <div class="metric-value">{{metrics.totalApplications}}</div>
              <div class="metric-label">Total Applications</div>
            </div>
            
            <div class="metric-card pending">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div class="metric-value">{{metrics.pendingApplications}}</div>
              <div class="metric-label">Pending Review</div>
            </div>
            
            <div class="metric-card approved">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <div class="metric-value">{{metrics.approvedApplications}}</div>
              <div class="metric-label">Approved</div>
            </div>
            
            <div class="metric-card denied">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div class="metric-value">{{metrics.deniedApplications}}</div>
              <div class="metric-label">Denied</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7019C21.7033 16.0497 20.0109 15.6023 19 15.4278"/>
                  <circle cx="16" cy="4" r="3"/>
                </svg>
              </div>
              <div class="metric-value">{{metrics.totalUsers}}</div>
              <div class="metric-label">Total Users</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
              </div>
              <div class="metric-value">{{metrics.approvalRate.toFixed(1)}}%</div>
              <div class="metric-label">Approval Rate</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>Quick Actions</h2>
          <div class="action-cards">
            <a routerLink="/admin/loans" class="action-card">
              <div class="action-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                  <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                </svg>
              </div>
              <div class="action-title">Manage Loans</div>
              <div class="action-description">Review and process loan applications</div>
            </a>
            
            <a routerLink="/admin/users" class="action-card">
              <div class="action-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7019C21.7033 16.0497 20.0109 15.6023 19 15.4278"/>
                  <circle cx="16" cy="4" r="3"/>
                </svg>
              </div>
              <div class="action-title">Manage Users</div>
              <div class="action-description">View and manage user accounts</div>
            </a>
            
            <div class="action-card" (click)="refreshData()">
              <div class="action-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10"/>
                </svg>
              </div>
              <div class="action-title">Refresh Data</div>
              <div class="action-description">Update dashboard metrics</div>
            </div>
          </div>
        </div>

        <!-- Recent Applications -->
        <div class="recent-section">
          <h2>Recent Applications</h2>
          <div class="recent-applications" *ngIf="metrics.recentApplications.length > 0">
            <div class="application-item" *ngFor="let app of metrics.recentApplications">
              <div class="app-info">
                <div class="app-header">
                  <span class="app-id">#{{app.id}}</span>
                  <span class="app-status" [class]="'status-' + app.status.toLowerCase()">{{app.status}}</span>
                </div>
                <div class="app-details">
                  <span class="app-user">{{app.userName}}</span>
                  <span class="app-amount">\${{app.loanAmount | number:'1.0-0'}}</span>
                </div>
                <div class="app-date">{{formatDate(app.createdAt)}}</div>
              </div>
              <a routerLink="/admin/loans/{{app.id}}" class="review-btn">Review</a>
            </div>
          </div>
          <div class="no-applications" *ngIf="metrics.recentApplications.length === 0">
            <p>No recent applications found</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: 2rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--primary-dark);
      font-weight: 600;
    }

    .dashboard-header p {
      font-size: 1.2rem;
      color: var(--text-secondary);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: var(--text-secondary);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--border-light);
      border-top: 4px solid var(--primary-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .metrics-section, .actions-section, .recent-section {
      background: var(--background-primary);
      border: 1px solid var(--border-light);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .metrics-section h2, .actions-section h2, .recent-section h2 {
      margin-bottom: 1.5rem;
      color: var(--primary-dark);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: var(--background-primary);
      padding: 1.5rem;
      border-radius: 0.75rem;
      text-align: center;
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .metric-card.pending {
      border-left: 4px solid var(--accent-warning);
    }

    .metric-card.approved {
      border-left: 4px solid var(--accent-success);
    }

    .metric-card.denied {
      border-left: 4px solid var(--accent-danger);
    }

    .metric-icon {
      margin-bottom: 1rem;
      color: var(--primary-dark);
      display: flex;
      justify-content: center;
    }

    .metric-icon svg {
      width: 32px;
      height: 32px;
      stroke: var(--primary-dark);
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: 0.5rem;
    }

    .metric-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: var(--background-primary);
      color: var(--text-primary);
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border-light);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      text-align: center;
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      color: var(--text-primary);
      text-decoration: none;
      border-color: var(--primary-dark);
    }

    .action-icon {
      margin-bottom: 1rem;
      color: var(--primary-dark);
      display: flex;
      justify-content: center;
    }

    .action-icon svg {
      width: 36px;
      height: 36px;
      stroke: var(--primary-dark);
    }

    .action-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--primary-dark);
    }

    .action-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .recent-applications {
      space-y: 15px;
    }

    .application-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--background-tertiary);
      padding: 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
    }

    .application-item:hover {
      background: var(--background-primary);
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .app-info {
      flex-grow: 1;
    }

    .app-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .app-id {
      font-weight: 600;
      color: var(--primary-dark);
    }

    .app-status {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-pending {
      background: rgba(214, 158, 46, 0.1);
      color: var(--accent-warning);
      border: 1px solid var(--accent-warning);
    }

    .status-approved {
      background: rgba(56, 161, 105, 0.1);
      color: var(--accent-success);
      border: 1px solid var(--accent-success);
    }

    .status-denied {
      background: rgba(229, 62, 62, 0.1);
      color: var(--accent-danger);
      border: 1px solid var(--accent-danger);
    }

    .app-details {
      display: flex;
      gap: 20px;
      margin-bottom: 5px;
    }

    .app-user {
      font-weight: 500;
      color: var(--text-primary);
    }

    .app-amount {
      font-weight: 600;
      color: var(--accent-success);
    }

    .app-date {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .review-btn {
      background: var(--primary-dark);
      color: var(--text-white);
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--primary-dark);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .review-btn:hover {
      background: var(--primary-medium);
      color: var(--text-white);
      text-decoration: none;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px var(--shadow-medium);
    }

    .no-applications {
      text-align: center;
      color: var(--text-muted);
      padding: 2.5rem;
    }

    @media (max-width: 768px) {
      .admin-dashboard-container {
        padding: 10px;
      }

      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .action-cards {
        grid-template-columns: 1fr;
      }

      .application-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .app-details {
        flex-direction: column;
        gap: 5px;
      }

      .review-btn {
        align-self: flex-start;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  metrics: DashboardMetrics | null = null;
  loading = true;
  private subscription = new Subscription();

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDashboardMetrics();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadDashboardMetrics() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getDashboardMetrics().subscribe({
        next: (metrics) => {
          this.metrics = metrics;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard metrics:', error);
          this.notificationService.loadError('dashboard metrics');
          this.loading = false;
        }
      })
    );
  }

  refreshData() {
    this.notificationService.info('Refreshing', 'Refreshing dashboard data...');
    this.loadDashboardMetrics();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}