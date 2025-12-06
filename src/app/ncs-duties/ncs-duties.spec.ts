import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsDuties } from './ncs-duties';

describe('NcsDuties', () => {
  let component: NcsDuties;
  let fixture: ComponentFixture<NcsDuties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsDuties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsDuties);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
