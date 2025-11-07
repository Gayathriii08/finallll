import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-edit',
  standalone: true, // ✅ important for standalone component
  imports: [CommonModule, ReactiveFormsModule], // ✅ fixes *ngIf and formGroup
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css']
})
export class PostEditComponent implements OnInit {
  postForm!: FormGroup;
  postId!: string;
  isLoading = true;
  isSaving = false;
  message = '';

  private apiUrl = 'http://localhost:3000/posts'; // backend base URL

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    this.loadPost();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: [''],
      status: ['pending', Validators.required]
    });
  }

  loadPost(): void {
    this.http.get<any>(`${this.apiUrl}/${this.postId}`).subscribe({
      next: (data) => {
        this.postForm.patchValue(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.message = 'Failed to load post details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) return;

    this.isSaving = true;
    this.http.put(`${this.apiUrl}/${this.postId}`, this.postForm.value).subscribe({
      next: (res) => {
        this.message = 'Post updated successfully!';
        setTimeout(() => this.router.navigate(['/posts']), 1500);
      },
      error: (err) => {
        console.error('Error updating post:', err);
        this.message = 'Failed to update post.';
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/posts']);
  }
}
