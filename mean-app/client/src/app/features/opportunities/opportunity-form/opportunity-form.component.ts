import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const API = 'http://localhost:5000/api/opportunities';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './opportunity-form.component.html',
  styleUrls: ['./opportunity-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityFormComponent implements OnInit, OnChanges {
  @Input() editId: string | null = null; // when provided -> edit mode
  @Output() back = new EventEmitter<void>();

  opportunityForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  loading = false;
  isEditMode = false;

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.opportunityForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      duration: [''],
      location: ['', Validators.required],
      required_skills: [''],
      status: ['Open']
    });

    // if editId was set before ngOnInit, and ngOnChanges didn't run, handle:
    if (this.editId) {
      this.loadForEdit(this.editId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editId']) {
      const id = changes['editId'].currentValue;
      if (id) {
        this.loadForEdit(id);
      } else {
        // switching to create mode
        this.isEditMode = false;
        this.opportunityForm.reset({ status: 'Open' });
      }
    }
  }

  loadForEdit(id: string) {
    this.loading = true;
    this.isEditMode = true;
    this.http.get<any>(`${API}/${id}`).subscribe({
      next: (op) => {
        // populate form
        this.opportunityForm.patchValue({
          title: op.title || '',
          description: op.description || '',
          date: op.date ? op.date.split('T')[0] : '',
          duration: op.duration || '',
          location: op.location || '',
          required_skills: (op.required_skills || []).join(', '),
          status: op.status || 'Open'
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load for edit', err);
        this.errorMessage = 'Failed to load opportunity for edit';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.opportunityForm.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    const payload = {
      ...this.opportunityForm.value,
      required_skills: String(this.opportunityForm.value.required_skills || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    };

    if (this.isEditMode && this.editId) {
      // UPDATE
      this.http.put(`${API}/${this.editId}`, payload).subscribe({
        next: () => {
          this.successMessage = 'Opportunity updated successfully!';
          this.errorMessage = '';
          // go back to list (dashboard will reload list since *ngIf recreates component)
          this.back.emit();
        },
        error: (err) => {
          console.error('Update failed', err);
          this.errorMessage = 'Failed to update opportunity';
        }
      });
    } else {
      // CREATE
      this.http.post(API, payload).subscribe({
        next: () => {
          this.successMessage = 'Opportunity created successfully!';
          this.errorMessage = '';
          this.opportunityForm.reset({ status: 'Open' });
          this.back.emit();
        },
        error: (err) => {
          console.error('Create failed', err);
          this.errorMessage = 'Failed to create opportunity';
        }
      });
    }
  }

  goBack() {
    this.back.emit();
  }
}
