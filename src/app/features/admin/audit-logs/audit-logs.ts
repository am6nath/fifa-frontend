import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLog } from '../../../core/models/audit-log.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css'
})
export class AuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  logs: AuditLog[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination parameters
  pageNumber = 1;
  pageSize = 15;
  totalPages = 1;
  totalRecords = 0;

  // Filter parameters
  filterAction = '';
  filterEntityName = '';
  filterUsername = '';

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const action = this.filterAction.trim() || undefined;
    const entityName = this.filterEntityName.trim() || undefined;
    const username = this.filterUsername.trim() || undefined;

    this.adminService.getAuditLogs(this.pageNumber, this.pageSize, action, entityName, username).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const pagedData = res.data;
          this.logs = pagedData.data;
          this.pageNumber = pagedData.pageNumber;
          this.pageSize = pagedData.pageSize;
          this.totalPages = pagedData.totalPages;
          this.totalRecords = pagedData.totalRecords;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load audit logs.';
      }
    });
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filterAction = '';
    this.filterEntityName = '';
    this.filterUsername = '';
    this.pageNumber = 1;
    this.loadLogs();
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadLogs();
    }
  }
}
