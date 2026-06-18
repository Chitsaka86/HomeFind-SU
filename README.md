# HomeFind SU

HomeFind SU is a student housing web app for finding, filtering, and booking off-campus housing near Strathmore. The project has two parts:

- A Vite + React frontend in this folder
- An Express + PostgreSQL backend in `backend/`

## What This App Does

- Shows property listings with prices, ratings, amenities, and booking details
- Lets students search by location, with map-style suggestions and MapLibre GL maps
- Supports magic-link authentication for students and landlords
- Fetches property and student dashboard data from the backend API

## Frontend Stack

- React 19
- Vite
- React Router
- MapLibre GL and `react-map-gl`
- Heroicons

## What You Need Installed

Install these before running the frontend:

- Node.js 18 or newer
- npm
- A browser such as Chrome, Edge, or Firefox

## Install And Run Frontend

From the project root:

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5175`.

### Frontend Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Frontend Environment

If you want to use Google Maps features that are still present elsewhere in the app, copy `.env.example` to `.env` and set the relevant key.

Required frontend variables:

- `VITE_GOOGLE_MAPS_API_KEY`

## Frontend Code Overview

- `src/pages/student/Dashboard.jsx` handles the student dashboard, search bar, dropdown suggestions, and property cards
- `src/pages/student/PropertyDetails.jsx` renders the property modal and MapLibre map view
- `src/components/maps/PropertyMap.jsx` renders the MapLibre GL map using OpenStreetMap demo tiles
- `src/services/propertyServices.js` fetches `/api/properties`
- `src/services/studentDashboardService.js` fetches `/api/student-dashboard`
- `src/App.jsx` defines the main routes

## GitHub Commands For The Frontend

Clone the repository:

```bash
git clone <https://github.com/Chitsaka86/HomeFind-SU.git >
cd homefind-su
```

Check your work:

```bash
git status
```

Pull the latest changes:

```bash
git pull origin main
```


Commit and push your changes:

```bash
git add .
git commit -m "Describe your change"
git push origin feature/your-change
```

## Troubleshooting

