import { Component, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-official-login',
  templateUrl: './official-login.component.html',
  styleUrls: ['./official-login.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OfficialLoginComponent {

  // Close event for parent component
  @Output() close = new EventEmitter<void>();

  // Form fields
  username = '';
  password = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  formatUsername() {
    this.username = this.username
      ?.toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
  }

  login() {

    // Validation
    if (!this.username || !this.password) {
      alert("Enter credentials");
      return;
    }

    // API call
    this.http.post<any>(
      'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/officialLogin.php',
      {
        username: this.username,
        password: this.password
      }
    ).subscribe({

      next: (res) => {

        console.log('LOGIN RESPONSE:', res);

        if (res.status === 'success') {

          const user = res.user;

          // Store user data
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('user_id', user.id);
          localStorage.setItem('role', user.role);
          localStorage.setItem('off_shortcd', user.off_shortcd);
          localStorage.setItem('office_code', user.office_code);

          console.log('Role:', user.role);
          console.log('Jurisdiction:', user.off_shortcd);
          console.log('Office Code:', user.office_code);

          // Role-based navigation
          if (user.role === 'OFFICER') {
            this.router.navigate(['/official-dashboard']);
          } 
          else if (user.role === 'SUBUSER') {
            this.router.navigate(['/temple-location']);
          }

        } else {
          alert("Invalid login");
        }
      },

      error: (err) => {
        console.error('Login Error:', err);
        alert("Server error");
      }

    });
  }

  // Close popup/form
  closeForm() {
    this.close.emit();
  }

}