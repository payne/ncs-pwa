import { Routes } from '@angular/router';
import { NcsNetAssignments } from './ncs-net-assignments/ncs-net-assignments';
import { NcsSelectNet } from './ncs-select-net/ncs-select-net';
import { NcsPeople } from './ncs-people/ncs-people';
import { NcsLocations } from './ncs-locations/ncs-locations';
import { NcsDuties } from './ncs-duties/ncs-duties';
import { NcsAbout } from './ncs-about/ncs-about';
import { NcsLogin } from './ncs-login/ncs-login';
import { NcsView2 } from './ncs-view2/ncs-view2';
import { NcsSettings } from './ncs-settings/ncs-settings';
import { authGuard } from './_guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/ncs-net-assignments', pathMatch: 'full' },
  { path: 'login', component: NcsLogin },
  { path: 'ncs-select-net', component: NcsSelectNet, canActivate: [authGuard] },
  { path: 'ncs-net-assignments', component: NcsNetAssignments, canActivate: [authGuard] },
  { path: 'ncs-view2', component: NcsView2, canActivate: [authGuard] },
  { path: 'ncs-people', component: NcsPeople, canActivate: [authGuard] },
  { path: 'ncs-locations', component: NcsLocations, canActivate: [authGuard] },
  { path: 'ncs-duties', component: NcsDuties, canActivate: [authGuard] },
  { path: 'ncs-settings', component: NcsSettings, canActivate: [authGuard] },
  { path: 'ncs-about', component: NcsAbout, canActivate: [authGuard] }
];
