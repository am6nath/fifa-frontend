import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { UserProfile } from '../../../core/models/auth.model';
import { LoaderComponent } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.css'
})
export class UserManagerComponent implements OnInit {
  private adminService = inject(AdminService);

  users: UserProfile[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination parameters
  pageNumber = 1;
  pageSize = 15;
  totalPages = 1;
  totalRecords = 0;
  
  // Search parameters
  searchTerm = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminService.getUsers(this.pageNumber, this.pageSize, this.searchTerm.trim() || undefined).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const pagedData = res.data;
          this.users = pagedData.data;
          this.pageNumber = pagedData.pageNumber;
          this.pageSize = pagedData.pageSize;
          this.totalPages = pagedData.totalPages;
          this.totalRecords = pagedData.totalRecords;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load users list.';
      }
    });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadUsers();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadUsers();
    }
  }

  toggleUserActive(user: UserProfile): void {
    const actionLabel = user.isActive ? 'block/deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${actionLabel} user "${user.userName}"?`)) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminService.toggleUserActive(user.id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = `User "${user.userName}" has been successfully ${user.isActive ? 'blocked' : 'activated'}.`;
          this.loadUsers();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to change user status.';
      }
    });
  }
}
