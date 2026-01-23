import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { PermissionService } from '../_services/permission.service';

export const groupMemberGuard = async () => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const isInAnyGroup = await permissionService.isInAnyGroupOnce();
  if (isInAnyGroup) {
    return true;
  } else {
    // User is not in any group - redirect to about page with message
    router.navigate(['/ncs-about'], { queryParams: { noGroup: true } });
    return false;
  }
};
