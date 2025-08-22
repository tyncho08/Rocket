import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property } from '../../shared/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="property-detail-container" *ngIf="property; else loading">
      <div class="property-header">
        <button 
          class="back-button" 
          (click)="goBack()"
          aria-label="Go back to search results"
        >
          ← Back to Search
        </button>
        
        <button 
          class="favorite-btn"
          [class.active]="property.isFavorite"
          (click)="toggleFavorite()"
          title="{{ property.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}"
        >
          {{ property.isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites' }}
        </button>
      </div>

      <div class="property-main">
        <div class="property-image-section">
          <div class="main-image">
            <img 
              [src]="property.imageUrl || '/assets/images/property-placeholder.jpg'" 
              [alt]="property.address"
              (error)="onImageError($event)"
            />
          </div>
        </div>

        <div class="property-info-section">
          <div class="property-price">
            {{ formatCurrency(property.price) }}
          </div>

          <div class="property-address">
            <h1>{{ property.address }}</h1>
            <p class="location">{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
          </div>

          <div class="property-highlights">
            <div class="highlight-item">
              <div class="highlight-value">{{ property.bedrooms }}</div>
              <div class="highlight-label">Bedrooms</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ property.bathrooms }}</div>
              <div class="highlight-label">Bathrooms</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ formatNumber(property.squareFeet) }}</div>
              <div class="highlight-label">Sq Ft</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ property.propertyType }}</div>
              <div class="highlight-label">Type</div>
            </div>
          </div>

          <div class="property-actions">
            <button 
              [routerLink]="['/mortgage-tools']" 
              [queryParams]="{propertyPrice: property.price}"
              class="btn btn-primary btn-large"
            >
              🧮 Calculate Mortgage
            </button>
            <button 
              (click)="contactAgent()" 
              class="btn btn-secondary btn-large"
            >
              📞 Contact Agent
            </button>
          </div>
        </div>
      </div>

      <div class="property-details">
        <div class="details-section">
          <h2>Property Details</h2>
          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Property Type:</span>
              <span class="detail-value">{{ property.propertyType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Square Feet:</span>
              <span class="detail-value">{{ formatNumber(property.squareFeet) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bedrooms:</span>
              <span class="detail-value">{{ property.bedrooms }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bathrooms:</span>
              <span class="detail-value">{{ property.bathrooms }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price per Sq Ft:</span>
              <span class="detail-value">{{ formatCurrency(property.price / property.squareFeet) }}</span>
            </div>
          </div>
        </div>

        <div class="description-section" *ngIf="property.description">
          <h2>Description</h2>
          <p class="property-description">{{ property.description }}</p>
        </div>

        <div class="mortgage-estimation">
          <h2>Estimated Monthly Payment</h2>
          <div class="mortgage-preview">
            <div class="mortgage-assumptions">
              <p>Based on a 30-year fixed-rate mortgage with 20% down payment at 6.5% APR:</p>
            </div>
            <div class="payment-estimate">
              <div class="payment-amount">{{ formatCurrency(estimatedPayment) }}/month</div>
              <div class="payment-breakdown">
                <small>
                  Loan Amount: {{ formatCurrency(property.price * 0.8) }} • 
                  Down Payment: {{ formatCurrency(property.price * 0.2) }}
                </small>
              </div>
            </div>
            <button 
              [routerLink]="['/mortgage-tools']" 
              [queryParams]="{propertyPrice: property.price}"
              class="btn btn-outline"
            >
              Get Detailed Calculation
            </button>
          </div>
        </div>

        <div class="nearby-properties" *ngIf="similarProperties.length > 0">
          <h2>Similar Properties</h2>
          <div class="similar-properties-grid">
            <div 
              *ngFor="let similar of similarProperties" 
              class="similar-property-card"
              [routerLink]="['/properties', similar.id]"
            >
              <img 
                [src]="similar.imageUrl || '/assets/images/property-placeholder.jpg'" 
                [alt]="similar.address"
                (error)="onImageError($event)"
              />
              <div class="similar-property-info">
                <div class="similar-price">{{ formatCurrency(similar.price) }}</div>
                <div class="similar-specs">{{ similar.bedrooms }}bd • {{ similar.bathrooms }}ba</div>
                <div class="similar-address">{{ similar.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .property-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-button {
      background: none;
      border: 1px solid #dee2e6;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      color: #6c757d;
      transition: all 0.3s;
    }

    .back-button:hover {
      background-color: #f8f9fa;
      border-color: #6c757d;
    }

    .favorite-btn {
      background: none;
      border: 2px solid #e74c3c;
      color: #e74c3c;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .favorite-btn.active {
      background-color: #e74c3c;
      color: white;
    }

    .property-main {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .property-image-section {
      position: relative;
    }

    .main-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 12px;
    }

    .property-info-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      height: fit-content;
    }

    .property-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .property-address h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .location {
      color: #6c757d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .property-highlights {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .highlight-item {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .highlight-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3498db;
      margin-bottom: 0.25rem;
    }

    .highlight-label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .property-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      transition: all 0.3s;
    }

    .btn-large {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
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

    .property-details {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .details-section, .description-section, .mortgage-estimation, .nearby-properties {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .details-section h2, .description-section h2, .mortgage-estimation h2, .nearby-properties h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .details-grid {
      display: grid;
      gap: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .detail-label {
      font-weight: 600;
      color: #6c757d;
    }

    .detail-value {
      color: #2c3e50;
      font-weight: 500;
    }

    .property-description {
      line-height: 1.6;
      color: #495057;
      font-size: 1.1rem;
    }

    .mortgage-preview {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .payment-estimate {
      text-align: center;
      margin: 1rem 0;
    }

    .payment-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .payment-breakdown {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .similar-properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .similar-property-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
    }

    .similar-property-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .similar-property-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .similar-property-info {
      padding: 1rem;
    }

    .similar-price {
      font-weight: 700;
      color: #3498db;
      margin-bottom: 0.25rem;
    }

    .similar-specs {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .similar-address {
      font-size: 0.9rem;
      color: #495057;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .property-detail-container {
        padding: 1rem;
      }

      .property-header {
        flex-direction: column;
        gap: 1rem;
      }

      .property-main {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .property-highlights {
        grid-template-columns: repeat(2, 1fr);
      }

      .similar-properties-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  property: Property | null = null;
  similarProperties: Property[] = [];
  estimatedPayment = 0;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.loadProperty(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.calculateEstimatedPayment();
        this.loadSimilarProperties();
      },
      error: (error) => {
        this.notificationService.error('Error', 'Unable to load property details');
        console.error('Property load error:', error);
        this.router.navigate(['/search']);
      }
    });
  }

  loadSimilarProperties(): void {
    if (!this.property) return;

    // Search for similar properties in the same city with similar price range
    const filters = {
      city: this.property.city,
      state: this.property.state,
      minPrice: this.property.price * 0.8,
      maxPrice: this.property.price * 1.2,
      propertyType: this.property.propertyType,
      page: 1,
      pageSize: 3,
      sortBy: 'Price',
      sortOrder: 'asc'
    };

    this.propertyService.searchProperties(filters).subscribe({
      next: (results) => {
        // Filter out current property and take first 3
        this.similarProperties = results.properties
          .filter(p => p.id !== this.property!.id)
          .slice(0, 3);
      },
      error: () => {
        // Don't show error for similar properties as it's not critical
        this.similarProperties = [];
      }
    });
  }

  calculateEstimatedPayment(): void {
    if (!this.property) return;

    // Simple mortgage calculation: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    const loanAmount = this.property.price * 0.8; // 80% loan
    const monthlyRate = 0.065 / 12; // 6.5% APR
    const numberOfPayments = 30 * 12; // 30 years

    this.estimatedPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  toggleFavorite(): void {
    if (!this.property) return;

    this.propertyService.toggleFavorite(this.property.id).subscribe({
      next: (result) => {
        if (this.property) {
          this.property.isFavorite = result.isFavorite;
          const action = result.isFavorite ? 'added to' : 'removed from';
          this.notificationService.success(
            'Favorites Updated', 
            `Property ${action} your favorites`
          );
        }
      },
      error: () => {
        this.notificationService.error('Error', 'Please log in to manage favorites');
      }
    });
  }

  contactAgent(): void {
    this.notificationService.info(
      'Contact Agent', 
      'Agent contact feature coming soon!'
    );
  }

  goBack(): void {
    this.router.navigate(['/search']);
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