// src/app/MyComponents/new-blog/new-blog.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-new-blog',
  templateUrl: './new-blog.component.html',
  styleUrls: ['./new-blog.component.css'],
  imports:[CommonModule, FormsModule],
  standalone: true,
})
export class NewBlogComponent {
  blogData = { title: '', content: '' };
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe({
      next: sessionValid => {
        if (!sessionValid.sessionValid) {
          this.router.navigate(['/login-page']);
        }
      },
      error: error => {
        console.error('Error checking session:', error);
        // Optionally, handle the error or redirect to login
      }
    });
  }

  createBlog() {
    this.errorMessage = null;

    // Basic validation
    if (!this.blogData.title || !this.blogData.content) {
      this.errorMessage = "Title and Content are required.";
      return;
    }

    // Call the API to create a new blog
    this.http.post('https://localhost:7070/api/blogs/createBlog', this.blogData, { withCredentials: true , responseType: 'text'})
      .subscribe({
        next: (response) => {
          // Redirect to the blog list page after successful blog creation
          alert("Blog created successfully!");
          this.router.navigate(['/blog-view']); // Change to the appropriate route
        },
        error: (error) => {
          // Handle error response
          if (error.status === 400 || error.status === 401) {
            this.errorMessage = error.error; // Backend should return the specific error message
          } else {
            this.errorMessage = "An error occurred. Please try again later.";
          }
        }
      });
  }
}
