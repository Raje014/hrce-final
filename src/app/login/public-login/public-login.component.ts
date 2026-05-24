import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss'],
  imports: [
    FormsModule,
    IonicModule
  ],
})

export class PublicLoginComponent  implements OnInit {

  constructor(
    private router: Router
  ) {}

  @Output() close = new EventEmitter<void>();
  ngOnInit() {}

  username: string = '';

  login() {
    if (!this.username) {
      alert('Enter username');
      return;
    }
    localStorage.setItem('username', this.username);
    this.close.emit();
    this.router.navigate(['/home']);
  }

}
