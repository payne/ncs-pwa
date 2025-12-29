import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcsSelectNet } from './ncs-select-net';

describe('NcsSelectNet', () => {
  let component: NcsSelectNet;
  let fixture: ComponentFixture<NcsSelectNet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcsSelectNet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NcsSelectNet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
