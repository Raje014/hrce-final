import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-sub-users',
  templateUrl: './sub-users.page.html',
  styleUrls: ['./sub-users.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule, 
    FormsModule,
    FooterComponent
  ]
})

export class SubUsersPage{

  // 🔹 Sub-user fields
  newUsername: string = '';
  newPassword: string = '';

  // 🔹 API endpoint
  createUserApi = 'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/sub_users.php';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  formatUsername() {
    this.newUsername = this.newUsername
      .toLowerCase()             
      .replace(/[^a-z0-9_]/g, ''); 
  } 

  /* ================= CREATE USER ================= */
  createUser() {

  if (!this.newUsername || !this.newPassword) {
    alert("Fill all fields");
    return;
  }

  const officer_id = Number(localStorage.getItem('user_id'));

  this.http.post<any>('https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/create_subuser.php', {
    username: this.newUsername,
    password: this.newPassword,
    officer_id: officer_id
  }).subscribe(res => {

    if (res.status === 'success') {
      alert("Sub User Created");
      this.newUsername = '';
      this.newPassword = '';
    } else {
      alert("Unable to proceed! Username/password may be incorrect or the account already exists.");
    }

  });
}

  /* ================= CANCEL ================= */
  goBack() {
    this.router.navigate(['/official-dashboard']);
  }

}