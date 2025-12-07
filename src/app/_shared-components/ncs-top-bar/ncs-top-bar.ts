import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-ncs-top-bar',
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './ncs-top-bar.html',
  styleUrl: './ncs-top-bar.css',
})
export class NcsTopBar implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  currentTime: string = '';
  isOnline: boolean = true;
  userDisplayName: string = '';
  userPhotoURL: string = '';
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);

    // Listen for online/offline events
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    this.updateOnlineStatus();

    // Get user info
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userDisplayName = user.displayName || '';
        this.userPhotoURL = user.photoURL || '';
      }
    });
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    window.removeEventListener('online', this.updateOnlineStatus.bind(this));
    window.removeEventListener('offline', this.updateOnlineStatus.bind(this));
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  updateOnlineStatus() {
    this.isOnline = navigator.onLine;
  }

  toggleMenu() {
    this.menuToggle.emit();
  }

  signOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
