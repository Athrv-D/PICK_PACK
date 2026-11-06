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
  const manifestUrl = assetBase + "/.vite/manifest.json";

  function mountFrontend() {
    if (typeof window.PickPack?.mount !== "function") {
      throw new Error("Pick & Pack bundle loaded, but window.PickPack.mount is unavailable.");
    }
    window.PickPack.mount(root);
  }

  async function loadFrontend() {
    const response = await fetch(manifestUrl, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Vite manifest request failed: " + response.status);
    }

    const manifest = await response.json();

    // An HTML entry may be named index.html. The Desk page must load the
    // JavaScript module entry, never index.html as a script.
    const entry =
      (manifest["src/main.js"]?.file?.endsWith(".js") && manifest["src/main.js"]) ||
      Object.values(manifest).find(
        (item) => item.isEntry && typeof item.file === "string" && item.file.endsWith(".js")
      );

    if (!entry?.file) {
      throw new Error(
        "No JavaScript entry found in Vite manifest. Available keys: " +
          Object.keys(manifest).join(", ")
      );
    }

    const cssFiles = new Set(entry.css || []);
    Object.values(manifest)
      .filter((item) => item.isEntry && Array.isArray(item.css))
      .forEach((item) => item.css.forEach((file) => cssFiles.add(file)));

    cssFiles.forEach((cssFile) => {
      const href = assetBase + "/" + cssFile;
      if (!document.querySelector('link[href="' + href + '"]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = href;
        document.head.appendChild(stylesheet);
      }
    });

    const scriptUrl = assetBase + "/" + entry.file;

    // A previously loaded module already exposes mount(). Reuse it for
    // subsequent Desk navigation instead of injecting the module again.
    if (typeof window.PickPack?.mount === "function") {
      mountFrontend();
      return;
    }

    let script = document.querySelector(
      'script[type="module"][src="' + scriptUrl + '"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      script.addEventListener("load", mountFrontend, { once: true });
      script.addEventListener(
        "error",
        () => frappe.msgprint(__("Could not load the Pick & Pack frontend bundle.")),
        { once: true }
      );
      document.body.appendChild(script);
      return;
    }

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
