import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-temple-form',
  templateUrl: './temple-form.component.html',
  styleUrls: ['./temple-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class TempleFormComponent {

  constructor(
    private http: HttpClient,
  ) {}

  @Input() formData: any;
  @Input() isSubmitting: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();

  formatTempleId() {

    let value = this.formData.temple_id || '';
    value = value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    if (!value.startsWith('TM')) {
      value = 'TM' + value.replace(/^TM/i, '');
    }
    const numbers = value
      .substring(2)
      .replace(/[^0-9]/g, '');
    this.formData.temple_id =
      'TM' + numbers.substring(0, 7);
  }

  closeForm() {
    this.close.emit();
  }

  submitFormFn(form: any) {
    if (form.invalid) {
      alert('Please fill all the required fields');
      return;
    }
    this.submitForm.emit(this.formData);
  }

  districts: any[] = [];

  ngOnInit() {
    this.loadDistricts();
  }

  loadDistricts() {
    this.http.get('https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/get_districts.php')
      .subscribe((res: any) => {
        this.districts = res.data;
      });
  }
}

