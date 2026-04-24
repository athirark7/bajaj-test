# SRM Full Stack Engineering Challenge - Submission

This repository contains the solution for the SRM Full Stack Engineering Challenge.

## Project Structure
- `backend/`: Node.js/Express API that processes hierarchical node relationships.
- `frontend/`: React/Vite application for a premium user interface.

## Tech Stack
- **Backend**: Node.js, Express, CORS, Body-Parser.
- **Frontend**: React, Vite, Axios, Lucide-React, Vanilla CSS.

## Features
- **Graph Processing**: Efficiently handles node relationships (`X->Y`), detects cycles, and builds nested hierarchies.
- **Rules Implemented**:
  - Validates `X->Y` format (single uppercase letters).
  - Handles multi-parents (first parent wins).
  - Detects cycles and returns lexicographically smallest node as root.
  - Calculates tree depth (max nodes on root-to-leaf path).
  - Identifies invalid entries and duplicate edges.
- **Premium UI**: Modern design with glassmorphism, responsive layout, and visual tree representation.

## How to Run Locally

### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs on `http://localhost:3000`)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on `http://localhost:5173`)

## Deployment

### Backend (Render/Railway)
1. Push the `backend` folder to a GitHub repository.
2. Connect the repository to Render/Railway.
3. Set the build command to `npm install` and start command to `node index.js`.
4. Ensure the `PORT` environment variable is set or defaults to 3000.

### Frontend (Vercel/Netlify)
1. Push the `frontend` folder to a GitHub repository.
2. Connect to Vercel/Netlify.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Update the `API_URL` in `frontend/src/App.jsx` to your hosted backend URL.

## License
This project is for demonstration purposes for the SRM Full Stack Challenge.
