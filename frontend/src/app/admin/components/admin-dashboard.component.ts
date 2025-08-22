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
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage applications, users, and monitor platform activity</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>

      <div class="dashboard-content" *ngIf="!loading && metrics">
        <!-- Key Metrics Cards -->
        <div class="metrics-section">
          <h2>📊 Key Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">📋</div>
              <div class="metric-value">{{metrics.totalApplications}}</div>
              <div class="metric-label">Total Applications</div>
            </div>
            
            <div class="metric-card pending">
              <div class="metric-icon">⏳</div>
              <div class="metric-value">{{metrics.pendingApplications}}</div>
              <div class="metric-label">Pending Review</div>
            </div>
            
            <div class="metric-card approved">
              <div class="metric-icon">✅</div>
              <div class="metric-value">{{metrics.approvedApplications}}</div>
              <div class="metric-label">Approved</div>
            </div>
            
            <div class="metric-card denied">
              <div class="metric-icon">❌</div>
              <div class="metric-value">{{metrics.deniedApplications}}</div>
              <div class="metric-label">Denied</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">👥</div>
              <div class="metric-value">{{metrics.totalUsers}}</div>
              <div class="metric-label">Total Users</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">📈</div>
              <div class="metric-value">{{metrics.approvalRate.toFixed(1)}}%</div>
              <div class="metric-label">Approval Rate</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>⚡ Quick Actions</h2>
          <div class="action-cards">
            <a routerLink="/admin/loans" class="action-card">
              <div class="action-icon">📋</div>
              <div class="action-title">Manage Loans</div>
              <div class="action-description">Review and process loan applications</div>
            </a>
            
            <a routerLink="/admin/users" class="action-card">
              <div class="action-icon">👥</div>
              <div class="action-title">Manage Users</div>
              <div class="action-description">View and manage user accounts</div>
            </a>
            
            <div class="action-card" (click)="refreshData()">
              <div class="action-icon">🔄</div>
              <div class="action-title">Refresh Data</div>
              <div class="action-description">Update dashboard metrics</div>
            </div>
          </div>
        </div>

        <!-- Recent Applications -->
        <div class="recent-section">
          <h2>📋 Recent Applications</h2>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 40px;
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

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .metrics-section, .actions-section, .recent-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .metrics-section h2, .actions-section h2, .recent-section h2 {
      margin-bottom: 25px;
      color: #333;
      font-size: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: linear-gradient(135deg, #f8f9ff 0%, #e3ebff 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
    }

    .metric-card.pending {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
      border-color: #ffc107;
    }

    .metric-card.approved {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }

    .metric-card.denied {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-color: #dc3545;
    }

    .metric-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      text-align: center;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
      color: white;
      text-decoration: none;
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }

    .action-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .action-description {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .recent-applications {
      space-y: 15px;
    }

    .application-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 15px;
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
      font-weight: bold;
      color: #333;
    }

    .app-status {
      padding: 4px 12px;
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

    .app-details {
      display: flex;
      gap: 20px;
      margin-bottom: 5px;
    }

    .app-user {
      font-weight: 500;
      color: #333;
    }

    .app-amount {
      font-weight: bold;
      color: #28a745;
    }

    .app-date {
      font-size: 0.85rem;
      color: #666;
    }

    .review-btn {
      background: #007bff;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .review-btn:hover {
      background: #0056b3;
      color: white;
      text-decoration: none;
    }

    .no-applications {
      text-align: center;
      color: #666;
      padding: 40px;
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