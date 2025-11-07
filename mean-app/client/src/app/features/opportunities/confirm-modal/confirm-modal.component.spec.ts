import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    component.visible = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onConfirm when confirm() is called', () => {
    spyOn(component.onConfirm, 'emit');
    component.confirm();
    expect(component.onConfirm.emit).toHaveBeenCalled();
  });

  it('should emit onCancel when cancel() is called', () => {
    spyOn(component.onCancel, 'emit');
    component.cancel();
    expect(component.onCancel.emit).toHaveBeenCalled();
  });
});


