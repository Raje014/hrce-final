import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { PublicLoginComponent } from '../login/public-login/public-login.component';
import { OfficialLoginComponent } from '../login/official-login/official-login.component';
import { MenuController } from '@ionic/angular';
import {LoginDropdownComponent } from '../login/login-dropdown/login-dropdown.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicLoginComponent,
    OfficialLoginComponent,
    FooterComponent,
    LoginDropdownComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardPage {
  
  showLoginMenu = false;
  showLogin = false;
  loginType: 'Public' | 'Official' | '' = '';

  constructor(private router: Router,private menu: MenuController) {}

  ionViewWillEnter() {
    this.showLogin = false;
    this.menu.close(); 
    this.menu.enable(true);  
  }

  toggleLoginMenu() {
    this.showLoginMenu = !this.showLoginMenu;
  }

  closeLoginMenu() {
    this.showLoginMenu = false;
  }

  goToContact() {
    this.menu.close();
    this.router.navigate(['/contact']);
  }
    
  goToAbout() {
    this.menu.close();
    this.router.navigate(['/about']);
  }

  contact(){
    this.router.navigate(['/contact']).then(() => location.reload());
  }

  about(){
    this.router.navigate(['/about']).then(() => location.reload());
  }

  home(){
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }


  // ✅ OPEN LOGIN POPUP
  openLogin(type: string) {
    this.loginType = type as 'Public' | 'Official';
    this.showLogin = true;
    this.showLoginMenu = false;
  }

  // ✅ CLOSE LOGIN POPUP
  closeLogin() {
    this.showLogin = false;
  }

}