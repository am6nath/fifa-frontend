import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VotingService } from '../../../core/services/voting.service';
import { AuthService } from '../../../core/services/auth.service';
import { VotingSession } from '../../../core/models/session.model';
import { Team } from '../../../core/models/team.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-cast-vote',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './cast-vote.html',
  styleUrl: './cast-vote.css'
})
export class CastVoteComponent implements OnInit {
  private votingService = inject(VotingService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sessionId = 0;
  session: VotingSession | null = null;
  allTeams: Team[] = [];
  eligibleCandidates: Team[] = [];
  selectedTeamId: number | null = null;

  isLoading = true;
  isCasting = false;
  hasVoted = false;
  myVoteDetails: any = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['id'];
      if (this.sessionId) {
        this.loadSessionAndVotedStatus();
      }
    });
  }

  loadSessionAndVotedStatus(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.authService.isAuthenticated()) {
      this.loadVotingForm();
      return;
    }

    // Check if user has already voted
    this.votingService.hasVoted(this.sessionId).subscribe({
      next: (votedRes) => {
        if (votedRes.success && votedRes.data) {
          this.hasVoted = true;
          this.votingService.getMyVote(this.sessionId).subscribe({
            next: (voteDetailsRes) => {
              this.isLoading = false;
              if (voteDetailsRes.success) {
                this.myVoteDetails = voteDetailsRes.data;
              }
            }
          });
        } else {
          this.loadVotingForm();
        }
      },
      error: () => {
        // Fallback to loading form directly
        this.loadVotingForm();
      }
    });
  }

  loadVotingForm(): void {
    // Load all active sessions to find our session (or we can get all and filter, or fetch teams)
    this.votingService.getActiveSessions().subscribe({
      next: (sessionsRes) => {
        if (sessionsRes.success) {
          const sessionsArray = Array.isArray(sessionsRes.data) ? sessionsRes.data : (sessionsRes.data ? [sessionsRes.data] : []);
          this.session = sessionsArray.find(s => s.id === this.sessionId) || null;
          
          if (!this.session) {
            this.isLoading = false;
            this.errorMessage = 'This voting session is not active or closed.';
            return;
          }

          // Fetch all teams to filter candidate list
          this.votingService.getTeams().subscribe({
            next: (teamsRes) => {
              this.isLoading = false;
              if (teamsRes.success) {
                this.allTeams = teamsRes.data;
                this.filterEligibleCandidates();
              }
            },
            error: () => {
              this.isLoading = false;
              this.errorMessage = 'Failed to retrieve team candidates.';
            }
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load voting session details.';
      }
    });
  }

  filterEligibleCandidates(): void {
    if (!this.session) return;

    const sessionTeams = this.session.teamIds || [];
    const region = this.session.regionFilter || '';

    this.eligibleCandidates = this.allTeams.filter(team => {
      // Must be active
      if (!team.isActive) return false;

      // Filter by subset of teams if defined
      if (sessionTeams.length > 0) {
        if (!sessionTeams.includes(team.id)) return false;
      }

      // Filter by region if defined
      if (region) {
        if (team.region.toLowerCase() !== region.toLowerCase()) return false;
      }

      return true;
    });
  }

  selectTeam(teamId: number): void {
    if (this.isCasting || this.hasVoted || !this.authService.isAuthenticated()) return;
    this.selectedTeamId = teamId;
  }

  submitVote(): void {
    if (!this.selectedTeamId || this.isCasting || this.hasVoted || !this.authService.isAuthenticated()) return;

    this.isCasting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.votingService.castVote(this.selectedTeamId).subscribe({
      next: (res) => {
        this.isCasting = false;
        if (res.success) {
          this.successMessage = 'Your vote has been locked and recorded successfully!';
          this.hasVoted = true;
          this.myVoteDetails = res.data;
          
          // Redirect to statistics results page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/results', this.sessionId], { queryParams: { live: 'true' } });
          }, 2000);
        }
      },
      error: (err) => {
        this.isCasting = false;
        this.errorMessage = err.error?.message || 'Failed to submit vote. Please try again.';
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
