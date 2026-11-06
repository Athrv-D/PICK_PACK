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

  async function loadFrontend() {
    const response = await fetch(manifestUrl, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Vite manifest request failed: ${response.status}`);
    }

    const manifest = await response.json();

    // Vite uses "index.html" as the entry key when the build input is index.html.
    // Keep the other lookups as fallbacks for alternate Vite configurations.
    const entry =
      manifest["index.html"] ||
      manifest["src/main.js"] ||
      Object.values(manifest).find(
        (item) => item.isEntry && typeof item.file === "string" && item.file.endsWith(".js")
      );

    if (!entry?.file) {
      throw new Error(
        `No JavaScript entry found in Vite manifest. Available keys: ${Object.keys(manifest).join(", ")}`
      );
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
    const existingScript = document.querySelector(
      `script[type="module"][src="${scriptUrl}"]`
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      script.onerror = () => {
        frappe.msgprint(__("Could not load the Pick & Pack frontend bundle."));
      };
      document.body.appendChild(script);
    }
  }

  loadFrontend().catch((error) => {
    console.error("Pick & Pack frontend loading failed:", error);
    frappe.msgprint(
      __("Could not load the Pick & Pack frontend. Check the Vite build and asset manifest.")
    );
  });
};
