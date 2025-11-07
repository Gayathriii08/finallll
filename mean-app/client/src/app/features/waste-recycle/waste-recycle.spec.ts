import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteRecycle } from './waste-recycle';

describe('WasteRecycle', () => {
  let component: WasteRecycle;
  let fixture: ComponentFixture<WasteRecycle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteRecycle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasteRecycle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
