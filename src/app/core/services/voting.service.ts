import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { VotingSession } from '../models/session.model';
import { Team } from '../models/team.model';
import { VotingResult, DashboardStats } from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // GET: Fetch currently active voting sessions
  getActiveSessions(): Observable<ApiResponse<VotingSession[]>> {
    return this.http.get<ApiResponse<VotingSession[]>>(`${this.baseUrl}/voting-sessions/active`);
  }

  // GET: Fetch published historical results for a session
  getSessionResults(sessionId: number): Observable<ApiResponse<VotingResult[]>> {
    return this.http.get<ApiResponse<VotingResult[]>>(`${this.baseUrl}/Statistics/results/${sessionId}`);
  }

  // GET: Fetch a single session by ID
  getSessionById(sessionId: number): Observable<ApiResponse<VotingSession>> {
    return this.http.get<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions/${sessionId}`);
  }

  // GET: Fetch live results for a session (available to voter or admin)
  getLiveResults(sessionId: number): Observable<ApiResponse<VotingResult[]>> {
    return this.http.get<ApiResponse<VotingResult[]>>(`${this.baseUrl}/Statistics/live/${sessionId}`);
  }

  // GET: Fetch dashboard statistics summary
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/Statistics/dashboard`);
  }

  // GET: Fetch active teams (all teams, optionally filtered)
  getTeams(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/Teams`);
  }

  // GET: Fetch a single team by ID
  getTeamById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/Teams/${id}`);
  }

  // POST: Cast a vote for a team candidate (uses currently active session)
  castVote(teamId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Votes`, { teamId });
  }

  // GET: Retrieve the user's vote for a session
  getMyVote(sessionId: number): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('sessionId', sessionId.toString());
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/Votes/my-vote`, { params });
  }

  // GET: Check if the user has already voted in a session
  hasVoted(sessionId: number): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('sessionId', sessionId.toString());
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/Votes/has-voted`, { params });
  }
}
