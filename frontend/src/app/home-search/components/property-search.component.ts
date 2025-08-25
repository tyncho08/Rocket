import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property, PropertySearchFilters, PropertySearchResult } from '../../shared/models/property.model';

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Find Your Dream Home</h1>
        <p>Search through thousands of properties to find the perfect match</p>
      </div>

      <!-- Search Filters -->
      <form [formGroup]="searchForm" class="search-filters">
        <div class="filter-row">
          <div class="filter-group">
            <label for="city">City</label>
            <input 
              type="text" 
              id="city" 
              formControlName="city" 
              placeholder="Enter city name"
              class="filter-input"
            />
          </div>
          
          <div class="filter-group">
            <label for="state">State</label>
            <select id="state" formControlName="state" class="filter-select">
              <option value="">All States</option>
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="propertyType">Property Type</label>
            <select id="propertyType" formControlName="propertyType" class="filter-select">
              <option value="">All Types</option>
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label>Price Range</label>
            <div class="price-inputs">
              <input 
                type="number" 
                formControlName="minPrice" 
                placeholder="Min price"
                class="filter-input price-input"
              />
              <span>to</span>
              <input 
                type="number" 
                formControlName="maxPrice" 
                placeholder="Max price"
                class="filter-input price-input"
              />
            </div>
          </div>

          <div class="filter-group">
            <label>Bedrooms</label>
            <div class="bedroom-buttons">
              <button 
                *ngFor="let bed of bedroomOptions" 
                type="button"
                class="bedroom-btn"
                [class.active]="searchForm.get('minBedrooms')?.value === bed"
                (click)="setMinBedrooms(bed)"
              >
                {{ bed === 5 ? '5+' : bed }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label>Bathrooms</label>
            <div class="bathroom-buttons">
              <button 
                *ngFor="let bath of bathroomOptions" 
                type="button"
                class="bathroom-btn"
                [class.active]="searchForm.get('minBathrooms')?.value === bath"
                (click)="setMinBathrooms(bath)"
              >
                {{ bath === 4 ? '4+' : bath }}
              </button>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button type="button" (click)="clearFilters()" class="btn btn-secondary">
            Clear Filters
          </button>
          <button type="button" (click)="searchProperties()" class="btn btn-primary">
            Search Properties
          </button>
        </div>
      </form>

      <!-- Search Results -->
      <div class="search-results" *ngIf="searchResults">
        <div class="results-header">
          <div class="results-count">
            <h3>{{ searchResults.totalCount }} Properties Found</h3>
            <p>Showing {{ ((searchResults.page - 1) * searchResults.pageSize) + 1 }} - 
               {{ Math.min(searchResults.page * searchResults.pageSize, searchResults.totalCount) }} 
               of {{ searchResults.totalCount }} results</p>
          </div>
          
          <div class="sort-controls">
            <label for="sortBy">Sort by:</label>
            <select 
              id="sortBy" 
              [(ngModel)]="currentSort.sortBy" 
              (change)="onSortChange()"
              class="sort-select"
            >
              <option value="ListedDate">Newest First</option>
              <option value="Price">Price</option>
              <option value="Bedrooms">Bedrooms</option>
            </select>
            
            <button 
              type="button" 
              class="sort-order-btn"
              (click)="toggleSortOrder()"
              [title]="currentSort.sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'"
            >
              {{ currentSort.sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Searching properties...</p>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="!loading" class="properties-grid">
          <div 
            *ngFor="let property of searchResults.properties" 
            class="property-card"
          >
            <div class="property-image">
              <img 
                [src]="property.imageUrl || 'assets/images/property-placeholder.jpg'" 
                [alt]="property.address"
                (error)="onImageError($event)"
              />
              <button 
                class="favorite-btn"
                [class.active]="property.isFavorite"
                (click)="toggleFavorite(property)"
                title="{{ property.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}"
              >
                {{ property.isFavorite ? '❤️' : '🤍' }}
              </button>
            </div>
            
            <div class="property-details">
              <div class="property-price">
                {{ formatCurrency(property.price) }}
              </div>
              
              <div class="property-address">
                {{ property.address }}
              </div>
              
              <div class="property-location">
                {{ property.city }}, {{ property.state }} {{ property.zipCode }}
              </div>
              
              <div class="property-specs">
                <span class="spec">{{ property.bedrooms }} bed</span>
                <span class="spec">{{ property.bathrooms }} bath</span>
                <span class="spec">{{ formatNumber(property.squareFeet) }} sqft</span>
              </div>
              
              <div class="property-type">
                {{ property.propertyType }}
              </div>
              
              <div class="property-actions">
                <button 
                  [routerLink]="['/properties', property.id]" 
                  class="btn btn-primary btn-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && searchResults.properties.length === 0" class="empty-state">
          <div class="empty-icon">🏠</div>
          <h3>No properties found</h3>
          <p>Try adjusting your search filters to see more results</p>
          <button (click)="clearFilters()" class="btn btn-primary">
            Clear Filters
          </button>
        </div>

        <!-- Pagination -->
        <div *ngIf="searchResults.totalPages > 1" class="pagination">
          <button 
            (click)="goToPage(searchResults.page - 1)"
            [disabled]="searchResults.page <= 1"
            class="pagination-btn"
          >
            Previous
          </button>
          
          <div class="pagination-numbers">
            <button 
              *ngFor="let page of getPageNumbers()" 
              (click)="goToPage(page)"
              class="pagination-number"
              [class.active]="page === searchResults.page"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            (click)="goToPage(searchResults.page + 1)"
            [disabled]="searchResults.page >= searchResults.totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .search-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .search-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .search-header p {
      font-size: 1.1rem;
      color: #6c757d;
    }

    .search-filters {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .filter-input, .filter-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-input {
      flex: 1;
    }

    .bedroom-buttons, .bathroom-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .bedroom-btn, .bathroom-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .bedroom-btn.active, .bathroom-btn.active {
      border-color: #3498db;
      background-color: #3498db;
      color: white;
    }

    .filter-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      text-align: center;
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

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .property-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s;
    }

    .property-card:hover {
      transform: translateY(-5px);
    }

    .property-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .favorite-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .property-details {
      padding: 1.5rem;
    }

    .property-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .property-address {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .property-location {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .property-specs {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .spec {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .property-type {
      color: #3498db;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .property-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
    }

    .loading-spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .pagination-btn, .pagination-number {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 6px;
      cursor: pointer;
    }

    .pagination-number.active {
      background-color: #3498db;
      color: white;
      border-color: #3498db;
    }

    @media (max-width: 768px) {
      .search-container {
        padding: 1rem;
      }
      
      .filter-row {
        grid-template-columns: 1fr;
      }
      
      .properties-grid {
        grid-template-columns: 1fr;
      }
      
      .results-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class PropertySearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  searchResults: PropertySearchResult | null = null;
  loading = false;
  bedroomOptions = [1, 2, 3, 4, 5];
  bathroomOptions = [1, 2, 3, 4];
  currentSort = { sortBy: 'ListedDate', sortOrder: 'desc' };
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      city: [''],
      state: [''],
      propertyType: [''],
      minPrice: [null],
      maxPrice: [null],
      minBedrooms: [null],
      maxBedrooms: [null],
      minBathrooms: [null],
      maxBathrooms: [null]
    });
  }

  ngOnInit(): void {
    // Auto-search when form values change (debounced)
    this.subscriptions.add(
      this.searchForm.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
        if (this.hasSearchCriteria()) {
          this.searchProperties();
        }
      })
    );

    // Initial search to show all properties
    this.searchProperties();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  searchProperties(): void {
    this.loading = true;
    
    const filters: PropertySearchFilters = {
      ...this.searchForm.value,
      page: this.searchResults?.page || 1,
      pageSize: 12,
      sortBy: this.currentSort.sortBy,
      sortOrder: this.currentSort.sortOrder
    };

    this.propertyService.searchProperties(filters).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Search Failed', 'Unable to load properties');
        this.loading = false;
        console.error('Search error:', error);
      }
    });
  }

  toggleFavorite(property: Property): void {
    this.propertyService.toggleFavorite(property.id).subscribe({
      next: (result) => {
        property.isFavorite = result.isFavorite;
        const action = result.isFavorite ? 'added to' : 'removed from';
        this.notificationService.success(
          'Favorites Updated', 
          `Property ${action} your favorites`
        );
      },
      error: () => {
        this.notificationService.error('Error', 'Please log in to manage favorites');
      }
    });
  }


  setMinBedrooms(beds: number): void {
    const current = this.searchForm.get('minBedrooms')?.value;
    this.searchForm.patchValue({
      minBedrooms: current === beds ? null : beds
    });
  }

  setMinBathrooms(baths: number): void {
    const current = this.searchForm.get('minBathrooms')?.value;
    this.searchForm.patchValue({
      minBathrooms: current === baths ? null : baths
    });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.currentSort = { sortBy: 'ListedDate', sortOrder: 'desc' };
    this.searchProperties();
  }

  onSortChange(): void {
    this.searchProperties();
  }

  toggleSortOrder(): void {
    this.currentSort.sortOrder = this.currentSort.sortOrder === 'asc' ? 'desc' : 'asc';
    this.searchProperties();
  }

  goToPage(page: number): void {
    if (this.searchResults && page >= 1 && page <= this.searchResults.totalPages) {
      this.searchResults.page = page;
      this.searchProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    if (!this.searchResults) return [];
    
    const current = this.searchResults.page;
    const total = this.searchResults.totalPages;
    const pages: number[] = [];
    
    // Show up to 5 page numbers around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasSearchCriteria(): boolean {
    const formValue = this.searchForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
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
    event.target.src = 'assets/images/property-placeholder.jpg';
  }

  // Add to module imports
  Math = Math;
}