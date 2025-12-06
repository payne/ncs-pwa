import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsNetAssignments } from './ncs-net-assignments';

describe('NcsNetAssignments', () => {
  let component: NcsNetAssignments;
  let fixture: ComponentFixture<NcsNetAssignments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsNetAssignments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsNetAssignments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
