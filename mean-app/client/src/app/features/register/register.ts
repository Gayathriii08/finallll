import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location:''
  };
  
  agreeTerms = false;
  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (!this.agreeTerms) {
      alert('Please agree to Terms & Conditions');
      return;
    }
    const { confirmPassword, ...apiData } = this.registerData;
    const apiUrl = 'http://localhost:5000/api/v1/auth/signup';
    this.http.post<{ message: string; userId: string }>(apiUrl, apiData)
      .subscribe({
        next: (res) => {
          alert('Registration successful! Please login.');
        },
        error: (err) => {
          alert('Registration failed: ' + err.error?.error || err.message);
        }
      });

  }

   ngOnInit() {
    console.log('✅ RegisterComponent loaded');
  }


}
