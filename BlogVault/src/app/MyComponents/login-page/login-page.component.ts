// src/app/MyComponents/login-page/login-page.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../../blog.service';

// Define an interface for User
interface User {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginPageComponent {
  loginData = { username: '', password: '' };
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.errorMessage = null;

    this.http.post<any>('https://localhost:7070/api/users/login', this.loginData, { withCredentials: true })
      .subscribe({
        next: (response) => {
          // Redirect to the blogs view page on successful login
          this.router.navigate(['/blog-view']);
        },
        error: (error) => {
          // Handle error response
          if (error.status === 401) {
            this.errorMessage = "Invalid username or password.";
          } else if (error.status === 400) {
            this.errorMessage = "Username or Password cannot be empty.";
          } else {
            this.errorMessage = "An error occurred. Please try again later.";
          }
        }
      });
  }

  createAccount() {
    this.router.navigate(['/create-account']);
  }
}
