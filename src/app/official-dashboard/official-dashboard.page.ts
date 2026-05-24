import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';


@Component({
  selector: 'app-official-dashboard',
  templateUrl: './official-dashboard.page.html',
  styleUrls: ['./official-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OfficialDashboardPage {

  map: any;
  data: any[] = [];
  filteredData: any[] = [];
  markers: any = {};

  filter = 'all';

  // ✅ MODAL STATE
  showApproveModal = false;
  selectedId: number | null = null;
  templeCodeInput = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ionViewDidEnter() {
    this.initMap();
    this.loadData();
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
    window.location.reload();
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
    this.map = L.map('map').setView(
      [11.1271, 78.6569],
      7
    );

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(this.map);

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


  loadData() {

    const officeCode = localStorage.getItem('office_code') || '';

    console.log('Office Code:', officeCode);

    this.http.get<any>(
      `https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/get_request.php?office_code=${officeCode}&type=pending`
    ).subscribe(res => {

      console.log('API:', res);

      this.data = res.data || [];

      this.applyFilter();

    });

  }
  
  setFilter(type: string) {
    this.filter = type;
    this.applyFilter();
  }

  // show only pending
  applyFilter() {

    const pending = this.data.filter(d => d.status === 'pending');

    if (this.filter === 'all') {
      this.filteredData = pending;
    }

    if (this.filter === 'update') {
      this.filteredData = pending.filter(d => d.request_type === 'update_location');
    }

    if (this.filter === 'add') {
      this.filteredData = pending.filter(d => d.request_type === 'new');
    }

    this.renderMarkers();
  }

  // render marker
  renderMarkers() {

    Object.values(this.markers).forEach(
      (m: any) => this.map.removeLayer(m)
    );

    this.markers = {};

    if (!this.filteredData.length) return;

    const bounds = L.latLngBounds([]);

    this.filteredData.forEach(d => {

      const lat = parseFloat(d.lat);
      const lng = parseFloat(d.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      let color = 'orange';

      if (d.status === 'approved') color = 'green';
      else if (d.status === 'rejected') color = 'red';

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.9
      }).addTo(this.map);

      this.markers[d.id] = marker;

      marker.bindPopup(this.popupHTML(d));

      bounds.extend([lat, lng]);
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 17
      });
    }

    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  // popup
  popupHTML(d: any) {

    return `
      <div class="popup-box">

        <b>Temple Name: ${d.temple_name}</b><br>

        <b>Temple ID: ${d.temple_id || '-'}</b><br>

        <small>Status: ${d.status}</small><br><br>

        <button
          class="btn-approve"
          onclick="window.approveRequest(${d.id}, '${d.request_type}')"
        >
          Approve
        </button>

        <button
          class="btn-reject"
          onclick="window.reject(${d.id})"
        >
          Reject
        </button>

      </div>
    `;
  }

  // focus
  focus(d: any) {

    const marker = this.markers[d.id];

    if (!marker) return;

    this.map.setView(marker.getLatLng(), 17);

    marker.openPopup();
  }

  //  APPROVE
  approveRequest(id: number, type: string) {

    console.log("TYPE:", type);

    if (
      type === 'new' ||
      type === 'update_location'
    ) {

      this.quickApprove(id);
    }
  }


  quickApprove(id: number) {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const fd = new FormData();

    fd.append(
      'request_id',
      id.toString()
    );

    fd.append(
      'verified_by',
      user.id.toString()
    );

    console.log("APPROVING:", id);

    this.http.post<any>(
      'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/approve_request.php',
      fd
    ).subscribe({

      next: (res) => {

        alert(
          `Temple Location approved successfully`
        );
        console.log("APPROVE RESPONSE:", res);

        this.loadData();
      },

      error: (err) => {
        console.log("APPROVE ERROR:", err);
      }
    });
  }

  // windows function
  ngOnInit() {

    (window as any).approveRequest =
      (id: number, type: string) =>
        this.approveRequest(id, type);

    (window as any).reject =
      (id: number) =>
        this.reject(id);
  }

  //  REJECT
  reject(id: number) {
    const temple = this.data.find(x => x.id === id);
    const fd = new FormData();
    fd.append('id', id.toString());
    fd.append('status', 'rejected');

    this.http.post(
      'https://gisnic.tn.nic.in/geoitlmsadmnbeta/gttmap26/update_request_status.php',
      fd
    ).subscribe(() => {

      alert(
        `Temple Location rejected successfully`
      );

      this.loadData();
    });
  }

  logout() {
    this.router.navigate(['/dashboard']).then(() => location.reload());
  }

  viewStatus() {
    console.log('View Status clicked');
    this.router.navigate(['/temple-status']);
  }

  createUser() {
    this.router.navigate(['/sub-users']);
  }
}