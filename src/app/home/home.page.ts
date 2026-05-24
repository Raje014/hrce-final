import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { HostListener } from '@angular/core';

declare let L: any;

const templeIcon = L.icon({
  iconUrl: 'assets/marker-icon.png',
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    FooterComponent, 
  ]
})

export class HomePage {

  map: any;
  marker: any;

  searchText = '';
  suggestions: any[] = [];
  selectedTemple: any = null;

  searchTimeout: any;
  user: any = null;
  userInitial: string = '';

  // form
  isAdding = false;
  isMoving = false;

  userMarker: any;
  templeMarker: any;

  formData: any = {
    temple_name: '',
    location: '',
    latitude: '',
    longitude: '',
    district_c: ''
  };

  showForm = false;

  // UPDATE FLOW (separate from add flow)
  isUpdatingGPS = false;
  isUpdateMoving = false;

  updateTempleMarker: any;
  updateUserMarker: any;

  hasLocation = false;
  updateLine: any = null;

  captchaText = '';
  userCaptcha = '';
  pendingTemple: any = null;

  constructor(
    private http: HttpClient, 
    private popoverCtrl: PopoverController, 
    private router: Router,
    // private platform: Platform
  ) {}


  // CAPS
  formatTempleCode() {
    if (!this.searchText) return;
    this.searchText = this.searchText
      .toUpperCase()          
      .replace(/[^A-Z0-9]/g, ''); 
  }

  refreshMap() {
    window.location.reload();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {

    const clickedInside = event.target.closest('.search-box');

    if (!clickedInside) {
      this.suggestions = [];   // ✅ close dropdown
    }
  }

  // logout
  logout() {
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

  // load User
  loadUser() {
    const userData = localStorage.getItem('user');

    if (userData) {
      this.user = JSON.parse(userData);

      if (this.user.email) {
        this.userInitial = this.user.email.charAt(0).toUpperCase();
      }
    }
  }

  generateCaptcha() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let result = '';

    for (let i = 0; i < 5; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    this.captchaText = result;
  }

  verifyCaptcha() {

    const entered = this.userCaptcha.trim().toLowerCase();
    const actual = this.captchaText.trim().toLowerCase();

    if (entered !== actual) {
      alert('Invalid captcha');

      this.generateCaptcha();
      this.userCaptcha = '';

      return;
    }

    // success
    this.selectedTemple = this.pendingTemple;

    const lat = parseFloat(this.pendingTemple.latitude);
    const lng = parseFloat(this.pendingTemple.longitude);

    this.hasLocation = !isNaN(lat) && !isNaN(lng);

    this.showOnMap(this.pendingTemple);

    this.pendingTemple = null;
  }

  closeForm() {
    this.pendingTemple = null;
    this.userCaptcha = '';
  }
  
  // map
  ionViewDidEnter() {

    this.loadUser();

    if (this.map) this.map.remove();

    this.map = L.map('map').setView([10.3, 78.6], 7);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(this.map);

    const refreshControl = L.control({ position: 'topleft' });

    refreshControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        <a href="#" title="Refresh" style="font-size:18px;">⟳</a>
      `;
      div.onclick = (e: any) => {
        e.preventDefault();
        this.refreshMap();
      };
      return div;
    };
    refreshControl.addTo(this.map);

  }

  // ================= SEARCH =================
  onSearchInput() {

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {

      if (!this.searchText || this.searchText.length < 2) {
        this.suggestions = [];
        return;
      }

      const fd = new FormData();
      fd.append("search", this.searchText);

      this.http.post<any>("https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/searchTemple.php", fd)
        .subscribe(res => {
          this.suggestions = res.status === "success" ? res.data : [];
        });

    }, 300);
  }

  // ================= SELECT =================
  selectSuggestion(item: any) {

    this.searchText = item.temple_name;
    this.suggestions = [];

    // store temporarily
    this.pendingTemple = item;

    // generate captcha
    this.generateCaptcha();

    // clear old input
    this.userCaptcha = '';

    // this.selectedTemple = item;

    // const lat = parseFloat(item.latitude);
    // const lng = parseFloat(item.longitude);

    // this.hasLocation = !isNaN(lat) && !isNaN(lng);

    // this.showOnMap(item);
  }

  // ================= MAP =================
  showOnMap(t: any) {

    if (this.marker) this.map.removeLayer(this.marker);

    const lat = parseFloat(t.latitude);
    const lng = parseFloat(t.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {

      this.marker = L.marker([lat, lng], {
        icon: templeIcon
      }).addTo(this.map);

      this.map.setView([lat, lng], 20);

      this.marker.bindPopup(`
        <div class="popup-card">
          <div class="popup-header">${t.temple_name}</div>

          <div class="popup-row">
            <b>Temple ID:</b> ${t.templeid}
          </div>

          <div class="popup-row">
            <b>Temple Name:</b> ${t.temple_name}
          </div>
        </div>
      `, {
      offset: [0, -30],          
      autoPan: true,
      autoPanPadding: [50, 50]
    });
      this.marker.openPopup();

    } else {

      const rLat = 13 + Math.random();
      const rLng = 80 + Math.random();

      this.marker = L.marker([rLat, rLng], {
        icon: templeIcon
      }).addTo(this.map);

      this.map.setView([rLat, rLng], 7);
    }
  }

  clearSearch() {
    this.searchText = '';
    this.suggestions = [];
    this.selectedTemple = null;

    if (this.marker) this.map.removeLayer(this.marker);
  }

  formatName(name: string) {
    const i = name.indexOf('Arulmigu');
    return i !== -1 ? name.substring(i) : name;
  }


disableMapInteraction() {
  this.map.dragging.disable();
  this.map.touchZoom.disable();
  this.map.doubleClickZoom.disable();
  this.map.scrollWheelZoom.disable();
}

enableMapInteraction() {
  this.map.dragging.enable();
  this.map.touchZoom.enable();
  this.map.doubleClickZoom.enable();
  this.map.scrollWheelZoom.enable();
}

}