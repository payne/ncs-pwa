import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../_services/auth.service';
import { FirebaseService } from '../_services/firebase.service';
import { PermissionService } from '../_services/permission.service';
import { AppUser } from '../_models/ncs-settings.model';

@Component({
  selector: 'app-ncs-profile',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './ncs-profile.html',
  styleUrl: './ncs-profile.css',
})
export class NcsProfile implements OnInit {
  userEmail: string = '';
  userPhotoURL: string = '';
  googleDisplayName: string = '';

  customName: string = '';
  callsign: string = '';
  userGroups: string[] = [];

  isSaving: boolean = false;
  saveSuccess: boolean = false;
  saveError: string = '';

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserGroups();
  }

  async loadUserData(): Promise<void> {
    this.userEmail = this.authService.getUserEmail() || '';
    this.userPhotoURL = this.authService.getUserPhotoURL() || '';
    this.googleDisplayName = this.authService.getUserDisplayName() || '';

    if (this.userEmail) {
      const user = await this.firebaseService.getUserByEmail(this.userEmail);
      if (user) {
        this.customName = user.customName || '';
        this.callsign = user.callsign || '';
      }
    }
  }

  async loadUserGroups(): Promise<void> {
    this.userGroups = await this.permissionService.getUserGroupsOnce();
  }

  async saveProfile(): Promise<void> {
    if (!this.userEmail) return;

    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = '';

    try {
      await this.firebaseService.updateUserProfile(this.userEmail, {
        customName: this.customName.trim(),
        callsign: this.callsign.trim().toUpperCase()
      });
      this.saveSuccess = true;
      setTimeout(() => {
        this.saveSuccess = false;
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      this.saveError = 'Failed to save profile. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  getDisplayName(): string {
    return this.customName || this.googleDisplayName || this.userEmail;
  }
}
