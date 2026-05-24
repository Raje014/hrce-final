import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../footer/footer.component';

declare let L: any;

@Component({
  selector: 'app-temple-status',
  templateUrl: './temple-status.page.html',
  styleUrls: ['./temple-status.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FooterComponent]
})
export class TempleStatusPage {

  map: any;

  temples: any[] = [];
  filteredTemples: any[] = [];
  paginatedTemples: any[] = [];

  searchText = '';
  statusFilter = 'all';

  page = 1;
  pageSize = 5;
  totalPages = 1;
  markers: any = {};
  markerLayer: any;

  constructor(private http: HttpClient, private router: Router) {}

  ionViewDidEnter() {
    this.initMap();
    setTimeout(() => {
      this.loadAll();
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 500);
    }, 500);
  }
  
  ionViewWillLeave() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.markers = {};
  }
  
  refreshMap() {

    this.temples = [];
    this.filteredTemples = [];
    this.paginatedTemples = [];

    // remove old markers
    Object.values(this.markers).forEach(
      (m: any) => {
        if (m) {
          this.map.removeLayer(m);
        }
      }
    );

    this.markers = {};

    // reload API data
    this.loadAll();

  }
  
  initMap() {
 
    // destroy old map object
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
 
    // IMPORTANT FIX
    const mapContainer = L.DomUtil.get('map');
 
    if (mapContainer != null) {
      (mapContainer as any)._leaflet_id = null;
    }
 
    // create fresh map
    this.map = L.map('map-status').setView(
      [11.1271, 78.6569],
      7
    );
 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    setTimeout(() => {

      if (this.map) {
        this.map.invalidateSize(true);
        this.map.setView(
          [11.1271, 78.6569],
          7
        );
      }
    }, 1000);
 
    const refreshControl = (L as any).control({
      position: 'topleft'
    });
 
    refreshControl.onAdd = () => {
 
      const div = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control'
      );
 
      div.innerHTML = `
        <a href="#" style="font-size:18px;">⟳</a>
      `;
 
      div.onclick = (e: any) => {
        e.preventDefault();
        this.refreshMap();
      };
 
      return div;
    };
    refreshControl.addTo(this.map);
  }
 
  /* ================= API ================= */
  loadAll() {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const officeCode = user.office_code;

    console.log('Office Code:', officeCode);

    this.http.get<any>(
      `https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/get_all.php?office_code=${officeCode}`
    )
    .subscribe({
      next: (res) => {
        console.log("STATUS RESPONSE:", res);

        this.temples = res.data || [];
        setTimeout(() => {

            if (this.map) {

              this.map.invalidateSize();

              this.applyFilters();

              this.renderMarkers();

              setTimeout(() => {
                this.map.invalidateSize();
              }, 300);

            }

          }, 500);
        setTimeout(() => {

          if (this.map) {
            this.map.invalidateSize();
          }

        }, 300);
      },

      error: (err) => {
        console.log("STATUS API ERROR:", err);
      }
    });
  }

  /* ================= FILTER ================= */
  setStatus(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters() {

    let data = [...this.temples];

    if (this.searchText?.trim()) {

      const search = this.searchText.toLowerCase().trim();

      data = data.filter(t =>

        (t.temple_name || '').toLowerCase().includes(search) ||

        (t.temple_id || '').toString().toLowerCase().includes(search) ||

        (t.off_shortcd || '').toLowerCase().includes(search) ||

        (t.dist_name || '').toLowerCase().includes(search) ||

        (t.office_code || '').toString().toLowerCase().includes(search) ||

        (t.status || '').toLowerCase().includes(search)

      );
    }

    if (this.statusFilter !== 'all') {
      data = data.filter(
        t => (t.status || '').toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    this.filteredTemples = data;

    this.totalPages = Math.ceil(data.length / this.pageSize);
    this.page = 1;

    this.updatePagination();

    // refresh map
    if (this.map) {
      this.renderMarkers();
    }
  }

  renderMarkers() {

    if (!this.map) return;

    // ✅ clear old markers properly
    if (this.markerLayer) {
      this.markerLayer.clearLayers();
    }

    this.markers = {};

    const validPoints: any[] = [];

    this.filteredTemples.forEach(t => {

      const lat = Number(t.new_lat);
      const lng = Number(t.new_lng);

      console.log("LAT LNG:", lat, lng);

      // ✅ skip invalid rows
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        console.log("Invalid row skipped:", t);
        return;
      }

      validPoints.push([lat, lng]);

      // ================= STATUS COLOR =================

      let iconUrl = 'assets/icon/blue-marker.png';

      const status = (t.status || '').toLowerCase();

      if (status === 'approved') {
        iconUrl = 'assets/icon/green-marker.png';
      }

      else if (status === 'rejected') {
        iconUrl = 'assets/icon/red-marker.png';
      }

      // ================= ICON =================

      const customIcon = L.icon({
        iconUrl,
        iconSize: [30, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // ================= MARKER =================

      const marker = L.marker(
        [lat, lng],
        { icon: customIcon }
      ).addTo(this.markerLayer);

      marker.bindPopup(`
        <b>${t.temple_id}</b><br>
        ${t.temple_name}
      `);

      this.markers[t.temple_id] = marker;

    });

    // ================= FIT BOUNDS =================

    if (validPoints.length > 0) {

      const bounds = L.latLngBounds(validPoints);

      this.map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15
      });

    } else {

      // default Tamil Nadu view
      this.map.setView(
        [11.1271, 78.6569],
        7
      );

    }

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 300);

  }

  focusTemple(t: any) {

    console.log("FOCUS TEMPLE:", t);

    const marker =
      this.markers[
        t.temple_id
      ];

    if (!marker) return;

    this.map.setView(
      marker.getLatLng(),
      17
    );

    marker.openPopup();

  }

  updatePagination() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTemples = this.filteredTemples;
  }

  nextPage() {
    this.page++;
    this.updatePagination();
  }

  prevPage() {
    this.page--;
    this.updatePagination();
  }

  goBack() {
    this.router.navigate(['/official-dashboard']);
  }
}
