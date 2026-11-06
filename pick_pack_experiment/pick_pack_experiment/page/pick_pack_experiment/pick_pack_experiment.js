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

  function mountFrontend() {
    if (typeof window.PickPack?.mount !== "function") {
      throw new Error("Pick & Pack bundle loaded, but window.PickPack.mount is unavailable.");
    }

    window.PickPack.mount(root);
  }

  async function loadFrontend() {
    const response = await fetch(manifestUrl, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Vite manifest request failed: ${response.status}`);
    }

    const manifest = await response.json();

    // Vite's HTML entry is normally keyed as "index.html".
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

    // The module may already be loaded from a previous Desk visit.
    if (typeof window.PickPack?.mount === "function") {
      mountFrontend();
      return;
    }

    let script = document.querySelector(
      `script[type="module"][src="${scriptUrl}"]`
    );

    if (!script) {
      script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      script.onload = mountFrontend;
      script.onerror = () => {
        frappe.msgprint(__("Could not load the Pick & Pack frontend bundle."));
      };
      document.body.appendChild(script);
      return;
    }

    // If the script element exists but is still loading, wait for its module code.
    script.addEventListener("load", mountFrontend, { once: true });
    script.addEventListener(
      "error",
      () => frappe.msgprint(__("Could not load the Pick & Pack frontend bundle.")),
      { once: true }
    );
  }

  loadFrontend().catch((error) => {
    console.error("Pick & Pack frontend loading failed:", error);
    frappe.msgprint(
      __("Could not load the Pick & Pack frontend. Check the Vite build and asset manifest.")
    );
  });
};
