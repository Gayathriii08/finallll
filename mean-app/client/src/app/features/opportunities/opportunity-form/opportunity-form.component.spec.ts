import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OpportunityFormComponent } from './opportunity-form.component';

describe('OpportunityFormComponent', () => {
  let component: OpportunityFormComponent;
  let fixture: ComponentFixture<OpportunityFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OpportunityFormComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields', () => {
    component.opportunityForm.setValue({
      title: '',
      description: '',
      date: '',
      duration: '',
      location: '',
      required_skills: '',
      status: 'Open'
    });
    component.onSubmit();
    expect(component.errorMessage).toContain('Please fill all required fields');
  });

  it('should POST on create', () => {
    component.opportunityForm.setValue({
      title: 'Cleanup',
      description: 'Desc',
      date: '2025-01-01',
      duration: '2h',
      location: 'Beach',
      required_skills: 'Teamwork, Sorting',
      status: 'Open'
    });

    spyOn(component.back, 'emit');
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:5000/api/opportunities');
    expect(req.request.method).toBe('POST');
    req.flush({});
    expect(component.back.emit).toHaveBeenCalled();
  });
});


