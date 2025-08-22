import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, AdminUser, UsersResponse } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="user-management-container">
      <div class="page-header">
        <h1>👥 User Management</h1>
        <p>Manage user accounts and permissions</p>
        <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-filter">
          <input 
            type="text" 
            placeholder="Search by name or email..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange($event)"
            class="search-input">
        </div>

        <div class="results-info" *ngIf="usersResponse">
          Showing {{((usersResponse.page - 1) * usersResponse.limit) + 1}} to 
          {{Math.min(usersResponse.page * usersResponse.limit, usersResponse.totalCount)}} 
          of {{usersResponse.totalCount}} users
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <div class="users-table" *ngIf="!loading && usersResponse">
        <div class="table-responsive">
          <table class="users-grid">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Applications</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of usersResponse.users" class="user-row">
                <td class="user-info">
                  <div class="user-avatar">{{getInitials(user.firstName, user.lastName)}}</div>
                  <div class="user-details">
                    <div class="user-name">{{user.firstName}} {{user.lastName}}</div>
                    <div class="user-id">ID: {{user.id}}</div>
                  </div>
                </td>
                <td class="user-email">{{user.email}}</td>
                <td class="role-cell">
                  <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                    {{user.role}}
                  </span>
                </td>
                <td class="applications-cell">
                  <div class="app-count">{{user.loanApplicationsCount}}</div>
                  <div class="app-label">applications</div>
                </td>
                <td class="date-cell">{{formatDate(user.createdAt)}}</td>
                <td class="actions-cell">
                  <select 
                    [value]="user.role"
                    (change)="updateUserRole(user, $event)"
                    class="role-select"
                    [disabled]="updatingUserId === user.id">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div class="updating-indicator" *ngIf="updatingUserId === user.id">
                    Updating...
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users Message -->
        <div class="no-users" *ngIf="usersResponse.users.length === 0">
          <div class="no-data-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No users match your current search criteria.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="usersResponse && usersResponse.totalPages > 1">
        <button 
          (click)="changePage(usersResponse.page - 1)"
          [disabled]="usersResponse.page === 1 || loading"
          class="pagination-btn">
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{usersResponse.page}} of {{usersResponse.totalPages}}
        </span>
        
        <button 
          (click)="changePage(usersResponse.page + 1)"
          [disabled]="usersResponse.page === usersResponse.totalPages || loading"
          class="pagination-btn">
          Next
        </button>
      </div>

      <!-- User Statistics -->
      <div class="stats-section">
        <h2>📊 User Statistics</h2>
        <div class="stats-grid" *ngIf="usersResponse">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{usersResponse.totalCount}}</div>
            <div class="stat-label">Total Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-value">{{getUsersByRole('User')}}</div>
            <div class="stat-label">Regular Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-value">{{getUsersByRole('Admin')}}</div>
            <div class="stat-label">Administrators</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-value">{{getTotalApplications()}}</div>
            <div class="stat-label">Total Applications</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management-container {
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

    .users-table {
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

    .users-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .users-grid th {
      background: #f8f9fa;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e9ecef;
      white-space: nowrap;
    }

    .user-row {
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.3s ease;
    }

    .user-row:hover {
      background-color: #f8f9fa;
    }

    .users-grid td {
      padding: 20px 12px;
      vertical-align: middle;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .user-details .user-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .user-details .user-id {
      font-size: 0.8rem;
      color: #666;
    }

    .user-email {
      color: #666;
      font-size: 0.9rem;
    }

    .role-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .role-user {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-admin {
      background: #fff3e0;
      color: #f57c00;
    }

    .applications-cell {
      text-align: center;
    }

    .app-count {
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    .app-label {
      font-size: 0.8rem;
      color: #666;
    }

    .date-cell {
      color: #666;
      font-size: 0.9rem;
    }

    .actions-cell {
      position: relative;
    }

    .role-select {
      padding: 6px 12px;
      border: 1px solid #e0e6ed;
      border-radius: 6px;
      font-size: 0.85rem;
      background: white;
      transition: border-color 0.3s ease;
    }

    .role-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .updating-indicator {
      position: absolute;
      top: 100%;
      left: 0;
      font-size: 0.75rem;
      color: #007bff;
      margin-top: 4px;
    }

    .no-users {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .no-users h3 {
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

    .stats-section {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .stats-section h2 {
      margin-bottom: 25px;
      color: #333;
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f8f9ff 0%, #e3ebff 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .user-management-container {
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

      .search-filter {
        min-width: unset;
      }

      .results-info {
        text-align: center;
      }

      .users-grid {
        font-size: 0.85rem;
      }

      .users-grid th,
      .users-grid td {
        padding: 12px 8px;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class UserManagementComponent implements OnInit, OnDestroy {
  usersResponse: UsersResponse | null = null;
  loading = true;
  updatingUserId: number | null = null;
  
  searchTerm = '';
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
    this.loadUsers();
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
        this.loadUsers();
      })
    );
  }

  loadUsers() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getAllUsers(
        this.currentPage,
        this.pageSize,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.usersResponse = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notificationService.loadError('users');
          this.loading = false;
        }
      })
    );
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  updateUserRole(user: AdminUser, event: any) {
    const newRole = event.target.value;
    if (newRole === user.role) return;

    this.updatingUserId = user.id;
    this.subscription.add(
      this.adminService.updateUserRole(user.id, newRole).subscribe({
        next: (updatedUser) => {
          user.role = updatedUser.role;
          this.notificationService.success('Updated', `User role updated to ${newRole}`);
          this.updatingUserId = null;
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.notificationService.saveError('user role update');
          this.updatingUserId = null;
          // Revert the select value
          event.target.value = user.role;
        }
      })
    );
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getUsersByRole(role: string): number {
    if (!this.usersResponse) return 0;
    return this.usersResponse.users.filter(user => user.role === role).length;
  }

  getTotalApplications(): number {
    if (!this.usersResponse) return 0;
    return this.usersResponse.users.reduce((total, user) => total + user.loanApplicationsCount, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}