import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Standalone components
import { OpportunitiesComponent } from '../opportunities/opportunities.component';
import { OpportunityDetailComponent } from '../opportunities/opportunity-detail/opportunity-detail.component';
import { OpportunityFormComponent } from '../opportunities/opportunity-form/opportunity-form.component';

// Dashboard Data Interfaces
export interface DashboardData {
  totalPickups: number;
  pickupsChangePercent: number;
  totalRecycledItems: number;
  recycledItemsChangePercent: number;
  totalCO2SavedKg: number;
  co2SavedChangePercent: number;
  totalVolunteerHours: number;
  volunteerHoursChangePercent: number;
  upcomingPickups: UpcomingPickup[];
  recyclingBreakdown: RecyclingBreakdown;
}

export interface UpcomingPickup {
  address: string;
  pickupDate: string;
  time: string;
}

export interface RecyclingBreakdown {
  Plastic: number;
  Paper: number;
  Glass: number;
  'E-Waste': number;
  Organic: number;
}

// Messages Interfaces
export interface Message {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Pickup Interfaces
export interface PickupRequest {
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  pickupDate: string;
  timeSlot: string;
  wasteTypes: string[];
  additionalNotes: string;
}

export interface PickupHistory {
  _id: string;
  userId: string;
  name: string;
  address: string;
  contactNumber: string;
  pickupDate: string;
  items: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Admin Panel Interfaces
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
  role: 'user' | 'admin' | 'volunteer';
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
  selector: 'dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    FormsModule, 
    OpportunitiesComponent, 
    OpportunityDetailComponent, 
    OpportunityFormComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // Navigation & UI State
  activeMenu: string = 'dashboard';
  activeProfileTab: string = 'profile';
  
  
  activePickupTab: 'schedule' | 'history' = 'schedule';
  activeAdminTab: 'users' | 'logs' = 'users';
  opportunityView: 'list' | 'create' | 'details' = 'list';
  selectedOpportunityId: string | null = null;
  isDarkMode: boolean = false;
        userRole: string = '';
  // Add these properties for mobile hamburger/sidebar
  isMobile: boolean = false;
  sidebarOpen: boolean = false;

  
  // Loading & Messages
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // User Profile
  userProfile = {
    _id: '',
    name: '',
    email: '',
    location: '',
    skills: [] as string[],
    role: 'user' as 'user' | 'admin' | 'volunteer'
  };
  skillsString: string = '';
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // API URLs - Centralized configuration
  private readonly API_BASE = 'http://localhost:5000/api/v1';
  private readonly adminApiUrl = `${this.API_BASE}/admin`;
  private readonly dashboardApiUrl = `${this.API_BASE}/dashboard`;
  private readonly messagesApiUrl = `${this.API_BASE}/messages`;
  private readonly pickupApiUrl = `${this.API_BASE}/pickup`;
  private readonly profileApiUrl = `${this.API_BASE}/profile`;
  
  // Dashboard Data (with demo data)
  dashboardData: DashboardData = {
    totalPickups: 45,
    pickupsChangePercent: 23.5,
    totalRecycledItems: 38,
    recycledItemsChangePercent: 18.2,
    totalCO2SavedKg: 1520,
    co2SavedChangePercent: 18.2,
    totalVolunteerHours: 24,
    volunteerHoursChangePercent: 12.5,
    upcomingPickups: [
      {
        address: '123, Salt Lake Sector 5, Kolkata',
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '10:00 AM'
      },
      {
        address: '456, Park Street, Kolkata',
        pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: '2:00 PM'
      },
      {
        address: '789, New Town, Kolkata',
        pickupDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        time: '11:30 AM'
      }
    ],
    recyclingBreakdown: {
      Plastic: 18,
      Paper: 14,
      Glass: 8,
      'E-Waste': 5,
      Organic: 12
    }
  };
  
  dashboardStats: DashboardStats = this.getEmptyDashboardStats();
  
  // User Management (Admin)
  users: User[] = [];
  filteredUsers: User[] = [];
  userSearchTerm: string = '';
  selectedUser: User | null = null;
  isEditingUser: boolean = false;
  adminLogs: AdminLog[] = [];
  
  // Messages Data
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  messageSearchTerm: string = '';
  showNewConversationForm: boolean = false;
  newConversationUserId: string = '';
  newConversationMessage: string = '';
  availableUsers: User[] = [];
  searchUserTerm: string = '';
  
  // Pickup Data
  pickupRequest: PickupRequest = this.getEmptyPickupRequest();
  pickupHistory: PickupHistory[] = [];
  showPickupModal: boolean = false;
  selectedPickup: PickupHistory | null = null;
  
  // Configuration
  readonly availableTimeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM'
  ];
  
  readonly wasteTypeOptions = [
    'Plastic', 
    'Paper', 
    'Glass', 
    'Metal', 
    'Electronic Waste', 
    'Organic Waste', 
    'Other'
  ];
  
  // Waste type mapping for recycling breakdown
  readonly wasteTypeMapping: Record<string, string> = {
    'Plastic': 'Plastic',
    'Paper': 'Paper',
    'Glass': 'Glass',
    'Electronic Waste': 'E-Waste',
    'E-Waste': 'E-Waste',
    'Organic Waste': 'Organic',
    'Organic': 'Organic'
  };

  // Static content pages
  pages: Record<string, string> = {
    dashboard: "Welcome to your WasteZero dashboard. Track pickups, opportunities, and your impact here.",
    schedule: "Your next pickup is scheduled for <b>Friday, 20th September 2025</b>. You can manage or reschedule here.",
    messages: `Recyclable items can be dropped at:
      <ul>
        <li>City Recycling Center</li>
        <li>Main Street Pickup Point</li>
        <li>Community Eco Hub</li>
      </ul>`,
    impact: "You have recycled <b>120kg</b> of waste and saved <b>85kg CO₂</b> this year. Keep going!",
    profile: "",
    settings: "",
    support: `
      <h1>Help & Support</h1>
      <p>If you need assistance, you can:</p>
      <ul>
        <li>Check the <b>FAQ section</b> in the documentation</li>
        <li>Contact us at <b>support@wastezero.com</b></li>
        <li>Call our 24/7 helpline: <b>+91-9876543210</b></li>
      </ul>`,
    admin: ""
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('userRole') || 'volunteer';
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load saved theme preference (use 'theme' key)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      this.isDarkMode = true;
      console.log('Dark mode loaded from localStorage (theme=dark)');
    } else {
      this.isDarkMode = false;
      document.body.classList.remove('dark');
    }

    this.getUserProfile();
    this.loadDashboardData();
    // Check if mobile and listen for resize changes
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  // ==================== AUTHENTICATION & PROFILE ====================
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  }

  getUserProfile() {
    this.http.get<{ success: boolean, user: any }>(
      this.profileApiUrl,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.userProfile = res.user;
          this.skillsString = (res.user.skills || []).join(', ');
          
          if (res.user._id && !localStorage.getItem('userId')) {
            localStorage.setItem('userId', res.user._id);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.router.navigate(['/login']);
      }
    });
  }

  updateProfile() {
    const payload = {
      ...this.userProfile,
      skills: this.skillsString.split(',').map(s => s.trim()).filter(Boolean)
    };

    this.http.put<{ success: boolean, user: any }>(
      this.profileApiUrl,
      payload,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Profile updated successfully!');
          this.userProfile = res.user;
          this.skillsString = res.user.skills.join(', ');
        }
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.showError('Failed to update profile');
      }
    });
  }

  deleteProfile() {
    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    this.http.delete<{ success: boolean, message: string }>(
      this.profileApiUrl,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess(res.message);
          this.logout();
        }
      },
      error: (err) => {
        console.error('Error deleting profile', err);
        this.showError('Failed to delete profile');
      }
    });
  }

  updatePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showError('New password and confirm password do not match!');
      return;
    }

    const payload = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    };

    this.http.put<{ success: boolean, message: string }>(
      `${this.profileApiUrl}/password`,
      payload,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess(res.message || 'Password updated successfully!');
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        }
      },
      error: (err) => {
        console.error('Error updating password', err);
        this.showError('Failed to update password');
      }
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    this.userProfile = {
      _id: '',
      name: '',
      email: '',
      location: '',
      skills: [],
      role: 'user'
    };
    
    this.clearAllData();
    this.showSuccess('Logged out successfully!');
    
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

  // ==================== ROLE CHECKS ====================
  
  isAdmin(): boolean {
    return this.userProfile.role === 'admin';
  }

  isUser(): boolean {
    return this.userProfile.role === 'user';
  }

  isVolunteer(): boolean {
    return this.userProfile.role === 'volunteer';
  }

  canCreateOpportunities(): boolean {
    return this.isAdmin();
  }

  canSchedulePickup(): boolean {
    return true; // All roles can schedule pickups
  }

  // ==================== NAVIGATION ====================
  
  setActive(menu: string) {
    this.activeMenu = menu;
    this.clearMessages();
    
    // Load data based on selected menu
    switch(menu) {
      case 'opportunities':
        this.opportunityView = 'list';
        this.selectedOpportunityId = null;
        break;
      case 'admin':
        this.loadAdminData();
        break;
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'messages':
        this.loadMessagesData();
        break;
      case 'schedule':
        this.loadPickupData();
        break;
    }
  }

  setOpportunityView(view: 'list' | 'create' | 'details', opportunityId: string | null = null) {
    this.activeMenu = 'opportunities';
    
    if (view === 'create' && !this.canCreateOpportunities()) {
      this.opportunityView = 'create';
      this.selectedOpportunityId = opportunityId;
      return;
    }
    
    this.opportunityView = view;
    this.selectedOpportunityId = opportunityId;
  }

  setProfileTab(tab: string) {
    this.activeProfileTab = tab;
  }

  setPickupTab(tab: 'schedule' | 'history') {
    this.activePickupTab = tab;
  }

  setActiveAdminTab(tab: 'users' | 'logs') {
    this.activeAdminTab = tab;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Toggle sidebar (hamburger)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Mobile view helper used by template
  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  // Detect mobile viewport
  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  scrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ==================== DASHBOARD METHODS ====================
  
  loadDashboardData() {
    this.isLoading = true;
    this.clearMessages();
    
    // Load pickup history to update dashboard metrics
    this.loadPickupHistory();
    
    this.isLoading = false;
  }

  /**
   * Updates dashboard metrics based on pickup history
   */
  private updateDashboardPickups(history: PickupHistory[]) {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Total pickups this month
    const currentMonthPickups = history.filter(p => new Date(p.pickupDate) > lastMonth).length;

    // Total pickups last month
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const lastMonthPickups = history.filter(p => {
      const date = new Date(p.pickupDate);
      return date > twoMonthsAgo && date <= lastMonth;
    }).length;

    // Calculate change percentage
    const pickupsChangePercent = lastMonthPickups === 0 ? 100 :
      ((currentMonthPickups - lastMonthPickups) / lastMonthPickups) * 100;

    // Update dashboard data
    this.dashboardData = {
      ...this.dashboardData,
      totalPickups: history.length, // Total all-time pickups
      pickupsChangePercent: pickupsChangePercent,
      upcomingPickups: history
        .filter(p => new Date(p.pickupDate) > now && p.status === 'Scheduled')
        .map(p => ({
          address: p.address,
          pickupDate: p.pickupDate,
          time: new Date(p.pickupDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }))
        .slice(0, 3) // Only show next 3 upcoming pickups
    };
  }

  // ==================== MESSAGES METHODS ====================
  
  loadMessagesData() {
    this.loadConversations();
  }

  loadConversations() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.showError('User not authenticated');
      return;
    }

    this.http.get<{success: boolean, data: Conversation[]}>(
      `${this.messagesApiUrl}/conversations/${userId}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        this.conversations = response.success ? response.data : [];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.showError('Failed to load conversations');
        this.conversations = [];
      }
    });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.sender_id, conversation.receiver_id);
  }

  loadMessages(user1Id: string, user2Id: string) {
    this.http.get<{success: boolean, data: Message[]}>(
      `${this.messagesApiUrl}/conversation/${user1Id}/${user2Id}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        this.messages = response.success ? response.data : [];
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.showError('Failed to load messages');
        this.messages = [];
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.showError('User not authenticated');
      return;
    }

    const otherUserId = this.selectedConversation.sender_id === userId ? 
      this.selectedConversation.receiver_id : this.selectedConversation.sender_id;

    const messageData = {
      sender_id: userId,
      receiver_id: otherUserId,
      content: this.newMessage.trim()
    };

    this.http.post<{success: boolean, data: Message}>(
      `${this.messagesApiUrl}/send`,
      messageData,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push(response.data);
          this.newMessage = '';
          this.loadConversations();
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.showError('Failed to send message');
      }
    });
  }

  startNewConversation() {
    this.showNewConversationForm = true;
    this.selectedConversation = null;
    this.messages = [];
    this.loadAvailableUsers();
  }

  loadAvailableUsers() {
    this.http.get<{success: boolean, data: User[]}>(
      `${this.messagesApiUrl}/users`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        this.availableUsers = response.success ? response.data : [];
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showError('Failed to load users');
        this.availableUsers = [];
      }
    });
  }

  getFilteredUsers(): User[] {
    if (!this.searchUserTerm.trim()) {
      return this.availableUsers;
    }
    const searchTerm = this.searchUserTerm.toLowerCase();
    return this.availableUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  selectUserForConversation(user: User) {
    this.newConversationUserId = user._id;
    this.searchUserTerm = `${user.name} (${user.email})`;
  }

  cancelNewConversation() {
    this.showNewConversationForm = false;
    this.newConversationUserId = '';
    this.newConversationMessage = '';
    this.searchUserTerm = '';
    this.availableUsers = [];
  }

  sendFirstMessage() {
    if (!this.newConversationUserId.trim() || !this.newConversationMessage.trim()) {
      this.showError('Please select a user and enter a message');
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.showError('User not authenticated');
      return;
    }

    const messageData = {
      sender_id: userId,
      receiver_id: this.newConversationUserId.trim(),
      content: this.newConversationMessage.trim()
    };

    this.http.post<{success: boolean, message: string, data: Message}>(
      `${this.messagesApiUrl}/send`,
      messageData,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Message sent! Conversation started.');
          this.cancelNewConversation();
          this.loadConversations();
        }
      },
      error: (error) => {
        console.error('Send first message error:', error);
        this.showError(error.error?.message || 'Failed to send message');
      }
    });
  }

  searchMessages() {
    if (!this.messageSearchTerm.trim()) {
      this.loadConversations();
      return;
    }
    const searchTerm = this.messageSearchTerm.toLowerCase();
    this.conversations = this.conversations.filter(conv => 
      conv.content.toLowerCase().includes(searchTerm)
    );
  }

  // ==================== PICKUP METHODS ====================
  
  loadPickupData() {
    this.loadPickupHistory();
  }

  loadPickupHistory() {
    this.http.get<PickupHistory[]>(
      `${this.pickupApiUrl}/my`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (history) => {
        this.pickupHistory = history;
        // Update dashboard total pickups when pickup history is loaded
        this.updateDashboardPickups(history);
      },
      error: (error) => {
        console.error('Error loading pickup history:', error);
        this.showError('Failed to load pickup history');
        this.pickupHistory = [];
      }
    });
  }

  toggleWasteType(type: string) {
    const index = this.pickupRequest.wasteTypes.indexOf(type);
    if (index > -1) {
      this.pickupRequest.wasteTypes.splice(index, 1);
    } else {
      this.pickupRequest.wasteTypes.push(type);
    }
  }

  schedulePickup() {
    if (!this.validatePickupForm()) return;

    const pickupData = {
      name: this.pickupRequest.name,
      address: `${this.pickupRequest.address}, ${this.pickupRequest.city}`,
      contactNumber: this.pickupRequest.contactNumber,
      pickupDate: this.pickupRequest.pickupDate,
      items: this.pickupRequest.wasteTypes.join(', ')
    };

    this.isLoading = true;
    this.clearMessages();
    
    this.http.post<{message: string, pickup: PickupHistory}>(
      `${this.pickupApiUrl}/schedule`,
      pickupData,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        this.showSuccess('Pickup scheduled successfully!');
        this.resetPickupForm();
        this.loadPickupHistory();
        this.isLoading = false;
        
        setTimeout(() => {
          this.setPickupTab('history');
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to schedule pickup');
        this.isLoading = false;
      }
    });
  }

  validatePickupForm(): boolean {
    const required = [
      { field: this.pickupRequest.name, message: 'Name is required' },
      { field: this.pickupRequest.address, message: 'Address is required' },
      { field: this.pickupRequest.city, message: 'City is required' },
      { field: this.pickupRequest.contactNumber, message: 'Contact number is required' },
      { field: this.pickupRequest.pickupDate, message: 'Pickup date is required' },
      { field: this.pickupRequest.timeSlot, message: 'Time slot is required' }
    ];

    for (const item of required) {
      if (!item.field || !item.field.toString().trim()) {
        this.showError(item.message);
        return false;
      }
    }

    if (this.pickupRequest.wasteTypes.length === 0) {
      this.showError('Please select at least one waste type');
      return false;
    }

    return true;
  }

  resetPickupForm() {
    this.pickupRequest = this.getEmptyPickupRequest();
  }

  viewPickup(pickup: PickupHistory) {
    this.selectedPickup = pickup;
    this.showPickupModal = true;
  }

  closePickupModal() {
    this.showPickupModal = false;
    this.selectedPickup = null;
  }

  cancelPickup(pickup: PickupHistory) {
    if (pickup.status === 'Completed') {
      this.showError('Cannot cancel completed pickup');
      return;
    }
    
    if (pickup.status === 'Cancelled') {
      this.showError('Pickup is already cancelled');
      return;
    }

    if (!confirm(`Cancel pickup scheduled for ${this.formatDate(pickup.pickupDate)}?`)) {
      return;
    }

    this.isLoading = true;
    
    this.http.put<{success: boolean, message: string, pickup: PickupHistory}>(
      `${this.pickupApiUrl}/cancel/${pickup._id}`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Pickup cancelled successfully');
          this.loadPickupHistory();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to cancel pickup');
        this.isLoading = false;
      }
    });
  }

  deletePickup(pickup: PickupHistory) {
    if (pickup.status === 'Completed') {
      this.showError('Cannot delete completed pickup');
      return;
    }

    if (!confirm(`Delete pickup scheduled for ${this.formatDate(pickup.pickupDate)}?`)) {
      return;
    }

    this.isLoading = true;

    this.http.delete<{success: boolean, message: string}>(
      `${this.pickupApiUrl}/${pickup._id}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Pickup deleted successfully');
          this.loadPickupHistory();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to delete pickup');
        this.isLoading = false;
      }
    });
  }

  /**
   * Accept a pickup — only volunteers can accept pickups.
   */
  acceptPickup(pickup: PickupHistory) {
    if (!this.isVolunteer()) {
      this.showError('Only volunteers can accept pickups');
      return;
    }

    if (!pickup || !pickup._id) {
      this.showError('Invalid pickup selected');
      return;
    }

    if (pickup.status === 'Accepted' || pickup.status === 'Completed') {
      this.showError('This pickup has already been accepted or completed');
      return;
    }

    if (!confirm(`Accept pickup scheduled for ${this.formatDate(pickup.pickupDate)}?`)) {
      return;
    }

    this.isLoading = true;

    this.http.put<{success: boolean, pickup?: PickupHistory, message?: string}>(
      `${this.pickupApiUrl}/accept/${pickup._id}`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.showSuccess('Pickup accepted successfully');
          // Refresh history and dashboard metrics
          this.loadPickupHistory();
        } else {
          this.showError(response?.message || 'Failed to accept pickup');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error accepting pickup:', error);
        this.showError(error.error?.message || 'Failed to accept pickup');
        this.isLoading = false;
      }
    });
  }

  // ==================== ADMIN PANEL METHODS ====================
  
  loadAdminData() {
    this.loadDashboardStats();
    this.loadUsers();
    this.loadAdminLogs();
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.http.get<DashboardStats>(
      `${this.adminApiUrl}/stats`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.showError('Failed to load dashboard statistics');
        this.dashboardStats = this.getEmptyDashboardStats();
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.http.get<User[]>(
      `${this.adminApiUrl}/users`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showError('Failed to load users');
        this.users = [];
        this.filteredUsers = [];
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
    this.clearMessages();
    
    this.http.put<User>(
      `${this.adminApiUrl}/users/${this.selectedUser._id}`,
      this.selectedUser,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
        }
        this.isEditingUser = false;
        this.selectedUser = null;
        this.showSuccess('User updated successfully');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.showError('Failed to update user');
        this.isLoading = false;
      }
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    this.isLoading = true;
    this.clearMessages();
    
    this.http.delete(
      `${this.adminApiUrl}/users/${user._id}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
        this.filteredUsers = [...this.users];
        this.showSuccess('User deleted successfully');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.showError('Failed to delete user');
        this.isLoading = false;
      }
    });
  }

  cancelEdit() {
    this.isEditingUser = false;
    this.selectedUser = null;
  }

  loadAdminLogs() {
    this.http.get<AdminLog[]>(
      `${this.adminApiUrl}/logs`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (logs) => {
        this.adminLogs = logs;
      },
      error: (error) => {
        console.error('Error loading admin logs:', error);
        this.showError('Failed to load admin logs');
        this.adminLogs = [];
      }
    });
  }

  // Report generation methods
  generateUsersReport() {
    this.generateReport('users');
  }

  generatePickupsReport() {
    this.generateReport('pickups');
  }

  generateOpportunitiesReport() {
    this.generateReport('opportunities');
  }

  generateFullActivityReport() {
    this.generateReport('full-activity');
  }

  private generateReport(reportType: string) {
    this.isLoading = true;
    this.clearMessages();
    
    this.http.get<Report>(
      `${this.adminApiUrl}/reports/${reportType}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (report) => {
        this.downloadReport(report);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error generating ${reportType} report:`, error);
        this.showError(`Failed to generate ${reportType} report`);
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

  createSampleData() {
    this.isLoading = true;
    this.clearMessages();
    
    this.http.post(
      `${this.adminApiUrl}/sample-data`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showSuccess('Sample data created successfully!');
        this.loadAdminData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating sample data:', error);
        this.showError('Failed to create sample data');
        this.isLoading = false;
      }
    });
  }

  // ==================== UTILITY METHODS ====================
  
  getCurrentUserId(): string {
    return localStorage.getItem('userId') || this.userProfile._id || '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  clearAllData() {
    this.conversations = [];
    this.selectedConversation = null;
    this.messages = [];
    this.pickupHistory = [];
    // Keep demo data instead of clearing
    this.users = [];
    this.filteredUsers = [];
    this.adminLogs = [];
  }

  // ==================== FORMAT HELPERS ====================
  
  formatChangePercent(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  }

  getChangeColor(percent: number): string {
    return percent >= 0 ? 'green' : 'red';
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  formatTime(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  }

  formatFullDateTime(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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

  getRecyclingPercentage(material: string): number {
    const breakdown = this.dashboardData.recyclingBreakdown;
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const materialTotal = breakdown[material as keyof RecyclingBreakdown] || 0;
    return total > 0 ? (materialTotal / total) * 100 : 0;
  }

  getTotalRecycledWeight(): number {
    const breakdown = this.dashboardData.recyclingBreakdown;
    return Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  }

  // Message utility methods
  getOtherUserId(conversation: Conversation): string {
    const userId = this.getCurrentUserId();
    if (!userId) return 'Unknown';
    return conversation.sender_id === userId ? 
      conversation.receiver_id : conversation.sender_id;
  }

  isMessageFromCurrentUser(message: Message): boolean {
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    return message.sender_id === userId;
  }

  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  // ==================== EMPTY STATE FACTORIES ====================
  
  private getEmptyDashboardData(): DashboardData {
    return {
      totalPickups: 0,
      pickupsChangePercent: 0,
      totalRecycledItems: 0,
      recycledItemsChangePercent: 0,
      totalCO2SavedKg: 0,
      co2SavedChangePercent: 0,
      totalVolunteerHours: 0,
      volunteerHoursChangePercent: 0,
      upcomingPickups: [],
      recyclingBreakdown: {
        Plastic: 0,
        Paper: 0,
        Glass: 0,
        'E-Waste': 0,
        Organic: 0
      }
    };
  }

  private getEmptyDashboardStats(): DashboardStats {
    return {
      totalUsers: 0,
      completedPickups: 0,
      pendingPickups: 0,
      activeOpportunities: 0
    };
  }

  private getEmptyPickupRequest(): PickupRequest {
    return {
      name: '',
      address: '',
      city: '',
      contactNumber: '',
      pickupDate: '',
      timeSlot: '',
      wasteTypes: [],
      additionalNotes: ''
    };
  }

  // ==================== RECYCLING BREAKDOWN CALCULATION ====================
  
  /**
   * Calculate recycling breakdown percentages for display
   * Maps waste types to standard categories and returns percentage distribution
   */
  getRecyclingBreakdownData(): { material: string; count: number; percentage: number }[] {
    const breakdown = this.dashboardData.recyclingBreakdown;
    const total = this.getTotalRecycledWeight();
    
    return Object.entries(breakdown).map(([material, count]) => ({
      material,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  /**
   * Get color for recycling material in charts
   */
  getMaterialColor(material: string): string {
    const colors: Record<string, string> = {
      'Plastic': '#3b82f6',
      'Paper': '#10b981',
      'Glass': '#8b5cf6',
      'E-Waste': '#f59e0b',
      'Organic': '#22c55e'
    };
    return colors[material] || '#6b7280';
  }

  /**
   * Get estimated weight for waste type (in kg)
   * Based on average waste pickup statistics
   */
  getEstimatedWeight(wasteType: string): number {
    const weights: Record<string, number> = {
      'Plastic': 5,
      'Paper': 10,
      'Glass': 15,
      'Metal': 8,
      'Electronic Waste': 12,
      'E-Waste': 12,
      'Organic Waste': 20,
      'Organic': 20,
      'Other': 7
    };
    return weights[wasteType] || 10;
  }

  /**
   * Calculate total estimated CO2 savings
   * Formula: Each kg of recycled waste saves approximately 2kg of CO2
   */
  calculateCO2Savings(wasteTypes: string[]): number {
    const totalWeight = wasteTypes.reduce((sum, type) => {
      return sum + this.getEstimatedWeight(type);
    }, 0);
    return totalWeight * 2; // 2kg CO2 per kg of waste
  }

  /**
   * Get environmental impact message based on CO2 saved
   */
  getImpactMessage(co2SavedKg: number): string {
    if (co2SavedKg >= 1000) {
      const trees = Math.round(co2SavedKg / 20); // 1 tree absorbs ~20kg CO2/year
      return `Equivalent to planting ${trees} trees!`;
    } else if (co2SavedKg >= 500) {
      return `That's like taking a car off the road for a month!`;
    } else if (co2SavedKg >= 100) {
      return `Great progress towards a cleaner environment!`;
    } else {
      return `Every bit helps protect our planet!`;
    }
  }

  /**
   * Get next available pickup date (excludes past dates)
   */
  getMinPickupDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Validate contact number format
   */
  isValidContactNumber(number: string): boolean {
    // Allow formats: 1234567890, +91-1234567890, (123) 456-7890
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(number) && number.replace(/\D/g, '').length >= 10;
  }

  /**
   * Format contact number for display
   */
  formatContactNumber(number: string): string {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  }
}

