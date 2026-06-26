import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],

  template: `
    <div class="dashboard">

      <div class="page-header">
        <h1>Dashboard</h1>
        <p>At-a-glance view of today's operations</p>
      </div>

      <div class="cards">

        <div class="card">
          <div class="card-top">
            <span>TODAY'S SALES</span>
            <div class="icon green">📈</div>
          </div>

          <div class="value">
            ₹{{ summary?.todaySales || 0 }}
          </div>
        </div>

        <div class="card">
          <div class="card-top">
            <span>TODAY'S PURCHASES</span>
            <div class="icon orange">🛒</div>
          </div>

          <div class="value">
            ₹{{ summary?.todayPurchases || 0 }}
          </div>
        </div>

        <div class="card">
          <div class="card-top">
            <span>INVENTORY VALUE</span>
            <div class="icon red">₹</div>
          </div>

          <div class="value">
            ₹{{ (summary?.stockValue || 0).toFixed(2) }}
          </div>
        </div>

        <div class="card">
          <div class="card-top">
            <span>LOW STOCK ITEMS</span>
            <div class="icon yellow">⚠️</div>
          </div>

          <div class="value">
            {{ summary?.lowStockCount || 0 }}
          </div>
        </div>

      </div>

      <div class="content-grid">
      

        <div class="section">
          <h2>Sales - Last 7 Days</h2>
          <canvas id="salesChart"></canvas>
        </div>

        <div class="section side-panel">

  <h2>Top Selling Items</h2>

  <div
    class="top-item"
    *ngFor="let item of summary?.topItems; let i=index">

    <span>{{ i + 1 }}</span>

    <div>
      <strong>{{ item.name }}</strong>

      <small>
        Qty: {{ item.qty }}
        • Revenue: ₹{{ item.revenue }}
      </small>
    </div>

  </div>

</div>
<div class="section low-stock">

  <h2>Low Stock Alerts</h2>

  <table>

    <thead>
      <tr>
        <th>Item</th>
        <th>Stock</th>
        <th>Reorder Level</th>
      </tr>
    </thead>

    <tbody>

      <tr *ngFor="let item of summary?.lowStock">

        <td>{{ item.name }}</td>

        <td class="danger">
          {{ item.currentStock }} {{ item.unit }}
        </td>

        <td>
          {{ item.reorderLevel }}
        </td>

      </tr>

    </tbody>

  </table>

</div>

   </div>   <!-- content-grid -->

    </div>     <!-- dashboard -->  
  `,

  styles: [`
    .dashboard{
      padding:32px;
      background:#f7f4ef;
      min-height:100vh;
    }

    .page-header{
      margin-bottom:24px;
    }

    .page-header h1{
      margin:0;
      font-size:42px;
      font-weight:700;
    }

    .page-header p{
      color:#777;
      margin-top:8px;
    }

    .cards{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:20px;
    }

    .card{
      background:white;
      border-radius:20px;
      padding:24px;
      border:1px solid #ececec;
      box-shadow:0 2px 8px rgba(0,0,0,.04);
    }

    .card-top{
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .card-top span{
      color:#777;
      font-size:12px;
      font-weight:600;
    }

    .value{
      margin-top:12px;
      font-size:36px;
      font-weight:700;
    }

    .icon{
      width:44px;
      height:44px;
      border-radius:12px;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .green{ background:#e8f6ea; }
    .orange{ background:#fff2e7; }
    .red{ background:#fdeaea; }
    .yellow{ background:#fff6d8; }

    .content-grid{
      margin-top:24px;
      display:grid;
      grid-template-columns:2fr 1fr;
      gap:20px;
    }

    .section{
      background:white;
      border-radius:20px;
      padding:24px;
      border:1px solid #ececec;
      box-shadow:0 2px 8px rgba(0,0,0,.04);
    }

    .section h2{
      margin-top:0;
      margin-bottom:20px;
    }

    canvas{
      width:100% !important;
      height:320px !important;
    }

    table{
      width:100%;
      border-collapse:collapse;
    }

    th{
      text-align:left;
      color:#666;
      font-size:14px;
      padding:12px;
      border-bottom:1px solid #eee;
    }

    td{
      padding:12px;
      border-bottom:1px solid #f2f2f2;
    }

    .top-item{
      display:flex;
      gap:12px;
      align-items:center;
      margin-bottom:18px;
    }

    .top-item span{
      width:32px;
      height:32px;
      border-radius:8px;
      background:#fff2e8;
      color:#ff6b00;
      font-weight:bold;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .top-item strong{
      display:block;
    }

    .top-item small{
      color:#888;
    }

    .low-stock{
      margin-top:24px;
    }

    .danger{
      color:#dc3545;
      font-weight:600;
    }

    @media(max-width:1200px){
      .cards{
        grid-template-columns:repeat(2,1fr);
      }

      .content-grid{
        grid-template-columns:1fr;
      }
    }

    @media(max-width:768px){
      .cards{
        grid-template-columns:1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  summary: any;
  chart: Chart | null = null;

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data: any) => {
        this.summary = data;

        setTimeout(() => {
          this.loadChart();
        }, 200);
      },

      error: (err: any) => {
        console.error(err);
      }
    });
  }

  ngAfterViewInit(): void {}

  loadChart(): void {

    if (!this.summary?.weeklyChart?.length) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    const labels = this.summary.weeklyChart.map(
      (x: any) => x.label
    );

    const values = this.summary.weeklyChart.map(
      (x: any) => x.total
    );

    this.chart = new Chart(canvas, {
      type: 'line',

      data: {
        labels,
        datasets: [
          {
            label: 'Sales',
            data: values,
            borderColor: '#e4572e',
            backgroundColor: 'rgba(228,87,46,0.15)',
            fill: true,
            tension: 0.4
          }
        ]
      },

      options: {
  responsive: true,
  maintainAspectRatio: false,

  scales: {
    y: {
      beginAtZero: true
    }
  },

  plugins: {
    legend: {
      display: false
    }
  }
}
    });
  }
}