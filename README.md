# Pick & Pack Experiment

An isolated Frappe v15 app experiment with a Vue 3 + Tailwind CSS frontend.

## Architecture
- Frappe Desk Page is the authenticated entry point.
- Vue 3 renders the Pick & Pack interface.
- Tailwind CSS 3 styles the frontend.
- Vite builds the frontend into the Frappe app's `public/dist` directory.
- Frontend npm dependencies are isolated in `frontend/`.

## Frontend
```bash
cd frontend
npm install
npm run build
```

Then, from the bench root:
```bash
bench --site mysite.localhost clear-cache
bench --site mysite.localhost migrate
```

Open the Desk Page at `/app/pick-pack-experiment`.

The dashboard currently uses sample data only; ERPNext API integration is a later step.
