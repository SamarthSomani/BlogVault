// src/app/welcome/welcome.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomeComponent {
  constructor(private router: Router) { }

  goToBlogView(): void {
    this.router.navigate(['/blog-view']);
  }
}
