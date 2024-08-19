// src/app/MyComponents/login-page/login-page.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateAccountComponent {
  accountData = {name:'', username:'', password:''};
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {  }

  createAccount() {
    this.errorMessage = null;

    // Basic validation
    if (!this.accountData.name || !this.accountData.username || !this.accountData.password) {
      this.errorMessage = "All fields are required.";
      return;
    }

    // Call the API to create a new account
    this.http.post('https://localhost:7070/api/Users/CreateUser', this.accountData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          // Redirect to the login page after successful account creation
          alert("Account created successfully!");
          this.router.navigate(['/login-page']);
        },
        error: (error) => {
          // Handle error response
          if (error.status === 400) {
            this.errorMessage = error.error; // Backend should return the specific error message
          } else {
            this.errorMessage = "An error occurred. Please try again later.";
          }
        }
      });
  }
}
