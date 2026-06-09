import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
import { Team } from '../../../core/models/team.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
  private votingService = inject(VotingService);

  teams: Team[] = [];
  groups: { [key: string]: Team[] } = {};
  groupKeys: string[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.votingService.getTeams().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.teams = res.data;
          this.groupTeams();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load seeded FIFA World Cup teams.';
      }
    });
  }

  groupTeams(): void {
    this.groups = {};
    
    // Sort teams by name to show them cleanly
    const sorted = [...this.teams].sort((a, b) => a.name.localeCompare(b.name));

    sorted.forEach(team => {
      const gp = team.group ? team.group.toUpperCase() : 'OTHER';
      if (!this.groups[gp]) {
        this.groups[gp] = [];
      }
      this.groups[gp].push(team);
    });

    // Sort group keys alphabetically (Group A, Group B, etc.)
    this.groupKeys = Object.keys(this.groups).sort();
  }
}
