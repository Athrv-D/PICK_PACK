# Pick & Pack Experiment

An isolated Frappe v15 app experiment with a Vue 3 + Tailwind CSS frontend.

## Architecture
- Frappe Desk Page is the authenticated entry point.
- Vue 3 renders the Pick & Pack interface.
- Tailwind CSS 3 styles the frontend.
- Vite builds the frontend into `pick_pack_experiment/public/dist`.
- The Vite manifest is used by the Desk Page to load the generated JavaScript and CSS files.
- Frontend npm dependencies are isolated in `frontend/`.

## Frontend build

From the app's `frontend` directory:

```bash
npm install
npm run build
```

The build writes the compiled assets and `.vite/manifest.json` into:

```
pick_pack_experiment/public/dist/
```

Then, from the bench root:

```bash
bench build --app pick_pack_experiment
bench --site mysite.localhost clear-cache
bench --site mysite.localhost migrate
```

Open the Pick & Pack Desk Page from the ERPNext Desk. The page JavaScript reads the Vite manifest, so hashed bundle filenames do not need to be updated manually.

The dashboard currently uses sample data only; ERPNext API integration is a later step.
