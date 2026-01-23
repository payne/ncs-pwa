import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { versionInfo } from '../../environments/version';

@Component({
  selector: 'app-ncs-about',
  imports: [CommonModule, MatIconModule],
  templateUrl: './ncs-about.html',
  styleUrl: './ncs-about.css',
})
export class NcsAbout implements OnInit {
  gitHash = versionInfo.gitHash;
  buildDate = this.formatBuildDate(versionInfo.buildDate);
  showNoGroupMessage = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.showNoGroupMessage = params['noGroup'] === 'true';
    });
  }

  private formatBuildDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString();
  }
}
