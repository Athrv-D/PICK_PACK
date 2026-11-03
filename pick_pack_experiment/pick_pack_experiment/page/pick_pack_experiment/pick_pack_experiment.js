frappe.pages["pick_pack_experiment"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Pick & Pack"),
    single_column: true,
  });

  page.set_title_sub(__("Warehouse operations"));

  const root = document.createElement("div");
  root.id = "pick-pack-vue-root";
  $(page.main).empty().append(root);

  const assetBase = "/assets/pick_pack_experiment/dist";
  const manifestUrl = `${assetBase}/.vite/manifest.json`;

  fetch(manifestUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Vite manifest request failed: ${response.status}`);
      }
      return response.json();
    })
    .then((manifest) => {
      const entry = manifest["src/main.js"];

      if (!entry?.file) {
        throw new Error("Vite manifest does not contain the src/main.js entry.");
      }

      (entry.css || []).forEach((cssFile) => {
        const href = `${assetBase}/${cssFile}`;
        if (!document.querySelector(`link[href="${href}"]`)) {
          const stylesheet = document.createElement("link");
          stylesheet.rel = "stylesheet";
          stylesheet.href = href;
          document.head.appendChild(stylesheet);
        }
      });

      const scriptUrl = `${assetBase}/${entry.file}`;
      if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = scriptUrl;
        script.onerror = () => {
          frappe.msgprint(__("Could not load the Pick & Pack frontend bundle."));
        };
        document.body.appendChild(script);
      }
    })
    .catch((error) => {
      console.error("Pick & Pack frontend loading failed:", error);
      frappe.msgprint(
        __("Could not load the Pick & Pack frontend. Check the Vite build and asset manifest.")
      );
    });
};
