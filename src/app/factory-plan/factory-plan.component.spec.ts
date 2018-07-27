import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryPlanComponent } from './factory-plan.component';

describe('FactoryPlanComponent', () => {
  let component: FactoryPlanComponent;
  let fixture: ComponentFixture<FactoryPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactoryPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactoryPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
