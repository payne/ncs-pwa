import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-ncs-login',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './ncs-login.html',
  styleUrl: './ncs-login.css',
})
export class NcsLogin {
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signInWithGoogle(): void {
    this.errorMessage = '';
    this.authService.signInWithGoogle()
      .then(() => {
        this.router.navigate(['/ncs-main-view']);
      })
      .catch((error) => {
        this.errorMessage = 'Failed to sign in. Please try again.';
        console.error('Sign in error:', error);
      });
  }
}
