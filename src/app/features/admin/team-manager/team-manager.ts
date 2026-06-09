import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { VotingService } from '../../../core/services/voting.service';
import { Team } from '../../../core/models/team.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-team-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent],
  templateUrl: './team-manager.html',
  styleUrl: './team-manager.css'
})
export class TeamManagerComponent implements OnInit {
  private adminService = inject(AdminService);
  private votingService = inject(VotingService);
  private fb = inject(FormBuilder);

  teams: Team[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  teamForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
    group: ['', [Validators.required, Validators.maxLength(2)]],
    region: ['', [Validators.required, Validators.maxLength(50)]],
    logoUrl: ['', [Validators.maxLength(500)]]
  });

  isEditing = false;
  editingTeamId: number | null = null;
  showFormModal = false;

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
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load teams.';
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingTeamId = null;
    this.teamForm.reset();
    this.showFormModal = true;
  }

  openEditModal(team: Team): void {
    this.isEditing = true;
    this.editingTeamId = team.id;
    this.teamForm.patchValue({
      name: team.name,
      code: team.code,
      group: team.group,
      region: team.region,
      logoUrl: team.logoUrl
    });
    this.showFormModal = true;
  }

  closeModal(): void {
    this.showFormModal = false;
    this.teamForm.reset();
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const teamData = this.teamForm.value;

    if (this.isEditing && this.editingTeamId) {
      this.adminService.updateTeam(this.editingTeamId, teamData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = 'Team updated successfully.';
            this.closeModal();
            this.loadTeams();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to update team.';
        }
      });
    } else {
      this.adminService.createTeam(teamData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = 'Team created successfully.';
            this.closeModal();
            this.loadTeams();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to create team.';
        }
      });
    }
  }

  deleteTeam(id: number): void {
    if (!confirm('Are you sure you want to delete this team? This acts as a soft-delete.')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminService.deleteTeam(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Team soft-deleted successfully.';
          this.loadTeams();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to delete team.';
      }
    });
  }

  toggleTeamStatus(team: Team): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminService.updateTeam(team.id, { ...team, isActive: !team.isActive }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = `Team status changed to ${!team.isActive ? 'Active' : 'Inactive'}.`;
          this.loadTeams();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to toggle status.';
      }
    });
  }
}
