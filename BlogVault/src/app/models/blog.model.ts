import { rating } from "./rating.model";

export interface Comment {
  commentId: string;
  username: string;
  content: string;
  dateTime: string;
}

export interface Blog {
    Id: string;
    Title: string;
    Content: string;
    Username: string;
    Name: string;
    Created: Date;
    Ratings: rating[];
    Comments?: Comment[]; // Add this line for comments
  }