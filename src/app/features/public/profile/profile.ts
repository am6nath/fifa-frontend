import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { VotingService } from '../../../core/services/voting.service';
import { UserProfile } from '../../../core/models/auth.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private votingService = inject(VotingService);

  profile: UserProfile | null = null;
  myVotes: any[] = [];
  isLoading = true;
  isLoadingVotes = true;
  errorMessage: string | null = null;
  votesErrorMessage: string | null = null;

  ngOnInit(): void {
    this.loadProfile();
    this.loadVotingHistory();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.profile = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load voter profile details.';
      }
    });
  }

  loadVotingHistory(): void {
    this.isLoadingVotes = true;
    this.votingService.getMyVoteHistory().subscribe({
      next: (res) => {
        this.isLoadingVotes = false;
        if (res.success) {
          this.myVotes = res.data || [];
        }
      },
      error: () => {
        this.isLoadingVotes = false;
        this.votesErrorMessage = 'Failed to load your voting history.';
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
      'AUT': 'at', 'TUR': 'tr', 'UKR': 'ua', 'GRE': 'gr', 
      'NGA': 'ng', 'EGY': 'eg', 'RSA': 'za', 'CIV': 'ci', 
      'ALG': 'dz', 'COL': 'co', 'CHI': 'cl', 'PER': 'pe', 
      'CHN': 'cn', 'IND': 'in', 'NZL': 'nz'
    };
    const code = mapping[cc] || cc.toLowerCase();
    return `https://flagcdn.com/w80/${code}.png`;
  }
}
