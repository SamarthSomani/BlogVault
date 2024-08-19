// src/app/MyComponents/comment/comment.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog, Comment } from '../../models/blog.model';
import { BlogService } from '../../blog.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class CommentComponent implements OnInit {
  @Input() blogId: string = '';
  newCommentContent: string = '';
  comments: Comment[] = [];

  constructor(private http: HttpClient){}

  ngOnInit() {
    this.getComments();
  }

  addComment() {
    if (!this.newCommentContent.trim()) {
      alert("Comment content cannot be empty.");
      return;
    }

    const commentData = {
      content: this.newCommentContent
    };

    this.http.post(`https://localhost:7070/api/blogs/${this.blogId}/addComment`, commentData, { withCredentials: true, responseType: 'text' })
      .subscribe(response => {
        alert('Comment added successfully.');
        this.newCommentContent = '';
        this.getComments(); // Refresh comments list
      }, error => {
        alert('Failed to add comment.');
      });
  }
  
  getComments(): void {
    this.http.get(`https://localhost:7070/api/blogs/${this.blogId}/allComments`, { withCredentials: true })
      .subscribe(response => {
        this.comments = response as any[];
      });
  }
}
