import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';

interface Opportunity {
  _id?: string;
  id?: number;
  ngo_id?: number;
  title: string;
  description?: string;
  required_skills?: string[];
  duration?: string;
  location?: string;
  status?: string;
  date?: string;
}

const API = 'http://localhost:5000/api/opportunities';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ConfirmModalComponent],
  templateUrl: './opportunities.component.html',
  styleUrls: ['./opportunities.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunitiesComponent implements OnInit {
  @Output() createRequested = new EventEmitter<void>();
  @Output() viewDetails = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<string>();

  searchTerm: string = '';
  selectedStatus: string = 'All Statuses';
  deleteTargetId: string | null = null;
  showConfirmModal = false;

  opportunities: Opportunity[] = [];
  userRole: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole') || '';
    this.loadOpportunities();
  }

  loadOpportunities() {
    this.http.get<Opportunity[]>(API).subscribe({
      next: (list) => {
        // keep as-is; each item will have _id (from Mongo)
        this.opportunities = list || [];
      },
      error: (err) => {
        console.error('Failed to load opportunities', err);
        this.opportunities = [];
      }
    });
  }

  get filteredOpportunities(): Opportunity[] {
    const term = this.searchTerm.toLowerCase();
    return this.opportunities.filter(opp =>
      (this.selectedStatus === 'All Statuses' || (opp.status || '').toLowerCase() === this.selectedStatus.toLowerCase())
      && (
        (opp.title || '').toLowerCase().includes(term)
        || (opp.description || '').toLowerCase().includes(term)
        || (opp.location || '').toLowerCase().includes(term)
        || (opp.required_skills || []).some(s => s.toLowerCase().includes(term))
      )
    );
  }

  onCreate() {
    this.createRequested.emit();
  }

  onView(id?: string) {
    if (!id) return;
    this.viewDetails.emit(id);
  }

  onEdit(id?: string) {
    if (!id) return;
    this.editRequested.emit(id);
  }

     // Apply to an opportunity
applyToOpportunity(opportunityId: string | undefined, opp?: any) {
  if (!opportunityId) {
    console.warn('No opportunity id provided for apply');
    return;
  }

  const applyUrl = `http://localhost:5000/api/opportunities/${opportunityId}/apply`;

  // Optional payload: include user id from localStorage if available, or other fields
  const payload = {
    userId: localStorage.getItem('userId') || null,
    appliedAt: new Date().toISOString()
  };

  this.http.post(applyUrl, payload).subscribe({
    next: (res: any) => {
      // simple success handling - you can replace with a toast/snackbar
      console.log('Applied successfully', res);
      // Optionally update the specific card UI:
      if (opp) {
        (opp as any).applied = true;
      }
      alert('Application submitted successfully.');
    },
    error: (err) => {
      console.error('Apply failed', err);
      alert('Failed to submit application. Please try again later.');
    }
  });
}
// apply closed

  onDelete(id?: string) {
    if (!id) return;
    this.deleteTargetId = id;
    this.showConfirmModal = true;
  }

  confirmDelete() {
    if (!this.deleteTargetId) return;

    this.http.delete(`${API}/${this.deleteTargetId}`).subscribe({
      next: () => {
        this.opportunities = this.opportunities.filter(
          opp => (opp._id || opp.id)?.toString() !== this.deleteTargetId
        );
        this.deleteTargetId = null;
        this.showConfirmModal = false;
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.deleteTargetId = null;
        this.showConfirmModal = false;
      }
    });
  }

  cancelDelete() {
    this.deleteTargetId = null;
    this.showConfirmModal = false;
  }
}
