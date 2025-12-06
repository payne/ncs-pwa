import { Routes } from '@angular/router';
import { NcsNetAssignments } from './ncs-net-assignments/ncs-net-assignments';
import { NcsPeople } from './ncs-people/ncs-people';
import { NcsLocations } from './ncs-locations/ncs-locations';
import { NcsDuties } from './ncs-duties/ncs-duties';
import { NcsAbout } from './ncs-about/ncs-about';

export const routes: Routes = [
  { path: '', redirectTo: '/ncs-net-assignments', pathMatch: 'full' },
  { path: 'ncs-net-assignments', component: NcsNetAssignments },
  { path: 'ncs-people', component: NcsPeople },
  { path: 'ncs-locations', component: NcsLocations },
  { path: 'ncs-duties', component: NcsDuties },
  { path: 'ncs-about', component: NcsAbout }
];
