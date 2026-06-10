import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { VotingService } from '../../../core/services/voting.service';
import { VotingSession } from '../../../core/models/session.model';
import { Team } from '../../../core/models/team.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-session-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent],
  templateUrl: './session-manager.html',
  styleUrl: './session-manager.css'
})
export class SessionManagerComponent implements OnInit {
  private adminService = inject(AdminService);
  private votingService = inject(VotingService);
  private fb = inject(FormBuilder);

  sessions: VotingSession[] = [];
  teams: Team[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  sessionForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    notes: ['', [Validators.maxLength(500)]],
    votingStartAt: ['', [Validators.required]],
    votingEndAt: ['', [Validators.required]],
    regionFilter: [''],
    winnersCount: [1, [Validators.required, Validators.min(1), Validators.max(32)]],
    selectedTeamIds: [[]]
  });

  showCreateModal = false;
  selectedTeamsList: number[] = [];

  ngOnInit(): void {
    this.loadSessionsAndTeams();
    this.sessionForm.get('regionFilter')?.valueChanges.subscribe(region => {
      if (region) {
        this.selectedTeamsList = this.selectedTeamsList.filter(id => {
          const team = this.teams.find(t => t.id === id);
          return team && team.region.toLowerCase() === region.toLowerCase();
        });
      }
    });
  }

  getFilteredTeams(): Team[] {
    const region = this.sessionForm.get('regionFilter')?.value;
    if (!region) {
      return this.teams;
    }
    return this.teams.filter(t => t.region.toLowerCase() === region.toLowerCase());
  }

  loadSessionsAndTeams(): void {
    this.isLoading = true;
    this.adminService.getAllSessions().subscribe({
      next: (sessionsRes) => {
        if (sessionsRes.success) {
          this.sessions = sessionsRes.data;
        }
        
        this.votingService.getTeams().subscribe({
          next: (teamsRes) => {
            this.isLoading = false;
            if (teamsRes.success) {
              this.teams = teamsRes.data.filter(t => t.isActive);
            }
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to retrieve voting sessions.';
      }
    });
  }

  openCreateModal(): void {
    this.sessionForm.reset({ regionFilter: '', selectedTeamIds: [] });
    this.selectedTeamsList = [];
    this.showCreateModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.sessionForm.reset();
  }

  toggleTeamSelection(teamId: number): void {
    const idx = this.selectedTeamsList.indexOf(teamId);
    if (idx > -1) {
      this.selectedTeamsList.splice(idx, 1);
    } else {
      this.selectedTeamsList.push(teamId);
    }
  }

  isTeamSelected(teamId: number): boolean {
    return this.selectedTeamsList.includes(teamId);
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    const startVal = new Date(this.sessionForm.value.votingStartAt);
    const endVal = new Date(this.sessionForm.value.votingEndAt);
    if (startVal >= endVal) {
      this.errorMessage = 'Start Time must be chronologically before the End Time.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formVal = this.sessionForm.value;
    const sessionPayload = {
      title: formVal.title,
      notes: formVal.notes || null,
      votingStartAt: new Date(formVal.votingStartAt).toISOString(),
      votingEndAt: new Date(formVal.votingEndAt).toISOString(),
      regionFilter: formVal.regionFilter || null,
      winnersCount: formVal.winnersCount || 1,
      teamIds: this.selectedTeamsList.length > 0 ? this.selectedTeamsList : null
    };

    this.adminService.createSession(sessionPayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Voting session created successfully.';
          this.closeModal();
          this.loadSessionsAndTeams();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create voting session.';
      }
    });
  }

  closeSession(id: number): void {
    if (!confirm('Are you sure you want to CLOSE this session manually? This stops all live voting immediately.')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminService.closeSession(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Session has been closed successfully.';
          this.loadSessionsAndTeams();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to close session.';
      }
    });
  }

  publishSession(id: number): void {
    if (!confirm('Are you sure you want to PUBLISH this session? This reveals the final counts to the public.')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminService.publishSession(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Session results published successfully.';
          this.loadSessionsAndTeams();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to publish session results.';
      }
    });
  }
}
