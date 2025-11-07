import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  completedPickups: number;
  pendingPickups: number;
  activeOpportunities: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  skills: string[];
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Pickup {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  pickupDate: string;
  items: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  _id: string;
  ngo_id: number;
  title: string;
  description: string;
  required_skills: string[];
  duration: string;
  location: string;
  status: 'Open' | 'Closed';
  date: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLog {
  _id: string;
  action: string;
  target_id: number;
  timestamp: string;
  admin_id: number;
}

export interface Report {
  reportType: string;
  generatedAt: string;
  data: any;
  summary: any;
}

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {
  private apiUrl = 'http://localhost:5000/api/v1/admin';
  sidebarOpen: boolean = false;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
}

  // Dashboard data
  dashboardStats: DashboardStats = {
    totalUsers: 0,
    completedPickups: 0,
    pendingPickups: 0,
    activeOpportunities: 0
  };
  
  // User management
  users: User[] = [];
  filteredUsers: User[] = [];
  userSearchTerm: string = '';
  selectedUser: User | null = null;
  isEditingUser: boolean = false;
  
  // Admin logs
  adminLogs: AdminLog[] = [];
  
  // UI state
  activeTab: 'users' | 'logs' = 'users';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Dark mode
  isDarkMode: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadUsers();
    this.loadAdminLogs();
  }

  // Dashboard methods
  loadDashboardData() {
    this.isLoading = true;
    this.http.get<DashboardStats>(`${this.apiUrl}/stats`).subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.errorMessage = 'Failed to load dashboard statistics';
        this.isLoading = false;
      }
    });
  }

  // User management methods
  loadUsers() {
    this.isLoading = true;
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  searchUsers() {
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }
    
    const searchTerm = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.location?.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
    this.isEditingUser = true;
  }

  saveUser() {
    if (!this.selectedUser) return;
    
    this.isLoading = true;
    this.http.put<User>(`${this.apiUrl}/users/${this.selectedUser._id}`, this.selectedUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
        }
        this.isEditingUser = false;
        this.selectedUser = null;
        this.successMessage = 'User updated successfully';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = 'Failed to update user';
        this.isLoading = false;
      }
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    this.isLoading = true;
    this.http.delete(`${this.apiUrl}/users/${user._id}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
        this.filteredUsers = [...this.users];
        this.successMessage = 'User deleted successfully';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.errorMessage = 'Failed to delete user';
        this.isLoading = false;
      }
    });
  }

  cancelEdit() {
    this.isEditingUser = false;
    this.selectedUser = null;
  }

  // Admin logs methods
  loadAdminLogs() {
    this.http.get<AdminLog[]>(`${this.apiUrl}/logs`).subscribe({
      next: (logs) => {
        this.adminLogs = logs;
      },
      error: (error) => {
        console.error('Error loading admin logs:', error);
        this.errorMessage = 'Failed to load admin logs';
      }
    });
  }

  // Report generation methods
  generateUsersReport() {
    this.isLoading = true;
    this.http.get<Report>(`${this.apiUrl}/reports/users`).subscribe({
      next: (report) => {
        this.downloadReport(report);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating users report:', error);
        this.errorMessage = 'Failed to generate users report';
        this.isLoading = false;
      }
    });
  }

  generatePickupsReport() {
    this.isLoading = true;
    this.http.get<Report>(`${this.apiUrl}/reports/pickups`).subscribe({
      next: (report) => {
        this.downloadReport(report);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating pickups report:', error);
        this.errorMessage = 'Failed to generate pickups report';
        this.isLoading = false;
      }
    });
  }

  generateOpportunitiesReport() {
    this.isLoading = true;
    this.http.get<Report>(`${this.apiUrl}/reports/opportunities`).subscribe({
      next: (report) => {
        this.downloadReport(report);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating opportunities report:', error);
        this.errorMessage = 'Failed to generate opportunities report';
        this.isLoading = false;
      }
    });
  }

  generateFullActivityReport() {
    this.isLoading = true;
    this.http.get<Report>(`${this.apiUrl}/reports/full-activity`).subscribe({
      next: (report) => {
        this.downloadReport(report);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating full activity report:', error);
        this.errorMessage = 'Failed to generate full activity report';
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: Report) {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Sample data creation
  createSampleData() {
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/sample-data`, {}).subscribe({
      next: (result: any) => {
        this.successMessage = 'Sample data created successfully!';
        this.loadDashboardData();
        this.loadUsers();
        this.loadAdminLogs();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('Error creating sample data:', error);
        this.errorMessage = 'Failed to create sample data';
        this.isLoading = false;
      }
    });
  }

  // UI methods
  setActiveTab(tab: 'users' | 'logs') {
    this.activeTab = tab;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'open':
        return 'green';
      case 'scheduled':
        return 'orange';
      case 'cancelled':
      case 'closed':
        return 'red';
      default:
        return 'gray';
    }
  }
}
