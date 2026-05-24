import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-registerform',
  templateUrl: './registerform.page.html',
  styleUrls: ['./registerform.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FooterComponent]
})
export class RegisterformPage {

  email = '';
  username = '';
  password = '';
  otp = '';
  officeSearch: string = '';          
  filteredOffices: any[] = [];
  showDropdown = false;

  isSendingOtp = false;
  selectedOffices: any[] = []; 

  otpSent = false;
  emailVerified = false;

  offices: any[] = [];

  message = '';

  registerUrl  = 'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/register_user.php';
  officeUrl    = 'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/get-offices.php';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  formatUsername() {
    this.username = this.username
      ?.toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
  }

  ngOnInit() {
    this.loadOffices();

    document.addEventListener('click', (event: any) => {
      const inside = event.target.closest('.jurisdiction-group');
      if (!inside) {
        this.showDropdown = false;
      }
    });
  }

  /* 🔹 Load jurisdiction list */
  loadOffices() {
    this.http.get<any>(this.officeUrl)   
      .subscribe(res => {

        this.offices = res.data;
        this.filteredOffices = res.data;

        console.log(this.offices);

      });
  }

  createAccount() {

    if (!this.username || !this.password || this.selectedOffices.length === 0) {
      this.message = "Fill all fields";
      return;
    }

    const admin_id = localStorage.getItem('user_id');

    // 🔥 convert to comma values
    const office_codes = this.selectedOffices.map(o => o.office_code).join(',');
    const office_names = this.selectedOffices.map(o => o.office_name).join(',');

    this.http.post<any>(
      'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/create_officer.php',
      {
        username: this.username,
        password: this.password,
        office_code: office_codes,
        off_shortcd: office_names,
        created_by: admin_id
      },
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe(res => {

      if (res.status === 'success') {
        this.message = "Officer Created";
        this.selectedOffices = [];
        this.officeSearch = '';
      } else {
        this.message = res.msg || "Error";
      }

    });
  }

  goBack(){
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

  // 🔍 FILTER
  filterOffices() {
    const term = this.officeSearch.toLowerCase();

    this.filteredOffices = this.offices.filter(o =>
      o.office_name.toLowerCase().includes(term)
    );
  }

  selectOffice(o: any) {
    const exists = this.selectedOffices.find(x => x.office_code === o.office_code);
    if (exists) return;
    this.selectedOffices.push(o);
    this.officeSearch = this.selectedOffices.map(x => x.office_name).join(', ');
    this.showDropdown = false;
  }

  removeOffice(o: any) {
    this.selectedOffices = this.selectedOffices.filter(x => x.office_code !== o.office_code);
    this.officeSearch = this.selectedOffices.map(x => x.office_name).join(', ');
  }

}