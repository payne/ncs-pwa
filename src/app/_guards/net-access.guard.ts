import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { PermissionService } from '../_services/permission.service';
import { FirebaseService } from '../_services/firebase.service';

export const netAccessGuard = async () => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // First check if user is in any group
  const isInAnyGroup = await permissionService.isInAnyGroupOnce();
  if (!isInAnyGroup) {
    router.navigate(['/ncs-about'], { queryParams: { noGroup: true } });
    return false;
  }

  // Get current NET ID from localStorage
  const currentNetId = localStorage.getItem('currentNetId');

  if (!currentNetId) {
    // No NET selected - redirect to select NET
    router.navigate(['/ncs-select-net']);
    return false;
  }

  // Check if user can access this NET
  const canAccess = await permissionService.canAccessNet(currentNetId);
  if (canAccess) {
    return true;
  } else {
    // User cannot access this NET - redirect to select NET
    router.navigate(['/ncs-select-net'], { queryParams: { noAccess: true } });
    return false;
  }
};
