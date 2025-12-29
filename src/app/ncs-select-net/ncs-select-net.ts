import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseService } from '../_services/firebase.service';

@Component({
  selector: 'app-ncs-select-net',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ncs-select-net.html',
  styleUrl: './ncs-select-net.css',
})
export class NcsSelectNet implements OnInit {
  currentNetId: string = '';
  currentNetName: string = '';
  nets: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNets();

    const savedNetId = localStorage.getItem('currentNetId');
    if (savedNetId) {
      this.currentNetId = savedNetId;
      const net = this.nets.find(n => n.id === savedNetId);
      if (net) {
        this.currentNetName = net.name;
      }
    }
  }

  loadNets(): void {
    this.firebaseService.getNets().subscribe({
      next: (nets) => {
        this.nets = nets;
        const savedNetId = localStorage.getItem('currentNetId');
        if (savedNetId) {
          const net = this.nets.find(n => n.id === savedNetId);
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

  selectNet(netId: string): void {
    this.currentNetId = netId;
    this.firebaseService.setCurrentNet(netId);
    localStorage.setItem('currentNetId', netId);

    const net = this.nets.find(n => n.id === netId);
    if (net) {
      this.currentNetName = net.name;
    }

    this.router.navigate(['/ncs-net-assignments']);
  }

  createNewNet(): void {
    const netName = prompt('Enter NET name:');
    if (netName) {
      this.firebaseService.createNet(netName).then((netId) => {
        this.selectNet(netId);
      });
    }
  }
}
