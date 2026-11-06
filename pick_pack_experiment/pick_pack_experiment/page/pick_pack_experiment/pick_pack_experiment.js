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

  function assetUrl(file) {
    if (/^https?:\/\//i.test(file) || file.startsWith("/assets/")) {
      return file;
    }
    return assetBase + "/" + file.replace(/^\/+/, "");
  }

  function loadStylesheet(file) {
    const href = assetUrl(file);
    let link = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
      (node) => node.href === new URL(href, window.location.origin).href
    );

    if (link?.sheet) return Promise.resolve();

    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.pickPackAsset = file;
      document.head.appendChild(link);
    }

    return new Promise((resolve, reject) => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener(
        "error",
        () => reject(new Error("Stylesheet failed to load: " + href)),
        { once: true }
      );
      // A stylesheet already cached by the browser may have completed between
      // the sheet check above and listener registration.
      if (link.sheet) resolve();
    });
  }

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
    const entries = Object.entries(manifest);

    const entry =
      manifest["src/main.js"]?.file?.endsWith(".js")
        ? manifest["src/main.js"]
        : entries.find(
            ([key, item]) =>
              item.isEntry &&
              typeof item.file === "string" &&
              item.file.endsWith(".js")
          )?.[1];

    if (!entry?.file) {
      throw new Error(
        "No JavaScript entry found in Vite manifest. Available keys: " +
          Object.keys(manifest).join(", ")
      );
    }

    // Collect CSS from every manifest record, not only the selected JS entry.
    // This covers CSS extracted from imported library components and chunks.
    const cssFiles = new Set();
    entries.forEach(([, item]) => {
      if (Array.isArray(item.css)) item.css.forEach((file) => cssFiles.add(file));
      if (typeof item.file === "string" && item.file.endsWith(".css")) {
        cssFiles.add(item.file);
      }
    });

    if (!cssFiles.size) {
      throw new Error(
        "No CSS files were listed in the Vite manifest. Re-run npm run build and inspect dist/.vite/manifest.json."
      );
    }

    await Promise.all(Array.from(cssFiles, loadStylesheet));

    const scriptUrl = assetUrl(entry.file);

    if (typeof window.PickPack?.mount === "function") {
      mountFrontend();
      return;
    }

    const absoluteScriptUrl = new URL(scriptUrl, window.location.origin).href;
    let script = Array.from(document.querySelectorAll('script[type="module"]')).find(
      (node) => node.src === absoluteScriptUrl
    );

    if (window.__pickPackBundlePromise) {
      await window.__pickPackBundlePromise;
      mountFrontend();
      return;
    }

    if (script) {
      throw new Error(
        "Pick & Pack bundle tag already exists but the mount function is not ready. Reload the Desk page."
      );
    }

    window.__pickPackBundlePromise = new Promise((resolve, reject) => {
      script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("JavaScript bundle failed to load: " + scriptUrl)),
        { once: true }
      );
      document.body.appendChild(script);
    });

    await window.__pickPackBundlePromise;
    mountFrontend();
  }

  loadFrontend().catch((error) => {
    console.error("Pick & Pack frontend loading failed:", error);
    frappe.msgprint(
      __("Could not load the Pick & Pack frontend assets. Check the browser console for details.")
    );
  });
};
