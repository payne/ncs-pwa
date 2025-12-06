import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsPeople } from './ncs-people';

describe('NcsPeople', () => {
  let component: NcsPeople;
  let fixture: ComponentFixture<NcsPeople>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsPeople]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsPeople);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
