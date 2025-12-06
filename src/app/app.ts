import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NcsTopBar } from './_shared-components/ncs-top-bar/ncs-top-bar';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatIconModule, NcsTopBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'NCS PWA';
  sidenavOpened = false;

  menuItems = [
    // TODO(MGP): Why do I need this duplicate entry???
    { path: '/ncs-net-assignments', label: 'NET Assignments', icon: 'assignment' },
    { path: '/ncs-net-assignments', label: 'NET Assignments', icon: 'assignment' },
    { path: '/ncs-people', label: 'People', icon: 'people' },
    { path: '/ncs-locations', label: 'Locations', icon: 'location_on' },
    { path: '/ncs-duties', label: 'Duties', icon: 'work' },
    { path: '/ncs-about', label: 'About', icon: 'info' }
  ];

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenav() {
    this.sidenavOpened = false;
  }
}
