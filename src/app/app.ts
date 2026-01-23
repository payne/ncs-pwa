import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NcsTopBar } from './_shared-components/ncs-top-bar/ncs-top-bar';
import { AuthService } from './_services/auth.service';

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
    { path: '/ncs-select-net', label: 'Select NET', icon: 'dns', action: null },
    { path: '/ncs-net-assignments', label: 'NET Assignments', icon: 'assignment', action: null },
    { path: '/ncs-view2', label: 'View 2', icon: 'table_chart', action: null },
    { path: '/ncs-people', label: 'People', icon: 'people', action: null },
    { path: '/ncs-locations', label: 'Locations', icon: 'location_on', action: null },
    { path: '/ncs-duties', label: 'Duties', icon: 'work', action: null },
    { path: '/ncs-settings', label: 'Settings', icon: 'settings', action: null },
    { path: null, label: 'Logout', icon: 'logout', action: 'logout' },
    { path: '/ncs-about', label: 'About', icon: 'info', action: null }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenav() {
    this.sidenavOpened = false;
  }

  handleMenuClick(item: any) {
    if (item.action === 'logout') {
      this.authService.signOut().then(() => {
        this.router.navigate(['/login']);
        this.closeSidenav();
      });
    } else if (item.path) {
      this.closeSidenav();
    }
  }
}
