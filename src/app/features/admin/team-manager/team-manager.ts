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

  allTeams: Team[] = [];
  paginatedTeams: Team[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination
  pageNumber = 1;
  pageSize = 15;
  totalPages = 1;
  totalRecords = 0;

  teamForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    countryCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
    groupName: ['', [Validators.required, Validators.maxLength(10)]],
    region: ['', [Validators.required, Validators.maxLength(50)]],
    coachName: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    flagUrl: ['', [Validators.maxLength(500)]]
  });

  isEditing = false;
  editingTeamId: number | null = null;
  showFormModal = false;

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.votingService.getTeams(true).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.allTeams = res.data;
          this.totalRecords = this.allTeams.length;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
          if (this.pageNumber > this.totalPages) this.pageNumber = 1;
          this.updatePage();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load teams.';
      }
    });
  }

  updatePage(): void {
    const start = (this.pageNumber - 1) * this.pageSize;
    this.paginatedTeams = this.allTeams.slice(start, start + this.pageSize);
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
      countryCode: team.countryCode,
      groupName: team.groupName,
      region: team.region,
      coachName: team.coachName || '',
      description: team.description || '',
      flagUrl: team.flagUrl || ''
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

    const currentTeam = this.allTeams.find(t => t.id === this.editingTeamId);
    const teamData = {
      ...this.teamForm.value,
      isActive: this.isEditing && currentTeam ? currentTeam.isActive : true
    };

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

    const payload = {
      name: team.name,
      countryCode: team.countryCode,
      groupName: team.groupName,
      region: team.region,
      coachName: team.coachName || '',
      description: team.description || '',
      flagUrl: team.flagUrl || '',
      isActive: !team.isActive
    };

    this.adminService.updateTeam(team.id, payload).subscribe({
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
