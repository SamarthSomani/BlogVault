// src/app/MyComponents/blogs-view/blogs-view.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

interface BlogViewDto {
  title: string;
  name: string;
  blogId: string;
}

@Component({
  selector: 'app-blogs-view',
  templateUrl: './blogs-view.component.html',
  styleUrls: ['./blogs-view.component.css'],
  imports: [CommonModule],
  standalone: true,
})
export class BlogsViewComponent {
  blogs: BlogViewDto[] = [];
  selectedView: 'my' | 'all' = 'all'; // Default view

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private cdRef: ChangeDetectorRef) {  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe({
      next: response => {
        if (!response.sessionValid) {
          this.router.navigate(['/login-page']);
        }
      },
      error: error => {
        console.error('Error checking session:', error);
        // Optionally, handle the error or redirect to login
      }
    });
    this.showBlogs(this.selectedView); // Load the default view on initialization
    // console.log('Blogs at the end of ngOnInit : ',this.blogs);
  }

  showBlogs(viewType: 'my' | 'all'): void {
    this.selectedView = viewType;

    let apiUrl = '';
    if (viewType === 'my') {
        apiUrl = 'https://localhost:7070/api/Blogs/myBlogs';
    } else if (viewType === 'all') {
        apiUrl = 'https://localhost:7070/api/Blogs/allBlogs';
    }

    this.http.get<BlogViewDto[]>(apiUrl, { withCredentials: true })
        .subscribe(
            (response: BlogViewDto[]) => {
                console.log('Response from API:', response);
                this.blogs = response;
                console.log('Saved in this.blogs: ', this.blogs);
                this.cdRef.detectChanges(); // Manually trigger change detection
            },
            (error) => {
                console.error('Error fetching blogs:', error);
                alert('Failed to load blogs.');
            }
        );
}

  createNew() {
    this.router.navigate(['/new-blog']); // Navigate to the new blog page
  }

  Logout(){
      this.http.post('https://localhost:7070/api/Users/Logout', {}, {withCredentials: true, responseType: 'text'})
        .subscribe({
          next: (response) => {
            console.log('Logged out successfully:', response);
            // Redirect to the login page only if the backend logout is successful
            this.router.navigate(['/login-page']);
          },
          error: (error) => {
            console.error('Error logging out:', error);
            // Optionally, handle error (e.g., show a notification to the user)
          }
        });
  }

  viewBlog(blogId: string) {
    this.router.navigate(['/blog-detail', blogId]);
  }
}
