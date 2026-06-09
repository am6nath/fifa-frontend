import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
import { AuthService } from '../../../core/services/auth.service';
import { VotingResult } from '../../../core/models/stats.model';
import { VotingSession } from '../../../core/models/session.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private votingService = inject(VotingService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  sessionId = 0;
  session: VotingSession | null = null;
  results: VotingResult[] = [];
  paginatedResults: VotingResult[] = [];
  allTeams: any[] = [];
  pollTeams: any[] = [];
  sessionTitle = 'Voting Poll Results';
  totalVotes = 0;
  isLoading = true;
  errorMessage: string | null = null;
  isLive = false;
  chart: any = null;

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['id'];
      this.isLive = this.route.snapshot.queryParams['live'] === 'true';
      if (this.sessionId) {
        this.loadSessionDetails();
        this.loadResults();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadSessionDetails(): void {
    this.votingService.getSessionById(this.sessionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.session = res.data;
          this.loadPollTeams();
        }
      }
    });
  }

  loadPollTeams(): void {
    this.votingService.getTeams(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.allTeams = res.data;
          if (this.session) {
            const teamIds = this.session.teamIds || [];
            const region = this.session.regionFilter || '';
            
            this.pollTeams = this.allTeams.filter(team => {
              if (teamIds.length > 0 && !teamIds.includes(team.id)) return false;
              if (region && team.region.toLowerCase() !== region.toLowerCase()) return false;
              return true;
            });
          }
        }
      }
    });
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.isLive && !this.authService.isAdmin()) {
      this.isLoading = false;
      this.errorMessage = 'Access Denied: Live standings are only accessible by administrators. Official results will be available once published.';
      return;
    }

    const resultsObservable = this.isLive 
      ? this.votingService.getLiveResults(this.sessionId)
      : this.votingService.getSessionResults(this.sessionId);

    resultsObservable.subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.results = res.data;
          this.totalVotes = this.results.reduce((sum, item) => sum + item.voteCount, 0);
          
          this.totalRecords = this.results.length;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
          this.pageNumber = 1;
          this.updatePage();

          if (this.results.length > 0) {
            this.sessionTitle = this.isLive ? 'Live Standings' : 'Official Poll Results';
            // Wait for DOM to render the canvas element
            setTimeout(() => {
              this.createChart();
            }, 0);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load results. Results might not be published yet.';
      }
    });
  }

  updatePage(): void {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.results.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.updatePage();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.updatePage();
    }
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
      'AUT': 'at', 'TUR': 'tr', 'UKR': 'ua', 'GRE': 'gr', 
      'NGA': 'ng', 'EGY': 'eg', 'RSA': 'za', 'CIV': 'ci', 
      'ALG': 'dz', 'COL': 'co', 'CHI': 'cl', 'PER': 'pe', 
      'CHN': 'cn', 'IND': 'in', 'NZL': 'nz'
    };
    const code = mapping[cc] || cc.toLowerCase();
    return `https://flagcdn.com/w80/${code}.png`;
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('resultsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.results.map(r => `${r.teamName} (${r.countryCode})`);
    const data = this.results.map(r => r.voteCount);
    
    // Highlight top winners based on session winnersCount (default to 1)
    const winnersLimit = this.session?.winnersCount || 1;
    const backgroundColors = this.results.map(r => 
      r.rank <= winnersLimit ? '#2563eb' : '#d1d5db'
    );

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Votes Cast',
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          barThickness: 20
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              precision: 0
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}
