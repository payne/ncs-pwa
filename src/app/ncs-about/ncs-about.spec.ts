import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsAbout } from './ncs-about';

describe('NcsAbout', () => {
  let component: NcsAbout;
  let fixture: ComponentFixture<NcsAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsAbout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsAbout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
