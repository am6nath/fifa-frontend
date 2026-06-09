import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardStats } from '../../../core/models/stats.model';
import { VotingSession } from '../../../core/models/session.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private votingService = inject(VotingService);
  authService = inject(AuthService);

  stats: DashboardStats | null = null;
  activeSessions: VotingSession[] = [];
  publishedSessions: VotingSession[] = [];
  teams: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Fetch dashboard stats, active sessions, and seeded teams in parallel
    this.votingService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) this.stats = res.data;
      }
    });

    this.votingService.getActiveSessions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeSessions = Array.isArray(res.data) ? res.data : [res.data];
        } else {
          this.activeSessions = [];
        }
      }
    });

    this.votingService.getAllSessions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.publishedSessions = res.data.filter(s => s.resultsPublished);
        }
      }
    });

    this.votingService.getTeams().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.teams = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load dashboard data. Check backend connectivity.';
      }
    });
  }

  getFlagUrl(countryCode: string, flagUrl?: string): string {
    if (flagUrl && flagUrl.startsWith('http') && !flagUrl.includes('flags.com')) {
      return flagUrl;
    }
    if (!countryCode) return '';
    const cc = countryCode.toUpperCase().trim();
    
    if (cc.length === 2) {
      return `https://flagcdn.com/w80/${cc.toLowerCase()}.png`;
    }

    const mapping: { [key: string]: string } = {
      'QAT': 'qa', 'ECU': 'ec', 'SEN': 'sn', 'NED': 'nl',
      'ENG': 'gb-eng', 'IRN': 'ir', 'USA': 'us', 'WAL': 'gb-wls',
      'ARG': 'ar', 'KSA': 'sa', 'MEX': 'mx', 'POL': 'pl',
      'FRA': 'fr', 'AUS': 'au', 'DEN': 'dk', 'TUN': 'tn',
      'ESP': 'es', 'CRC': 'cr', 'GER': 'de', 'JPN': 'jp',
      'BEL': 'be', 'CAN': 'ca', 'MAR': 'ma', 'CRO': 'hr',
      'BRA': 'br', 'SRB': 'rs', 'SUI': 'ch', 'CMR': 'cm',
      'POR': 'pt', 'GHA': 'gh', 'URU': 'uy', 'KOR': 'kr',
      'ITA': 'it', 'SWE': 'se', 'NOR': 'no', 'FIN': 'fi',
      'AUT': 'at', 'TUR': 'tr',
      'UKR': 'ua', 'GRE': 'gr', 'NGA': 'ng', 'EGY': 'eg',
      'RSA': 'za', 'CIV': 'ci', 'ALG': 'dz', 'COL': 'co',
      'CHI': 'cl', 'PER': 'pe', 'CHN': 'cn', 'IND': 'in', 'NZL': 'nz'
    };
    const code = mapping[cc] || cc.toLowerCase();
    return `https://flagcdn.com/w80/${code}.png`;
  }
}
