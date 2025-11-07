import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OpportunityDetailComponent } from './opportunity-detail.component';

describe('OpportunityDetailComponent', () => {
  let component: OpportunityDetailComponent;
  let fixture: ComponentFixture<OpportunityDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OpportunityDetailComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityDetailComponent);
    component = fixture.componentInstance;
    component.id = '123';
    component.ngOnChanges({ id: { currentValue: '123', previousValue: null, firstChange: true, isFirstChange: () => true } });

    const req = httpMock.expectOne('http://localhost:5000/api/opportunities/123');
    req.flush({ _id: '123', title: 'Cleanup', status: 'Open' });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load opportunity on id change', () => {
    expect(component.opportunity).toBeTruthy();
    expect(component.opportunity?.title).toBe('Cleanup');
  });
});


