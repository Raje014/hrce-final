import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,FooterComponent]
})

export class ContactPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  goBack(){
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

}
