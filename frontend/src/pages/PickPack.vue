<template>
  <main class="min-h-[560px] bg-canvas p-5 text-ink md:p-8">
    <div class="mx-auto max-w-[1440px] space-y-6">
      <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><p class="mb-2 text-xs font-medium text-muted">Warehouse <span class="px-1">/</span> Pick &amp; Pack</p><h1 class="text-2xl font-semibold tracking-tight md:text-[28px]">Pick &amp; Pack</h1><p class="mt-1 text-sm text-muted">Manage picking waves, packing progress, and dispatch readiness.</p></div>
        <div class="flex flex-wrap gap-2"><button @click="notice='Sample dashboard refreshed.'" class="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">↻ Refresh</button><button @click="exportCsv" class="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">Export CSV</button><button @click="notice='New picking wave will be connected to Frappe in the next phase.'" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">＋ New picking wave</button></div>
      </header>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><article v-for="stat in stats" :key="stat.label" class="rounded-xl border border-line bg-white p-4 shadow-panel"><p class="text-sm text-muted">{{stat.label}}</p><p class="mt-3 text-2xl font-semibold">{{stat.value}}</p><p class="mt-1 text-xs text-muted">{{stat.detail}}</p></article></section>
      <section class="overflow-hidden rounded-xl border border-line bg-white shadow-panel">
        <div class="flex flex-col justify-between gap-3 border-b border-line p-4 md:flex-row md:items-center"><div><h2 class="font-semibold">Picking waves</h2><p class="mt-1 text-xs text-muted">Prototype records for the interface experiment.</p></div><div class="flex flex-col gap-2 sm:flex-row"><input v-model="search" type="search" placeholder="Search wave, order or customer..." class="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand sm:w-72" /><select v-model="status" class="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"><option>All</option><option>Ready</option><option>In Progress</option><option>Packed</option><option>On Hold</option></select></div></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th class="px-5 py-3 font-medium">Wave / Order</th><th class="px-5 py-3 font-medium">Customer</th><th class="px-5 py-3 font-medium">Items</th><th class="px-5 py-3 font-medium">Assigned to</th><th class="px-5 py-3 font-medium">Status</th><th class="px-5 py-3 font-medium">Due</th></tr></thead><tbody class="divide-y divide-line"><tr v-for="row in filteredRows" :key="row.id" class="hover:bg-slate-50/70"><td class="px-5 py-4"><p class="font-semibold">{{row.wave}}</p><p class="mt-1 text-xs text-muted">{{row.order}}</p></td><td class="px-5 py-4">{{row.customer}}</td><td class="px-5 py-4">{{row.items}}</td><td class="px-5 py-4">{{row.assignee}}</td><td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(row.status)">{{row.status}}</span></td><td class="px-5 py-4 text-muted">{{row.due}}</td></tr><tr v-if="!filteredRows.length"><td colspan="6" class="px-5 py-12 text-center text-muted">No picking waves match your filters.</td></tr></tbody></table></div>
        <div class="flex justify-between border-t border-line px-5 py-3 text-xs text-muted"><span>Showing {{filteredRows.length}} of {{rows.length}} records</span><span>Demo data · Not connected to ERPNext</span></div>
      </section><p v-if="notice" role="status" class="text-sm text-muted">{{notice}}</p>
    </div>
  </main>
</template>
<script setup>
import { computed, ref } from "vue";
const search=ref(""); const status=ref("All"); const notice=ref("");
const rows=ref([
{id:1,wave:"PW-2026-0042",order:"SO-2026-0184",customer:"Northstar Retail",items:18,assignee:"Aarav Sharma",status:"In Progress",due:"Today, 3:30 PM"},
{id:2,wave:"PW-2026-0041",order:"SO-2026-0181",customer:"Urban Supply Co.",items:32,assignee:"Priya Patel",status:"Ready",due:"Today, 4:00 PM"},
{id:3,wave:"PW-2026-0040",order:"SO-2026-0178",customer:"Meridian Stores",items:12,assignee:"Kabir Singh",status:"Packed",due:"Today, 2:45 PM"},
{id:4,wave:"PW-2026-0039",order:"SO-2026-0172",customer:"Apex Components",items:24,assignee:"Unassigned",status:"On Hold",due:"Tomorrow, 10:00 AM"},
{id:5,wave:"PW-2026-0038",order:"SO-2026-0169",customer:"Northstar Retail",items:9,assignee:"Aarav Sharma",status:"In Progress",due:"Tomorrow, 11:30 AM"}
]);
const filteredRows=computed(()=>rows.value.filter(r=>{const q=search.value.trim().toLowerCase();return(!q||[r.wave,r.order,r.customer,r.assignee].some(v=>v.toLowerCase().includes(q)))&&(status.value==="All"||r.status===status.value)}));
const stats=computed(()=>[
{label:"Open picking waves",value:rows.value.filter(r=>["Ready","In Progress"].includes(r.status)).length,detail:"Ready to pick or currently picking"},
{label:"Items to pick",value:rows.value.filter(r=>["Ready","In Progress"].includes(r.status)).reduce((s,r)=>s+r.items,0),detail:"Units across active waves"},
{label:"Packed waves",value:rows.value.filter(r=>r.status==="Packed").length,detail:"Completed picking and packing"},
{label:"On hold",value:rows.value.filter(r=>r.status==="On Hold").length,detail:"Require warehouse attention"}
]);
function statusClass(s){return{"Ready":"bg-blue-50 text-blue-700","In Progress":"bg-amber-50 text-amber-700","Packed":"bg-emerald-50 text-emerald-700","On Hold":"bg-rose-50 text-rose-700"}[s]||"bg-slate-100 text-slate-700"}
function exportCsv(){const h=["Wave","Order","Customer","Items","Assigned to","Status","Due"];const d=filteredRows.value.map(r=>[r.wave,r.order,r.customer,r.items,r.assignee,r.status,r.due]);const csv=[h,...d].map(line=>line.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="pick-pack-waves.csv";a.click();URL.revokeObjectURL(url)}
</script>