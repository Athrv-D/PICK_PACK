<template>
  <div class="pp-shell">
    <aside class="pp-sidebar">
      <div class="pp-brand">
        <div class="pp-brand-mark">P</div>
        <div><strong>Warehouse</strong><small>Operations</small></div>
      </div>
      <div class="pp-workspace-label">WORKSPACE</div>
      <nav class="pp-nav">
        <button class="pp-nav-item active"><span class="pp-nav-icon">▦</span> Dashboard</button>
        <button class="pp-nav-item" @click="activeView='Picking Waves'"><span class="pp-nav-icon">▤</span> Picking Waves</button>
        <button class="pp-nav-item" @click="activeView='Packing'"><span class="pp-nav-icon">▣</span> Packing</button>
        <button class="pp-nav-item" @click="activeView='Dispatch'"><span class="pp-nav-icon">⇧</span> Dispatch</button>
        <button class="pp-nav-item" @click="activeView='Items'"><span class="pp-nav-icon">▧</span> Items</button>
      </nav>
      <div class="pp-workspace-label pp-tools-label">INSIGHTS</div>
      <nav class="pp-nav">
        <button class="pp-nav-item" @click="activeView='Reports'"><span class="pp-nav-icon">▥</span> Reports</button>
      </nav>
      <div class="pp-sidebar-bottom">
        <div class="pp-help"> <span>?</span><div><strong>Need help?</strong><small>View warehouse guide</small></div></div>
        <div class="pp-user"><div class="pp-avatar">AG</div><div><strong>Atharv Gupta</strong><small>Warehouse Manager</small></div><span class="pp-dots">···</span></div>
      </div>
    </aside>

    <main class="pp-main">
      <header class="pp-topbar">
        <div class="pp-breadcrumb">Workspace <span>/</span> <strong>Dashboard</strong></div>
        <div class="pp-top-actions"><button class="pp-icon-button" title="Notifications">♧</button><button class="pp-icon-button" title="Settings">⚙</button><div class="pp-top-avatar">AG</div></div>
      </header>

      <div class="pp-content">
        <section class="pp-page-heading">
          <div><div class="pp-eyebrow">WAREHOUSE OVERVIEW</div><h1>Pick &amp; Pack Dashboard</h1><p>Monitor picking activity, packing progress, and dispatch readiness.</p></div>
          <div class="pp-heading-actions"><button class="pp-button pp-button-light" @click="refreshDashboard">↻ <span>Refresh</span></button><button class="pp-button pp-button-yellow" @click="notice='New picking wave creation will be connected to ERPNext in the next phase.'">＋ New Picking Wave</button></div>
        </section>

        <section class="pp-kpis">
          <article class="pp-kpi-card"><div class="pp-kpi-top"><span>Open Picking Waves</span><span class="pp-kpi-icon yellow">▤</span></div><div class="pp-kpi-value">{{ openWaves }}</div><div class="pp-kpi-foot"><span class="pp-dot green"></span> Ready to pick or in progress</div></article>
          <article class="pp-kpi-card"><div class="pp-kpi-top"><span>Items to Pick</span><span class="pp-kpi-icon blue">▦</span></div><div class="pp-kpi-value">{{ itemsToPick }}</div><div class="pp-kpi-foot">Units across active waves</div></article>
          <article class="pp-kpi-card"><div class="pp-kpi-top"><span>Packed Waves</span><span class="pp-kpi-icon green">✓</span></div><div class="pp-kpi-value">{{ packedWaves }}</div><div class="pp-kpi-foot"><span class="pp-dot green"></span> Completed successfully</div></article>
          <article class="pp-kpi-card"><div class="pp-kpi-top"><span>On Hold</span><span class="pp-kpi-icon red">Ⅱ</span></div><div class="pp-kpi-value">{{ onHold }}</div><div class="pp-kpi-foot">Require warehouse attention</div></article>
        </section>

        <section class="pp-analytics-grid">
          <article class="pp-panel pp-chart-panel">
            <div class="pp-panel-heading"><div><h2>Picking Activity</h2><p>Orders processed over the last 7 days</p></div><button class="pp-select">Last 7 days⌄</button></div>
            <div class="pp-chart">
              <div class="pp-y-labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
              <div class="pp-bars">
                <div v-for="(bar,index) in activity" :key="bar.day" class="pp-bar-group"><div class="pp-bar-track"><div class="pp-bar" :style="{height:bar.value+'%'}"></div></div><span>{{bar.day}}</span></div>
              </div>
            </div>
            <div class="pp-chart-legend"><span><i class="legend-yellow"></i> Orders picked</span><span><i class="legend-gray"></i> Daily target</span></div>
          </article>
          <article class="pp-panel pp-status-panel">
            <div class="pp-panel-heading"><div><h2>Wave Status</h2><p>Current picking wave distribution</p></div><button class="pp-more">···</button></div>
            <div class="pp-donut-wrap"><div class="pp-donut"><div class="pp-donut-center"><strong>{{ rows.length }}</strong><small>Total Waves</small></div></div></div>
            <div class="pp-status-legend"><div><span><i class="status-ready"></i> Ready</span><strong>{{ countStatus('Ready') }}</strong></div><div><span><i class="status-progress"></i> In Progress</span><strong>{{ countStatus('In Progress') }}</strong></div><div><span><i class="status-packed"></i> Packed</span><strong>{{ countStatus('Packed') }}</strong></div><div><span><i class="status-hold"></i> On Hold</span><strong>{{ countStatus('On Hold') }}</strong></div></div>
          </article>
        </section>

        <section class="pp-panel pp-table-panel">
          <div class="pp-panel-heading pp-table-heading"><div><h2>Recent Picking Waves</h2><p>Track active and recently completed warehouse orders.</p></div><div class="pp-table-actions"><input v-model="search" type="search" placeholder="⌕  Search waves..." /><select v-model="status"><option>All</option><option>Ready</option><option>In Progress</option><option>Packed</option><option>On Hold</option></select><button class="pp-button pp-button-light" @click="exportCsv">Export</button></div></div>
          <div class="pp-table-scroll"><table class="pp-table"><thead><tr><th>WAVE / ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>ASSIGNED TO</th><th>STATUS</th><th>DUE DATE</th><th></th></tr></thead><tbody><tr v-for="row in filteredRows" :key="row.id"><td><strong>{{row.wave}}</strong><small>{{row.order}}</small></td><td>{{row.customer}}</td><td>{{row.items}}</td><td><span class="pp-assignee"><i>{{ initials(row.assignee) }}</i>{{row.assignee}}</span></td><td><span class="pp-status-pill" :class="statusClass(row.status)">{{row.status}}</span></td><td>{{row.due}}</td><td><button class="pp-row-more">···</button></td></tr><tr v-if="!filteredRows.length"><td colspan="7" class="pp-empty">No picking waves match your filters.</td></tr></tbody></table></div>
          <div class="pp-table-footer"><span>Showing {{filteredRows.length}} of {{rows.length}} records</span><button @click="notice='All picking waves view will be available when ERPNext data is connected.'">View all waves →</button></div>
        </section>
        <p v-if="notice" class="pp-notice" role="status">{{notice}}</p>
        <footer class="pp-footer">Pick &amp; Pack <span>·</span> Warehouse Operations</footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const search = ref("");
const status = ref("All");
const notice = ref("");
const rows = ref([
  {id:1,wave:"PW-2026-0042",order:"SO-2026-0184",customer:"Northstar Retail",items:18,assignee:"Aarav Sharma",status:"In Progress",due:"Today, 3:30 PM"},
  {id:2,wave:"PW-2026-0041",order:"SO-2026-0181",customer:"Urban Supply Co.",items:32,assignee:"Priya Patel",status:"Ready",due:"Today, 4:00 PM"},
  {id:3,wave:"PW-2026-0040",order:"SO-2026-0178",customer:"Meridian Stores",items:12,assignee:"Kabir Singh",status:"Packed",due:"Today, 2:45 PM"},
  {id:4,wave:"PW-2026-0039",order:"SO-2026-0172",customer:"Apex Components",items:24,assignee:"Unassigned",status:"On Hold",due:"Tomorrow, 10:00 AM"},
  {id:5,wave:"PW-2026-0038",order:"SO-2026-0169",customer:"Northstar Retail",items:9,assignee:"Aarav Sharma",status:"In Progress",due:"Tomorrow, 11:30 AM"}
]);
const activity = [{day:"Mon",value:45},{day:"Tue",value:68},{day:"Wed",value:52},{day:"Thu",value:86},{day:"Fri",value:62},{day:"Sat",value:96},{day:"Sun",value:74}];
const filteredRows = computed(() => rows.value.filter(row => {
  const query = search.value.trim().toLowerCase();
  return (!query || [row.wave,row.order,row.customer,row.assignee].some(value => value.toLowerCase().includes(query))) && (status.value === "All" || row.status === status.value);
}));
const openWaves = computed(() => rows.value.filter(row => ["Ready","In Progress"].includes(row.status)).length);
const itemsToPick = computed(() => rows.value.filter(row => ["Ready","In Progress"].includes(row.status)).reduce((sum,row) => sum + row.items,0));
const packedWaves = computed(() => countStatus("Packed"));
const onHold = computed(() => countStatus("On Hold"));
function countStatus(value) { return rows.value.filter(row => row.status === value).length; }
function initials(name) { return name.split(" ").map(part => part[0]).join("").slice(0,2).toUpperCase(); }
function statusClass(value) { return {"Ready":"ready","In Progress":"progress","Packed":"packed","On Hold":"hold"}[value] || ""; }
function refreshDashboard() { notice.value = "Dashboard refreshed."; }
function exportCsv() {
  const headers = ["Wave","Order","Customer","Items","Assigned to","Status","Due"];
  const data = filteredRows.value.map(row => [row.wave,row.order,row.customer,row.items,row.assignee,row.status,row.due]);
  const csv = [headers,...data].map(line => line.map(value => '"' + String(value).replaceAll('"','""') + '"').join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "pick-pack-waves.csv"; anchor.click(); URL.revokeObjectURL(url);
}
</script>
