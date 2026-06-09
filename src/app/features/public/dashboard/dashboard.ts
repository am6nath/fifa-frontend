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
        if (res.success) this.activeSessions = res.data;
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
}
