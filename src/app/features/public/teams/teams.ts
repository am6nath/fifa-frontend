import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VotingService } from '../../../core/services/voting.service';
import { Team } from '../../../core/models/team.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, FormsModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
  private votingService = inject(VotingService);

  teams: Team[] = [];
  filteredTeams: Team[] = [];
  paginatedTeams: Team[] = [];

  pageNumber = 1;
  pageSize = 15;
  totalPages = 1;
  totalRecords = 0;

  searchTerm = '';
  selectedRegion = '';
  regions: string[] = ['Asia', 'Europe', 'Africa', 'North America', 'South America'];
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
          this.applyFilters();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load seeded FIFA World Cup teams.';
      }
    });
  }

  applyFilters(): void {
    let temp = [...this.teams];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      temp = temp.filter(t => t.name.toLowerCase().includes(term) || t.countryCode.toLowerCase().includes(term));
    }

    if (this.selectedRegion) {
      temp = temp.filter(t => t.region === this.selectedRegion);
    }

    this.filteredTeams = temp.sort((a, b) => a.name.localeCompare(b.name));
    this.totalRecords = this.filteredTeams.length;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
    
    if (this.pageNumber > this.totalPages) {
      this.pageNumber = 1;
    }
    
    this.updatePage();
  }

  updatePage(): void {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTeams = this.filteredTeams.slice(startIndex, endIndex);
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

  onSearchChange(): void {
    this.pageNumber = 1;
    this.applyFilters();
  }

  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.pageNumber = 1;
    this.applyFilters();
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
