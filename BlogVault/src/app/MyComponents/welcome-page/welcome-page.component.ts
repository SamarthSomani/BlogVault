// src/app/MyComponents/welcome-page/welcome-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent {
  constructor(private router: Router) { }

  goToBlogView(): void {
    this.router.navigate(['/login-page']);
  }
}
