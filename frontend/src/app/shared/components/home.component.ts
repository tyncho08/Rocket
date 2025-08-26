import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero">
        <div class="hero-content">
          <h1>Welcome to LendPro</h1>
          <p>Your one-stop solution for home search, mortgage tools, and loan management</p>
          <div class="cta-buttons">
            <a routerLink="/search" class="btn btn-primary">Search Homes</a>
            <a routerLink="/mortgage-tools" class="btn btn-secondary">Mortgage Calculator</a>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <h3>Home Search</h3>
            <p>Browse thousands of properties with advanced filtering options</p>
            <a routerLink="/search" class="feature-link">Search Now</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="1" height="1"/>
                <rect x="14" y="9" width="1" height="1"/>
                <rect x="9" y="14" width="1" height="1"/>
                <rect x="14" y="14" width="1" height="1"/>
              </svg>
            </div>
            <h3>Mortgage Tools</h3>
            <p>Calculate payments, check eligibility, and view amortization schedules</p>
            <a routerLink="/mortgage-tools" class="feature-link">Try Tools</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
              </svg>
            </div>
            <h3>Loan Management</h3>
            <p>Apply for loans, track applications, and manage your mortgage</p>
            <a routerLink="/dashboard" class="feature-link">Get Started</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <h3>Market Trends</h3>
            <p>Analyze market data, price trends, and neighborhood analytics</p>
            <a routerLink="/market-trends" class="feature-link">View Trends</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .hero {
      text-align: center;
      padding: 4rem 0;
      background: #1a365d;
      color: #ffffff;
      border-radius: 0.75rem;
      margin-bottom: 4rem;
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .hero h1,
    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #ffffff !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: #ffffff !important;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background-color: var(--accent-success);
      color: var(--text-white);
      border: 1px solid var(--accent-success);
    }

    .btn-primary:hover {
      background-color: #2d7a4b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--text-white);
      border: 1px solid var(--text-white);
    }

    .btn-secondary:hover {
      background-color: var(--text-white);
      color: var(--primary-dark);
    }

    .features {
      padding: 2rem 0;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: var(--background-primary);
      padding: 2rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
      text-align: center;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .feature-icon {
      margin-bottom: 1rem;
      color: var(--primary-dark);
      display: flex;
      justify-content: center;
    }

    .feature-icon svg {
      width: 48px;
      height: 48px;
      stroke: var(--primary-dark);
    }

    .feature-card h3 {
      color: var(--primary-dark);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .feature-card p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .feature-link {
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-dark);
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .feature-link:hover {
      background-color: var(--primary-dark);
      color: var(--text-white);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px var(--shadow-medium);
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .hero-content p {
        font-size: 1rem;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {}