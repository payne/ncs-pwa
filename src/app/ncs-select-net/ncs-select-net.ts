import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FirebaseService } from '../_services/firebase.service';
import { AuthService } from '../_services/auth.service';
import { PermissionService } from '../_services/permission.service';

@Component({
  selector: 'app-ncs-select-net',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './ncs-select-net.html',
  styleUrl: './ncs-select-net.css',
})
export class NcsSelectNet implements OnInit {
  currentNetId: string = '';
  currentNetName: string = '';
  nets: any[] = [];
  accessibleNets: any[] = [];
  userGroups: string[] = [];
  selectedGroupForNewNet: string = '';
  showNoAccessMessage: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for noAccess query param
    this.route.queryParams.subscribe(params => {
      this.showNoAccessMessage = params['noAccess'] === 'true';
    });

    this.loadUserGroups();
    this.loadNets();

    const savedNetId = localStorage.getItem('currentNetId');
    if (savedNetId) {
      this.currentNetId = savedNetId;
    }
  }

  async loadUserGroups(): Promise<void> {
    this.userGroups = await this.permissionService.getUserGroupsOnce();
    if (this.userGroups.length > 0) {
      this.selectedGroupForNewNet = this.userGroups[0];
    }
  }

  loadNets(): void {
    this.firebaseService.getNets().subscribe({
      next: async (nets) => {
        this.nets = nets;
        await this.filterAccessibleNets();

        const savedNetId = localStorage.getItem('currentNetId');
        if (savedNetId) {
          const net = this.accessibleNets.find(n => n.id === savedNetId);
          if (net) {
            this.currentNetName = net.name;
          }
        }
      },
      error: (error) => {
        console.error('Error loading NETs:', error);
      }
    });
  }

  async filterAccessibleNets(): Promise<void> {
    const isAdmin = await this.permissionService.isAdminOnce();

    if (isAdmin) {
      // Admins see all NETs
      this.accessibleNets = this.nets;
    } else {
      // Filter to only NETs in user's groups or legacy NETs (no group)
      this.accessibleNets = this.nets.filter(net =>
        !net.creatorGroup ||
        this.userGroups.some(g => g.toLowerCase() === net.creatorGroup.toLowerCase())
      );
    }
  }

  selectNet(netId: string): void {
    this.currentNetId = netId;
    this.firebaseService.setCurrentNet(netId);
    localStorage.setItem('currentNetId', netId);

    const net = this.accessibleNets.find(n => n.id === netId);
    if (net) {
      this.currentNetName = net.name;
    }

    this.showNoAccessMessage = false;
    this.router.navigate(['/ncs-net-assignments']);
  }

  createNewNet(): void {
    if (this.userGroups.length === 0) {
      alert('You must be in a group to create a NET.');
      return;
    }

    const netName = prompt('Enter NET name:');
    if (netName) {
      const creatorEmail = this.authService.getUserEmail() || '';
      const creatorGroup = this.selectedGroupForNewNet || this.userGroups[0];

      this.firebaseService.createNet(netName, creatorEmail, creatorGroup).then((netId) => {
        this.selectNet(netId);
      });
    }
  }
}
