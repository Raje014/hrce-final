import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { TempleFormComponent } from '../temple-form/temple-form.component';

declare let L: any;

const templeIcon = L.icon({
  iconUrl: 'assets/marker-icon.png',
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.icon({
  iconUrl: 'assets/icon/man.png',
  iconSize: [35, 35],        
  iconAnchor: [17, 34],     
  popupAnchor: [0, -30]
});

@Component({
  selector: 'app-temple-location',
  templateUrl: './temple-location.page.html',
  styleUrls: ['./temple-location.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    FooterComponent,
    TempleFormComponent
  ]
})
export class TempleLocationPage{
  
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
  userOffice: number = 0;

  // update flow
  isUpdatingGPS = false;
  isUpdateMoving = false;

  updateTempleMarker: any;
  updateUserMarker: any;

  hasLocation = false;
  updateLine: any = null;

  templePointsLayer: any;
  templeLayer: any = null;

  constructor(
    private http: HttpClient, 
    private popoverCtrl: PopoverController, 
    private router: Router,
  ) {}

  // caps
  formatTempleCode() {
    if (!this.searchText) return;
    this.searchText = this.searchText
      .toUpperCase()          
      .replace(/[^A-Z0-9]/g, ''); 
  }

  // refresh map
  refreshMapData() {

    // search reset
    this.searchText = '';
    this.suggestions = [];

    // temple reset
    this.selectedTemple = null;

    // marker reset
    this.templeMarker = null;

    // form reset
    this.showForm = false;

    // action reset
    this.isAdding = false;
    this.isMoving = false;

    this.isUpdatingGPS = false;
    this.isUpdateMoving = false;

    this.hasLocation = false;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.ionViewDidEnter();
  }

  // logout
  logout() {
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userOffice = Number(user.office_code);
    console.log('User Office:', this.userOffice); 
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

  // map
  ionViewDidEnter() {
    this.loadUser();
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }

    this.templeLayer = null;

    // Tamil Nadu center
    this.map = L.map('map', {
      zoomControl: true
    }).setView([11.1271, 78.6569], 7);

    // Base map
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19
      }
    ).addTo(this.map);

    const refreshControl = L.control({ position: 'topleft' });

      refreshControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
          <a href="#" title="Refresh" style="font-size:18px;">⟳</a>
        `;
        div.onclick = (e: any) => {
          e.preventDefault();
          this.refreshMapData();
        };
        return div;
      };
      refreshControl.addTo(this.map);

    // Load temples from geoserver
    this.loadTemplePoints();
  }

  // load temple point
  loadTemplePoints() {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const officeCode =
      user.office_code;

    /* remove old layer before reload */
    if (!this.templePointsLayer) {
      this.templePointsLayer =
        L.layerGroup().addTo(this.map);
    } else {
      this.templePointsLayer.clearLayers();
    }

    const wfsUrl =
      `http://localhost:8080/geoserver/hrce/ows?` +
      `service=WFS&` +
      `version=1.0.0&` +
      `request=GetFeature&` +
      `typeName=hrce:sp_temple_data&` +
      `outputFormat=application/json&` +
      `CQL_FILTER=office_code='${officeCode}'`;

    this.http.get<any>(
      wfsUrl
    ).subscribe({

      next: (geojson) => {

        this.templePointsLayer =
          L.geoJSON(
            geojson,
            {
              pointToLayer: (
                feature: any,
                latlng: any
              ) => {
                return L.circleMarker(
                  latlng,
                  {
                    radius: 6,
                    weight: 1,
                    fillOpacity: 0.9
                  }
                );
              },
              onEachFeature: (
                feature: any,
                layer: any
              ) => {
                const props =
                  feature.properties;
                layer.bindPopup(`
                  <div style="min-width:160px">
                    <b>${props.temple_name || ''}</b>
                    <br>
                    Temple ID:
                    ${props.templeid || ''}
                  </div>
                `);
              }
            }
          );
        this.templePointsLayer.addTo(
          this.map
        );
        const bounds =
          this.templePointsLayer.getBounds();
        if (
          bounds.isValid()
        ) {
          this.map.fitBounds(
            bounds,
            {
              padding: [20, 20]
            }
          );
        }
      },
      error: (err) => {
        console.log(
          "GeoServer Error:",
          err
        );
      }
    });
  }

  // ================= SEARCH ================= 
  onSearchInput() {
    clearTimeout(
      this.searchTimeout
    );
    this.searchTimeout =
      setTimeout(() => {

      if (
        !this.searchText ||
        this.searchText.length < 2
      ) {
        this.suggestions = [];
        return;
      }

      const user =
        JSON.parse(
          localStorage.getItem(
            'user'
          ) || '{}'
        );

      const fd =
        new FormData();

      fd.append(
        "search",
        this.searchText
      );

      fd.append(
        "office_code",
        user.office_code || ''
      );

      this.http.post<any>(
        "https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/searchInput.php",
        fd
      )
      .subscribe(res => {

        this.suggestions =
          res.status === "success"
          ? res.data
          : [];

      });
    }, 300);
  }

  // ================= SELECT =================
  selectSuggestion(item: any) {
    this.searchText = item.temple_name;
    this.suggestions = [];
    this.selectedTemple = item;

    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);

    this.hasLocation = !isNaN(lat) && !isNaN(lng);
    this.showOnMap(item);
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

  // clear
  clearSearch() {
    this.searchText = '';
    this.suggestions = [];
    this.selectedTemple = null;
    if (this.marker) this.map.removeLayer(this.marker);
  }

  // format search
  formatName(name: string) {
    const i = name.indexOf('Arulmigu');
    return i !== -1 ? name.substring(i) : name;
  }

  // add new
  async addNewTemple() {
    const loc = await this.getUserLocation();
    if (!loc) return;

    this.isAdding = true;
    this.isMoving = false;

    // remove old markers
    if (this.userMarker) this.map.removeLayer(this.userMarker);
    if (this.templeMarker) this.map.removeLayer(this.templeMarker);

    // user marker
    this.userMarker = L.marker([loc.lat, loc.lng], {
      icon: userIcon
    })
    .addTo(this.map)
    .bindPopup("You are here")
    .openPopup();

    // temple marker 
    this.templeMarker = L.marker([loc.lat, loc.lng], {
      draggable: false,
      icon: templeIcon
    }).addTo(this.map);
    this.map.setView([loc.lat, loc.lng], 17);
  }

  // togglemove
  toggleMove() {
    if (!this.templeMarker) return;
    if (!this.isMoving) {
      this.isMoving = true;

      // Disable only map drag
      this.map.dragging.disable();

      // Enable marker drag
      this.templeMarker.dragging.enable();

      // Keep marker on top
      this.templeMarker.on('dragstart', () => {
        this.templeMarker.setZIndexOffset(1000);
      });
    } else {
      this.isMoving = false;

      // Stop marker drag
      this.templeMarker.dragging.disable();

      // Enable map again
      this.map.dragging.enable();

      const pos = this.templeMarker.getLatLng();

      this.formData.latitude = pos.lat;
      this.formData.longitude = pos.lng;

      this.fetchGeoDetails(pos.lat, pos.lng);
      this.showForm = true;
    }
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

  // form
  onSubmitForm(form: any) {
    if (form.invalid) {
      alert("Fill all required fields");
      return;
    }

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const fd = new FormData();

    fd.append('username', user.username || '');
    fd.append('office_code', user.office_code || '');

    // temple
    fd.append('temple_id', this.formData.temple_id || '');
    fd.append('temple_name', this.formData.temple_name || '');

    // gps
    fd.append('latitude', this.formData.latitude || '');
    fd.append('longitude', this.formData.longitude || '');

    // geo codes
    fd.append('district_c', this.formData.district_c || '');
    fd.append('taluk_c', this.formData.taluk_c || '');
    fd.append('village_c', this.formData.village_c || '');

    console.log("username:", user.username);
    console.log("office_code:", user.office_code);

    console.log("temple_name:", this.formData.temple_name);

    console.log("district_c:", this.formData.district_c);
    console.log("taluk_c:", this.formData.taluk_c);
    console.log("village_c:", this.formData.village_c);

    console.log("lat:", this.formData.latitude);
    console.log("lng:", this.formData.longitude);

    this.http.post<any>(
      "https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/saveTemple.php",
      fd
    ).subscribe({

      next: (res) => {

        console.log("API RESPONSE:", res);

        if (res.status === 'success') {
          alert("Request submitted successfully");
          // window.location.reload();
          this.refreshMapData();
        } else {
          alert(res.message || "Failed");
        }

      },

      error: (err) => {
        console.log("API ERROR:", err);
        alert("Submit failed");
      }

    });
  }

  resetPage() {
    this.showForm = false;
    this.isAdding = false;
    this.isMoving = false;
  }

  onCloseForm() {
    this.showForm = false;
    this.enableMapInteraction();
  }

  fetchGeoDetails(lat: number, lng: number) {
    const fd = new FormData();
    fd.append('lat', lat.toString());
    fd.append('lng', lng.toString());

    this.http.post<any>(
      'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/get_location_details.php',
      fd
    ).subscribe(res => {
      if (res.status === 'success') {

        // names for UI
        this.formData.district = res.data.dist_name;
        this.formData.taluk = res.data.taluk_name;
        this.formData.village = res.data.vill_name;

        // codes for DB
        this.formData.district_c = res.data.dist_cd;
        this.formData.taluk_c = res.data.taluk_cd;
        this.formData.village_c = res.data.vill_cd;
      }
      this.showForm = true;
    });
  }

  // geo location
  async getUserLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const isNative = (window as any).Capacitor?.isNativePlatform?.();

      // MOBILE
      if (isNative) {
        const permission = await Geolocation.requestPermissions();

        if (permission.location !== 'granted') {
          alert("Allow location permission");
          return null;
        }

        const position = await Geolocation.getCurrentPosition();

        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }

      // WEB (browser)
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }),
          (err) => {
            console.log("WEB ERROR:", err);

            if (err.code === 1) {
              alert("Permission denied");
            } else {
              alert("Turn ON location");
            }

            resolve(null);
          }
        );
      });

    } catch (e) {
      console.log("ERROR:", e);
      alert("Location error");
      return null;
    }
  }

  // ================= UPDATE / ADD GPS =================
  async startUpdateGPS() {
    if (
      this.templePointsLayer
    ) {
      this.map.removeLayer(
        this.templePointsLayer
      );
    }
    if (!this.selectedTemple) return;

    const userOffice = Number(localStorage.getItem('office_code'));

    if (this.selectedTemple.office_code != userOffice) {
      alert("You can update only your jurisdiction temples");
      return;
    }

    // Remove search-result marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    // Clean previous update markers
    if (this.updateTempleMarker) {
      this.map.removeLayer(this.updateTempleMarker);
      this.updateTempleMarker = null;
    }
    if (this.updateUserMarker) {
      this.map.removeLayer(this.updateUserMarker);
      this.updateUserMarker = null;
    }
    if (this.updateLine) {
      this.map.removeLayer(this.updateLine);
      this.updateLine = null;
    }

    const loc = await this.getUserLocation();
    if (!loc) return;

    this.isUpdatingGPS = true;
    this.isUpdateMoving = false;

    // User marker
    this.updateUserMarker = L.marker([loc.lat, loc.lng], {
      icon: userIcon
    }).addTo(this.map).bindPopup("Your Location").openPopup();

    // Temple marker position
    let templeLat = parseFloat(this.selectedTemple.latitude);
    let templeLng = parseFloat(this.selectedTemple.longitude);

    const noSavedLocation = isNaN(templeLat) || isNaN(templeLng);

    if (noSavedLocation) {
      // No saved coords → place temple marker at user location
      templeLat = loc.lat;
      templeLng = loc.lng;
    }

    this.updateTempleMarker = L.marker([templeLat, templeLng], {
      icon: templeIcon,
      draggable: false
    }).addTo(this.map)
      .bindPopup("Tap Move Marker to place correctly");

    setTimeout(() => {

      try {

        const userLatLng = this.updateUserMarker?.getLatLng();
        const templeLatLng = this.updateTempleMarker?.getLatLng();

        if (!userLatLng || !templeLatLng) return;

        // Prevent identical point crash
        if (userLatLng.equals(templeLatLng)) {
          this.map.flyTo(userLatLng, 17);
          return;
        }

        const bounds = L.latLngBounds(userLatLng, templeLatLng);

        if (bounds.isValid()) {
          this.map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 16
          });
        } else {
          this.map.flyTo(templeLatLng, 16);
        }
      } catch (e) {
        console.error("Bounds error prevented:", e);
      }
    }, 200);
  }

  // ================= TOGGLE MOVE (update flow) =================
  toggleUpdateMove() {
    if (!this.updateTempleMarker) return;
    this.isUpdateMoving = !this.isUpdateMoving;

    if (this.isUpdateMoving) {

      // Remove distance line if present
      if (this.updateLine) {
        this.map.removeLayer(this.updateLine);
        this.updateLine = null;
      }

      // Enable drag on the SAME marker (no new marker created)
      this.updateTempleMarker.dragging.enable();
      this.updateTempleMarker.closePopup();

      // Zoom into temple marker so user can place precisely
      this.map.flyTo(this.updateTempleMarker.getLatLng(), 18, { duration: 0.8 });

    } else {

      // Stop drag
      this.updateTempleMarker.dragging.disable();
      const pos = this.updateTempleMarker.getLatLng();

      if (confirm("Confirm new location?")) {
        this.submitUpdateGPS(pos.lat, pos.lng);
      } else {
        // User cancelled → re-enable drag so they can try again
        this.isUpdateMoving = true;
        this.updateTempleMarker.dragging.enable();
      }
    }
  }

  // submit gps
  submitUpdateGPS(lat: number, lng: number) {
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const fd = new FormData();

    fd.append('username', user.username || '');
    fd.append('office_code', user.office_code || '');

    fd.append(
      'temple_id',
      this.selectedTemple.temple_id || ''
    );

    fd.append('new_lat', lat.toString());
    fd.append('new_lng', lng.toString());

    this.http.post<any>(
      "https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/update_gps.php",
      fd
    ).subscribe({
      next: (res) => {
        console.log("API RESPONSE:", res);

        if (res.status === 'success') {

          alert("Request submitted successfully");
          // window.location.reload();
          this.refreshMapData();
        } else {

          alert(
            res.message || "Failed"
          );
        }
      },
      error: (err) => {

        console.log("FULL ERROR:", err);
        console.log("SERVER ERROR:", err.error);

        alert(
          err?.error?.message ||
          err?.message ||
          "Submit failed"
        );
      }
    });
  }

  resetForm() {
    this.formData = {
      temple_id: '',
      temple_name: '',
      district: '',
      taluk: '',
      village: '',
      latitude: '',
      longitude: ''
    };
  }
  
  // reset gps
  resetUpdateGPS() {
    this.isUpdatingGPS = false;
    this.isUpdateMoving = false;

    if (this.updateTempleMarker) {
      this.map.removeLayer(this.updateTempleMarker);
      this.updateTempleMarker = null;
    }

    if (this.updateUserMarker) {
      this.map.removeLayer(this.updateUserMarker);
      this.updateUserMarker = null;
    }

    // show original temple again
    this.showOnMap(this.selectedTemple);
  }
}


