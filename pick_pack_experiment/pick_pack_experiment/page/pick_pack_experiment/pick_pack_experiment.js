frappe.pages["pick_pack_experiment"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({ parent: wrapper, title: __("Pick & Pack"), single_column: true });
  page.set_title_sub(__("Warehouse operations"));
  const root = document.createElement("div");
  root.id = "pick-pack-vue-root";
  $(page.main).empty().append(root);
  if (!document.querySelector('link[data-pick-pack-css="true"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/pick_pack_experiment/dist/style.css";
    stylesheet.dataset.pickPackCss = "true";
    document.head.appendChild(stylesheet);
  }
  frappe.require("/assets/pick_pack_experiment/dist/pick-pack.js").then(() => {
    if (window.PickPack?.mount) window.PickPack.mount(root);
    else frappe.msgprint(__("Pick & Pack frontend loaded, but its mount function was not found."));
  });
};
