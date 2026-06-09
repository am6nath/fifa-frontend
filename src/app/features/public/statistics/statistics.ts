import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
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
  private route = inject(ActivatedRoute);

  sessionId = 0;
  session: VotingSession | null = null;
  results: VotingResult[] = [];
  sessionTitle = 'Voting Poll Results';
  totalVotes = 0;
  isLoading = true;
  errorMessage: string | null = null;
  isLive = false;
  chart: any = null;

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
        }
      }
    });
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const resultsObservable = this.isLive 
      ? this.votingService.getLiveResults(this.sessionId)
      : this.votingService.getSessionResults(this.sessionId);

    resultsObservable.subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.results = res.data;
          this.totalVotes = this.results.reduce((sum, item) => sum + item.voteCount, 0);
          
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

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('resultsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.results.map(r => `${r.teamName} (${r.teamCode})`);
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
