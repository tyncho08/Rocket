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
          <h1>Welcome to Mortgage Platform</h1>
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
            <div class="feature-icon">🏠</div>
            <h3>Home Search</h3>
            <p>Browse thousands of properties with advanced filtering options</p>
            <a routerLink="/search" class="feature-link">Search Now</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🧮</div>
            <h3>Mortgage Tools</h3>
            <p>Calculate payments, check eligibility, and view amortization schedules</p>
            <a routerLink="/mortgage-tools" class="feature-link">Try Tools</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Loan Management</h3>
            <p>Apply for loans, track applications, and manage your mortgage</p>
            <a routerLink="/dashboard" class="feature-link">Get Started</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📈</div>
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
      background: linear-gradient(135deg, #3498db, #2c3e50);
      color: white;
      border-radius: 12px;
      margin-bottom: 4rem;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
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
      background-color: #e74c3c;
      color: white;
    }

    .btn-primary:hover {
      background-color: #c0392b;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background-color: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background-color: white;
      color: #2c3e50;
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
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .feature-link {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border: 2px solid #3498db;
      border-radius: 6px;
      transition: all 0.3s;
    }

    .feature-link:hover {
      background-color: #3498db;
      color: white;
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