import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsTopBar } from './ncs-top-bar';

describe('NcsTopBar', () => {
  let component: NcsTopBar;
  let fixture: ComponentFixture<NcsTopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsTopBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsTopBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
