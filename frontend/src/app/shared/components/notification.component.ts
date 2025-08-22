import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="notifications-container" [class]="'position-' + position">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByFn" 
        class="notification"
        [ngClass]="'notification-' + notification.type"
        [@slideInOut]
        (click)="removeNotification(notification.id)"
      >
        <div class="notification-header">
          <div class="notification-icon">{{ getIcon(notification.type) }}</div>
          <div class="notification-title">{{ notification.title }}</div>
          <button 
            class="notification-close" 
            (click)="removeNotification(notification.id)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div class="notification-message" *ngIf="notification.message">
          {{ notification.message }}
        </div>
        <div class="notification-actions" *ngIf="notification.actions">
          <button 
            *ngFor="let action of notification.actions"
            class="notification-action"
            (click)="action.action(); removeNotification(notification.id)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      z-index: 1000;
      max-width: 400px;
      pointer-events: none;
    }

    .position-top-right {
      top: 1rem;
      right: 1rem;
    }

    .position-top-left {
      top: 1rem;
      left: 1rem;
    }

    .position-bottom-right {
      bottom: 1rem;
      right: 1rem;
    }

    .position-bottom-left {
      bottom: 1rem;
      left: 1rem;
    }

    .position-top-center {
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .position-bottom-center {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 1rem;
      padding: 1rem;
      border-left: 4px solid;
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease;
    }

    .notification:hover {
      transform: translateX(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .notification-success {
      border-left-color: #28a745;
      background: linear-gradient(90deg, #f8fff9 0%, white 100%);
    }

    .notification-error {
      border-left-color: #dc3545;
      background: linear-gradient(90deg, #fff8f8 0%, white 100%);
    }

    .notification-warning {
      border-left-color: #ffc107;
      background: linear-gradient(90deg, #fffef8 0%, white 100%);
    }

    .notification-info {
      border-left-color: #17a2b8;
      background: linear-gradient(90deg, #f8fcff 0%, white 100%);
    }

    .notification-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .notification-icon {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }

    .notification-title {
      font-weight: 600;
      flex: 1;
      color: #2c3e50;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .notification-close:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: #343a40;
    }

    .notification-message {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .notification-actions {
      margin-top: 0.75rem;
      display: flex;
      gap: 0.5rem;
    }

    .notification-action {
      background: transparent;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #495057;
    }

    .notification-action:hover {
      background-color: #f8f9fa;
      border-color: #adb5bd;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notifications-container {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';
  
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  trackByFn(index: number, item: Notification): string {
    return item.id;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }
}