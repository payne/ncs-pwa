import { Component } from '@angular/core';
import { versionInfo } from '../../environments/version';

@Component({
  selector: 'app-ncs-about',
  imports: [],
  templateUrl: './ncs-about.html',
  styleUrl: './ncs-about.css',
})
export class NcsAbout {
  gitHash = versionInfo.gitHash;
  buildDate = this.formatBuildDate(versionInfo.buildDate);

  private formatBuildDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString();
  }
}
