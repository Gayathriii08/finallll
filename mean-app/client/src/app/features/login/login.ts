import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule], // Add HttpClientModule here
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData = {
    email: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const apiUrl = 'http://localhost:5000/api/v1/auth/login';

    this.http.post<{ token: string; message: string; user: any }>(apiUrl, this.loginData)
      .subscribe({
        next: (response) => {
          alert('Login Successful');
          console.log('Login success', response);
          
          // Store authentication data
          localStorage.setItem('authToken', response.token);
          if (response.user && response.user._id) {
            localStorage.setItem('userId', response.user._id);
                localStorage.setItem('userRole', response.user.role); // ✅ Added this line

          } else {
            // If user data is not in response, try to get it from profile
            this.getUserProfileAfterLogin(response.token);
            return;
          }
          
          console.log(response.message);
          console.log('Redirecting to dashboard...');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed:', err.error?.error || err.message);
          alert('Login failed: ' + (err.error?.error || err.message));
        }
      });
  }

  private getUserProfileAfterLogin(token: string) {
    const profileUrl = 'http://localhost:5000/api/v1/profile';
    const headers = { Authorization: `Bearer ${token}` };
    
    this.http.get<{ success: boolean; user: any }>(profileUrl, { headers })
      .subscribe({
        next: (response) => {
          if (response.success && response.user && response.user._id) {
            localStorage.setItem('userId', response.user._id);
                  localStorage.setItem('userRole', response.user.role || 'volunteer');
 // ✅ Add this here too

          }
          console.log('Redirecting to dashboard...');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Failed to get user profile:', err);
          // Still redirect to dashboard even if profile fetch fails
          this.router.navigate(['/dashboard']);
        }
      });
  }
}
