import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from '../comment/comment.component';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { response } from 'express';

// Define the DTO interface to match the API response
export interface BlogDetailsDto {
  title: string;
  content: string;
  created: string; // Date string or use Date type if you convert it later
  username: string;
  name: string;
}

interface RatingsCountResponse {
  totalRatings: number;
}

interface AverageRatingResponse{
  averageRating: number;
}

interface CheckAccessResponse{
  access: boolean;
}

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, CommentComponent],
})
export class BlogDetailComponent implements OnInit {
  blogDetails: BlogDetailsDto | undefined;
  userRating: number = 0;
  blogId: string = '';
  totalRatingsCount: number = 0;
  averageRating: number = 0;
  error: string | undefined;
  hasAccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient, private authService: AuthService, private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.getBlog();
    this.getTotalRatingsForBlog();
    this.getAverageRatingForBlog();
    this.checkAccess();
  }

  getBlog(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.blogId = id!;
    
    this.http.get<BlogDetailsDto>(`https://localhost:7070/api/Blogs/${this.blogId}`, { withCredentials: true })
        .subscribe(
            (response: BlogDetailsDto) => {
                this.blogDetails = response;
            },
            (error) => {
                console.error('Error fetching blogs:', error);
                alert('Failed to load blogs.');
            }
        );
  }

  getTotalRatingsForBlog(): void {
    this.http.get<RatingsCountResponse>(`https://localhost:7070/api/Blogs/${this.blogId}/ratingsCount`, {
      withCredentials: true,
      responseType: 'json' // Ensure the response type is JSON
    })
    .subscribe({
      next: (response) => {
        this.totalRatingsCount = response.totalRatings; // Save the result in totalRatingsCount
        console.log('Total Ratings Count:', this.totalRatingsCount);
      },
      error: (error) => {
        console.error('Failed to get total ratings count:', error);
        // Optionally, handle the error (e.g., show a notification to the user)
      }
    });
  }

  getAverageRatingForBlog(){
    this.http.get<AverageRatingResponse>(`https://localhost:7070/api/Blogs/${this.blogId}/averageRating`, {
      withCredentials: true,
      responseType: 'json' // Ensure the response type is JSON
    })
    .subscribe({
      next: (response) => {
        this.averageRating = response.averageRating; // Save the result in totalRatingsCount
        console.log('Average Rating:', this.averageRating);
      },
      error: (error) => {
        console.error('Failed to get total ratings count:', error);
        // Optionally, handle the error (e.g., show a notification to the user)
      }
    });
  }

  submitRating(): void {
    if (this.userRating == null) { // Ensure the rating is not null
        alert('Please select a rating before submitting.');
        return;
    }

    const ratingData = { stars: this.userRating.valueOf() }; // Wrap the rating in an object

    this.http.post(`https://localhost:7070/api/Blogs/${this.blogId}/addOrUpdateRating`, ratingData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json' // Ensure Content-Type is set correctly
        },
        responseType: 'text'
    })
    .subscribe({
        next: response => {
            alert('Rating added or updated successfully.');
            this.getTotalRatingsForBlog();
            this.getAverageRatingForBlog(); // Refresh the blog details to update the rating
        },
        error: error => {
            console.error('Failed to add or update rating:', error);
            alert('Failed to add or update rating.');
        }
    });
  }

  checkAccess():void {
    this.http.get<CheckAccessResponse>(`https://localhost:7070/api/Blogs/${this.blogId}/checkUserAccess`, 
      {withCredentials: true}).subscribe({next: (response: CheckAccessResponse) => {
        console.log(response.access);
        this.hasAccess = response.access;
      },
    error: (err) => {
      console.log('Error in checking access : ', err);
    }})
  }

  deleteBlog(): Observable<boolean> {
    const url = `https://localhost:7070/api/Blogs/${this.blogId}/deleteBlog`;

    return this.http.delete(url, { responseType: 'text' , withCredentials: true }).pipe(
      map(response => {
        // Assuming successful deletion returns a success message
        console.log(response);
        return true;
      }),
      catchError(error => {
        console.error('Error deleting blog:', error);
        return of(false); // Return false in case of an error
      })
    );
  }

  onDeleteBlog() {
    this.deleteBlog().subscribe(success => {
      if (success) {
        console.log('Blog deleted successfully.');
        // Handle successful deletion, e.g., navigate to another page or refresh the list
      } else {
        console.error('Failed to delete blog.');
        // Handle the failure case
      }
    });
    this.router.navigate(['/blog-view']);
  }

  goBack(): void {
    this.router.navigate(['/blog-view']);
  }
}
