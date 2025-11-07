import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
  <div class="modal-backdrop" *ngIf="visible">
    <div class="modal-card">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-primary" (click)="confirm()">Yes</button>
        <button class="btn btn-secondary" (click)="cancel()">No</button>
      </div>
    </div>
  </div>
  `,
    styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent {
    @Input() title = 'Confirm';
    @Input() message = 'Are you sure?';
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onConfirm = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();

    confirm() {
        this.onConfirm.emit();
        this.visible = false;
    }

    cancel() {
        this.onCancel.emit();
        this.visible = false;
    }

    private setVisible(value: boolean) {
        this.visible = value;
        this.visibleChange.emit(value); // ✅ emit change for [(visible)] binding
    }
}
