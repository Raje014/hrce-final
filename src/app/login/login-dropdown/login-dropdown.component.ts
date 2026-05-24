import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-dropdown',
  templateUrl: './login-dropdown.component.html',
  styleUrls: ['./login-dropdown.component.scss']
})
export class LoginDropdownComponent {

  constructor(private router: Router) {}

  @Output() loginSelected =
    new EventEmitter<'Public' | 'Official'>();

  selectLogin(type: 'Public' | 'Official') {
    this.loginSelected.emit(type);
  }

  home(){
    this.router.navigate(['/home']).then(() => location.reload());
  }

}