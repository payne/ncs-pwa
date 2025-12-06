import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsLocations } from './ncs-locations';

describe('NcsLocations', () => {
  let component: NcsLocations;
  let fixture: ComponentFixture<NcsLocations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsLocations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsLocations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
