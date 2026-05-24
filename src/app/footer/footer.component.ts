import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent  implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {}

  home(){
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

  contact(){
    this.router.navigate(['/contact']).then(() => location.reload());
  }

  about(){
    this.router.navigate(['/about']).then(() => location.reload());
  }
}
