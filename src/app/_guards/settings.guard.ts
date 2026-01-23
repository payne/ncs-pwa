import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { PermissionService } from '../_services/permission.service';

export const settingsGuard = async () => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const isAdmin = await permissionService.isAdminOnce();
  if (isAdmin) {
    return true;
  } else {
    router.navigate(['/ncs-net-assignments']);
    return false;
  }
};
