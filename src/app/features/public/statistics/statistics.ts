import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
import { VotingResult } from '../../../core/models/stats.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class StatisticsComponent implements OnInit {
  private votingService = inject(VotingService);
  private route = inject(ActivatedRoute);

  sessionId = 0;
  results: VotingResult[] = [];
  sessionTitle = 'Voting Poll Results';
  totalVotes = 0;
  isLoading = true;
  errorMessage: string | null = null;
  isLive = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['id'];
      this.isLive = this.route.snapshot.queryParams['live'] === 'true';
      if (this.sessionId) {
        this.loadResults();
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
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load results. Results might not be published yet.';
      }
    });
  }
}
