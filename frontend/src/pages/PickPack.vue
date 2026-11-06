<template>
  <div class="pick-pack-page">
    <nav aria-label="Breadcrumb" class="pp-breadcrumbs">
      <Breadcrumbs :items="breadcrumbs">
        <template #prefix="{ item }">
          <span
            v-if="item.icon === 'workspace'"
            class="lucide-house pp-breadcrumb-icon"
            aria-hidden="true"
          />
          <span
            v-else-if="item.icon === 'warehouse'"
            class="lucide-box pp-breadcrumb-icon"
            aria-hidden="true"
          />
          <span
            v-else-if="item.icon === 'dashboard'"
            class="lucide-layout-dashboard pp-breadcrumb-icon"
            aria-hidden="true"
          />
        </template>
      </Breadcrumbs>
    </nav>

    <header class="pp-page-heading">
      <div>
        <p class="text-sm-medium uppercase tracking-wide text-ink-gray-5">
          Warehouse overview
        </p>
        <h1 class="mt-1 text-2xl-semibold text-ink-gray-9">
          Pick &amp; Pack Dashboard
        </h1>
        <p class="mt-1 text-p-sm text-ink-gray-5">
          Monitor picking activity, packing progress, and dispatch readiness.
        </p>
      </div>

      <div class="pp-heading-actions">
        <Button
          label="Refresh"
          theme="gray"
          variant="outline"
          :loading="refreshing"
          @click="refreshDashboard"
        />
        <Button
          label="New Picking Wave"
          theme="blue"
          variant="solid"
          @click="showNewWaveNotice"
        />
      </div>
    </header>

    <section class="pp-kpis" aria-label="Warehouse key performance indicators">
      <article class="pp-stat-card">
        <p class="text-sm-medium text-ink-gray-5">Open Picking Waves</p>
        <p class="pp-stat-value text-3xl-semibold text-ink-gray-9">{{ openWaves }}</p>
        <p class="pp-stat-foot text-sm text-ink-gray-4">Ready to pick or in progress</p>
      </article>
      <article class="pp-stat-card">
        <p class="text-sm-medium text-ink-gray-5">Items to Pick</p>
        <p class="pp-stat-value text-3xl-semibold text-ink-gray-9">{{ itemsToPick }}</p>
        <p class="pp-stat-foot text-sm text-ink-gray-4">Units across active waves</p>
      </article>
      <article class="pp-stat-card">
        <p class="text-sm-medium text-ink-gray-5">Packed Waves</p>
        <p class="pp-stat-value text-3xl-semibold text-ink-gray-9">{{ packedWaves }}</p>
        <p class="pp-stat-foot text-sm text-ink-gray-4">Completed successfully</p>
      </article>
      <article class="pp-stat-card">
        <p class="text-sm-medium text-ink-gray-5">On Hold</p>
        <p class="pp-stat-value text-3xl-semibold text-ink-gray-9">{{ onHold }}</p>
        <p class="pp-stat-foot text-sm text-ink-gray-4">Require warehouse attention</p>
      </article>
    </section>

    <section class="pp-chart-grid" aria-label="Warehouse charts">
      <div class="pp-panel pp-chart-card">
        <BarChart
          :data="activity"
          x="day"
          y="orders"
          title="Picking Activity"
          subtitle="Orders processed over the last 7 days"
          :y-axis="{ min: 0, title: 'Orders' }"
        />
      </div>
      <div class="pp-panel pp-chart-card">
        <DonutChart
          :data="statusDistribution"
          category="status"
          value="count"
          title="Wave Status"
          subtitle="Current picking wave distribution"
          center-label="Total waves"
        />
      </div>
    </section>

    <section class="pp-panel">
      <div class="pp-panel-heading">
        <div>
          <h2 class="text-base-semibold text-ink-gray-9">Filters</h2>
          <p class="mt-1 text-sm text-ink-gray-5">
            Narrow the dashboard by customer, product, warehouse, and status.
          </p>
        </div>
        <Button label="Clear all" variant="ghost" theme="gray" @click="clearFilters" />
      </div>

      <div class="pp-filters">
        <Select
          v-model="filters.customer"
          label="Customer"
          size="sm"
          :options="customerOptions"
        />
        <Select
          v-model="filters.product"
          label="Product"
          size="sm"
          :options="productOptions"
        />
        <Select
          v-model="filters.warehouse"
          label="Warehouse"
          size="sm"
          :options="warehouseOptions"
        />
        <Select
          v-model="filters.status"
          label="Status"
          size="sm"
          :options="statusOptions"
        />
        <Select
          v-model="filters.deliveryStatus"
          label="Delivery status"
          size="sm"
          :options="deliveryStatusOptions"
        />
        <Select
          v-model="filters.deliveryRun"
          label="Delivery run"
          size="sm"
          :options="deliveryRunOptions"
        />
        <Select
          v-model="filters.dateRange"
          label="Date range"
          size="sm"
          :options="dateRangeOptions"
        />
      </div>

      <p class="pp-filter-count text-sm text-ink-gray-5">
        {{ filteredRows.length }} matching waves
      </p>
    </section>

    <section class="pp-panel">
      <div class="pp-table-toolbar">
        <div>
          <h2 class="text-base-semibold text-ink-gray-9">Recent Picking Waves</h2>
          <p class="mt-1 text-sm text-ink-gray-5">
            Track active and recently completed warehouse orders.
          </p>
        </div>
        <div class="pp-table-actions">
          <TextInput
            v-model="search"
            size="sm"
            placeholder="Search waves..."
            aria-label="Search picking waves"
          />
          <Button
            label="Export CSV"
            variant="outline"
            theme="gray"
            @click="exportCsv"
          />
        </div>
      </div>

      <div class="pp-table-wrap">
        <table class="pp-table">
          <thead>
            <tr>
              <th>Wave / Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Assigned to</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Due date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.id">
              <td>
                <strong>{{ row.wave }}</strong>
                <small>{{ row.order }}</small>
              </td>
              <td>{{ row.customer }}</td>
              <td>{{ row.product }}</td>
              <td>{{ row.warehouse }}</td>
              <td>{{ row.items }}</td>
              <td>
                <span class="pp-assignee">
                  <span class="pp-assignee-avatar">{{ initials(row.assignee) }}</span>
                  {{ row.assignee }}
                </span>
              </td>
              <td>
                <span class="pp-status" :class="'pp-status--' + statusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.deliveryStatus }}</td>
              <td>{{ row.due }}</td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="9" class="py-8 text-center text-ink-gray-5">
                No picking waves match your filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pp-table-footer text-sm">
        <span>Showing {{ filteredRows.length }} of {{ rows.length }} records</span>
        <Button label="View all waves" variant="ghost" theme="gray" size="sm" @click="showAllWavesNotice" />
      </div>
    </section>

    <p v-if="notice" class="pp-notice text-sm" role="status">{{ notice }}</p>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { Breadcrumbs, Button, Select, TextInput } from "frappe-ui";
import { BarChart, DonutChart } from "frappe-ui/charts";

const breadcrumbs = [
  {
    label: "Workspace",
    href: "/app",
    icon: "workspace",
  },
  {
    label: "Pick & Pack",
    href: "/desk/pick-pack-experiment/pick_pack_experiment",
    icon: "warehouse",
  },
  {
    label: "Dashboard",
    icon: "dashboard",
  },
];

const search = ref("");
const notice = ref("");
const refreshing = ref(false);
const filters = reactive({
  customer: "",
  product: "",
  warehouse: "",
  status: "",
  deliveryStatus: "",
  deliveryRun: "",
  dateRange: "",
});

const rows = ref([
  { id: 1, wave: "PW-2026-0042", order: "SO-2026-0184", customer: "Northstar Retail", product: "AB1770", warehouse: "Main Warehouse", items: 18, assignee: "Aarav Sharma", status: "In Progress", deliveryStatus: "Pending", deliveryRun: "RUN-004", due: "Today, 3:30 PM", dateRange: "Today" },
  { id: 2, wave: "PW-2026-0041", order: "SO-2026-0181", customer: "Urban Supply Co.", product: "AB1420", warehouse: "Finished Goods", items: 32, assignee: "Priya Patel", status: "Ready", deliveryStatus: "Pending", deliveryRun: "RUN-004", due: "Today, 4:00 PM", dateRange: "Today" },
  { id: 3, wave: "PW-2026-0040", order: "SO-2026-0178", customer: "Meridian Stores", product: "AB1505", warehouse: "Main Warehouse", items: 12, assignee: "Kabir Singh", status: "Packed", deliveryStatus: "Partially Delivered", deliveryRun: "RUN-003", due: "Today, 2:45 PM", dateRange: "Today" },
  { id: 4, wave: "PW-2026-0039", order: "SO-2026-0172", customer: "Apex Components", product: "AB1770", warehouse: "Raw Materials", items: 24, assignee: "Unassigned", status: "On Hold", deliveryStatus: "Pending", deliveryRun: "RUN-005", due: "Tomorrow, 10:00 AM", dateRange: "This week" },
  { id: 5, wave: "PW-2026-0038", order: "SO-2026-0169", customer: "Northstar Retail", product: "AB1420", warehouse: "Finished Goods", items: 9, assignee: "Aarav Sharma", status: "In Progress", deliveryStatus: "Delivered", deliveryRun: "RUN-002", due: "Tomorrow, 11:30 AM", dateRange: "This week" },
]);

const activity = [
  { day: "Mon", orders: 18 },
  { day: "Tue", orders: 27 },
  { day: "Wed", orders: 21 },
  { day: "Thu", orders: 34 },
  { day: "Fri", orders: 25 },
  { day: "Sat", orders: 38 },
  { day: "Sun", orders: 29 },
];

function buildOptions(values, allLabel) {
  return [
    { label: allLabel, value: "" },
    ...Array.from(new Set(values)).sort().map((value) => ({
      label: value,
      value,
    })),
  ];
}

const customerOptions = computed(() =>
  buildOptions(rows.value.map((row) => row.customer), "All customers")
);
const productOptions = computed(() =>
  buildOptions(rows.value.map((row) => row.product), "All products")
);
const warehouseOptions = computed(() =>
  buildOptions(rows.value.map((row) => row.warehouse), "All warehouses")
);
const deliveryRunOptions = computed(() =>
  buildOptions(rows.value.map((row) => row.deliveryRun), "All delivery runs")
);
const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Ready", value: "Ready" },
  { label: "In Progress", value: "In Progress" },
  { label: "Packed", value: "Packed" },
  { label: "On Hold", value: "On Hold" },
];
const deliveryStatusOptions = [
  { label: "All delivery statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Partially Delivered", value: "Partially Delivered" },
  { label: "Delivered", value: "Delivered" },
];
const dateRangeOptions = [
  { label: "All time", value: "" },
  { label: "Today", value: "Today" },
  { label: "This week", value: "This week" },
  { label: "This month", value: "This month" },
];

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    const query = search.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.wave, row.order, row.customer, row.assignee, row.product]
        .some((value) => value.toLowerCase().includes(query));

    return (
      matchesSearch &&
      (!filters.customer || row.customer === filters.customer) &&
      (!filters.product || row.product === filters.product) &&
      (!filters.warehouse || row.warehouse === filters.warehouse) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.deliveryStatus || row.deliveryStatus === filters.deliveryStatus) &&
      (!filters.deliveryRun || row.deliveryRun === filters.deliveryRun) &&
      (!filters.dateRange || row.dateRange === filters.dateRange)
    );
  })
);

function countStatus(status) {
  return rows.value.filter((row) => row.status === status).length;
}

const openWaves = computed(() =>
  rows.value.filter((row) => ["Ready", "In Progress"].includes(row.status)).length
);
const itemsToPick = computed(() =>
  rows.value
    .filter((row) => ["Ready", "In Progress"].includes(row.status))
    .reduce((total, row) => total + row.items, 0)
);
const packedWaves = computed(() => countStatus("Packed"));
const onHold = computed(() => countStatus("On Hold"));
const statusDistribution = computed(() => [
  { status: "Ready", count: countStatus("Ready") },
  { status: "In Progress", count: countStatus("In Progress") },
  { status: "Packed", count: countStatus("Packed") },
  { status: "On Hold", count: countStatus("On Hold") },
]);

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status) {
  return {
    Ready: "ready",
    "In Progress": "progress",
    Packed: "packed",
    "On Hold": "hold",
  }[status] || "ready";
}

function clearFilters() {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  search.value = "";
}

function refreshDashboard() {
  refreshing.value = true;
  notice.value = "Dashboard refreshed. Sample data is currently displayed.";
  window.setTimeout(() => {
    refreshing.value = false;
  }, 350);
}

function showNewWaveNotice() {
  notice.value = "New picking wave creation will be connected to the Frappe backend in the next phase.";
}

function showAllWavesNotice() {
  notice.value = "The full picking wave list will be connected to the Frappe backend in the next phase.";
}

function exportCsv() {
  const headers = [
    "Wave",
    "Order",
    "Customer",
    "Product",
    "Warehouse",
    "Items",
    "Assigned to",
    "Status",
    "Delivery Status",
    "Delivery Run",
    "Due",
  ];
  const data = filteredRows.value.map((row) => [
    row.wave,
    row.order,
    row.customer,
    row.product,
    row.warehouse,
    row.items,
    row.assignee,
    row.status,
    row.deliveryStatus,
    row.deliveryRun,
    row.due,
  ]);
  const csv = [headers, ...data]
    .map((line) =>
      line
        .map((value) => '"' + String(value).replaceAll('"', '""') + '"')
        .join(",")
    )
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pick-pack-waves.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>
