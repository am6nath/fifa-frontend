import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Team } from '../models/team.model';
import { VotingSession } from '../models/session.model';
import { UserProfile } from '../models/auth.model';
import { AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // --- Teams CRUD ---
  createTeam(team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.post<ApiResponse<Team>>(`${this.baseUrl}/Teams`, team);
  }

  updateTeam(id: number, team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.put<ApiResponse<Team>>(`${this.baseUrl}/Teams/${id}`, team);
  }

  deleteTeam(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/Teams/${id}`);
  }

  // --- Voting Sessions CRUD ---
  getAllSessions(): Observable<ApiResponse<VotingSession[]>> {
    return this.http.get<ApiResponse<VotingSession[]>>(`${this.baseUrl}/voting-sessions`);
  }

  getSessionById(id: number): Observable<ApiResponse<VotingSession>> {
    return this.http.get<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions/${id}`);
  }

  createSession(session: any): Observable<ApiResponse<VotingSession>> {
    return this.http.post<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions`, session);
  }

  updateSession(id: number, session: any): Observable<ApiResponse<VotingSession>> {
    return this.http.put<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions/${id}`, session);
  }

  closeSession(id: number): Observable<ApiResponse<VotingSession>> {
    return this.http.post<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions/${id}/close`, {});
  }

  publishSession(id: number): Observable<ApiResponse<VotingSession>> {
    return this.http.post<ApiResponse<VotingSession>>(`${this.baseUrl}/voting-sessions/${id}/publish`, {});
  }

  // --- Users Management (Paginated) ---
  getUsers(pageNumber: number, pageSize: number, searchTerm?: string): Observable<ApiResponse<PagedResponse<UserProfile>>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('Search', searchTerm);
    }

    return this.http.get<ApiResponse<PagedResponse<UserProfile>>>(`${this.baseUrl}/Users`, { params });
  }

  toggleUserActive(userId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/Users/${userId}/toggle-active`, {});
  }

  // --- Audit Logs (Paginated) ---
  getAuditLogs(
    pageNumber: number,
    pageSize: number,
    action?: string,
    entityName?: string,
    username?: string
  ): Observable<ApiResponse<PagedResponse<AuditLog>>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (action) params = params.set('Action', action);
    if (entityName) params = params.set('EntityName', entityName);
    if (username) params = params.set('Username', username);

    return this.http.get<ApiResponse<PagedResponse<AuditLog>>>(`${this.baseUrl}/audit-logs`, { params });
  }
}
