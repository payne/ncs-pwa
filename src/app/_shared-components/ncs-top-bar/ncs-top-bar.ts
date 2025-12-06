import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ncs-top-bar',
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './ncs-top-bar.html',
  styleUrl: './ncs-top-bar.css',
})
export class NcsTopBar implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  currentTime: string = '';
  isOnline: boolean = true;
  private timeInterval: any;

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);

    // Listen for online/offline events
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    this.updateOnlineStatus();
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
}
