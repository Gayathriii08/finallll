import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

interface Opportunity {
  _id?: string;
  id?: number;
  ngo_id?: number;
  title?: string;
  description?: string;
  required_skills?: string[];
  duration?: string;
  location?: string;
  status?: string;
  date?: string;
  imageUrl?: string;
}

const API = 'http://localhost:5000/api/opportunities';

@Component({
  selector: 'app-opportunity-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ConfirmModalComponent],
  templateUrl: './opportunity-detail.component.html',
  styleUrls: ['./opportunity-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityDetailComponent implements OnChanges {
  @Input() id: string | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<string>();

  opportunity?: Opportunity;
  loading = false;
  error = '';
  showConfirmModal = false;

  constructor(private http: HttpClient) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id'] && this.id) {
      this.loadOpportunity(this.id);
    }
  }

  loadOpportunity(id: string) {
    this.loading = true;
    this.error = '';
    this.http.get<Opportunity>(`${API}/${id}`).subscribe({
      next: (op) => {
        this.opportunity = op;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load opportunity', err);
        this.error = 'Failed to load opportunity';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.back.emit();
  }

  editOpportunity() {
    if (this.opportunity && (this.opportunity._id || this.opportunity.id)) {
      const id = this.opportunity._id || String(this.opportunity.id);
      this.editRequested.emit(id);
    }
  }

  deleteOpportunity() {
    if (!this.opportunity || !(this.opportunity._id || this.opportunity.id)) return;
    this.showConfirmModal = true;
  }

  confirmDelete() {
    const id = this.opportunity!._id || String(this.opportunity!.id);
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.back.emit();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.showConfirmModal = false;
      }
    });
  }

  cancelDelete() {
    this.showConfirmModal = false;
  }
}
