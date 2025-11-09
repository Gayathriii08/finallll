import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:5000/api';  // MAKE SURE BACKEND IS 5000

  constructor(private http: HttpClient) {}

  getVolunteers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/volunteers`);
  }
}
