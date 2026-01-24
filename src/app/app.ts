import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NcsTopBar } from './_shared-components/ncs-top-bar/ncs-top-bar';
import { AuthService } from './_services/auth.service';
import { PermissionService } from './_services/permission.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatIconModule, NcsTopBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'NCS PWA';
  sidenavOpened = false;
  isAdmin = false;

  menuItems = [
    { path: '/ncs-select-net', label: 'Select NET', icon: 'dns', action: null, requiresAdmin: false },
    { path: '/ncs-main-view', label: 'Main View', icon: 'checklist', action: null, requiresAdmin: false },
    { path: '/ncs-net-assignments', label: 'NET Assignments', icon: 'assignment', action: null, requiresAdmin: false },
    { path: '/ncs-view2', label: 'View 2', icon: 'table_chart', action: null, requiresAdmin: false },
    { path: '/ncs-people', label: 'People', icon: 'people', action: null, requiresAdmin: false },
    { path: '/ncs-locations', label: 'Locations', icon: 'location_on', action: null, requiresAdmin: false },
    { path: '/ncs-duties', label: 'Duties', icon: 'work', action: null, requiresAdmin: false },
    { path: '/ncs-settings', label: 'Settings', icon: 'settings', action: null, requiresAdmin: true },
    { path: null, label: 'Logout', icon: 'logout', action: 'logout', requiresAdmin: false },
    { path: '/ncs-about', label: 'About', icon: 'info', action: null, requiresAdmin: false }
  ];

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initUserPreferences();
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.checkAdminStatus();
      } else {
        this.isAdmin = false;
      }
    });
  }

  initUserPreferences(): void {
    // Initialize grid line thickness
    const savedThickness = localStorage.getItem('gridLineThickness');
    if (savedThickness) {
      document.documentElement.style.setProperty('--grid-line-thickness', `${savedThickness}px`);
    }
  }

  async checkAdminStatus(): Promise<void> {
    this.isAdmin = await this.permissionService.isAdminOnce();
  }

  shouldShowMenuItem(item: any): boolean {
    if (item.requiresAdmin) {
      return this.isAdmin;
    }
    return true;
  }

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
