// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  isLoggedIn(): Observable<{ sessionValid: boolean, message: string }>{
    return this.http.get<{ sessionValid: boolean, message: string }>('https://localhost:7070/api/Users/CheckSession', { withCredentials: true });
  }
}
