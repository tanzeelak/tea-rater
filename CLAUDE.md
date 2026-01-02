# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tea-rater is a tea rating application where users can rate teas on various flavor dimensions (umami, astringency, floral, vegetal, nutty, roasted, body) and provide an overall rating.

## Commands

### Backend (Go)
```bash
cd backend
go run main.go
```
Requires `DATABASE_URL` environment variable (Supabase PostgreSQL connection string) in `backend/.env`.

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev      # Development server
npm run build    # Production build (runs tsc -b && vite build)
npm run lint     # ESLint
```

## Architecture

### Backend (`backend/`)
- **Single-file Go server** (`main.go`) using Gorilla Mux for routing and GORM for PostgreSQL ORM
- Connects to Supabase PostgreSQL via `DATABASE_URL` env var
- Auto-migrates database schema on startup
- REST API on port 8080 with CORS enabled for all origins

**API Endpoints:**
- `POST /login`, `POST /logout`, `POST /register-user` - Auth
- `GET /teas?user_id=`, `POST /register-tea` - Tea management
- `POST /submit`, `GET /ratings`, `PUT /ratings/{id}`, `DELETE /ratings/{id}` - Ratings CRUD
- `GET /user-ratings/{userId}` - User-specific ratings
- `GET /summary` - Aggregated tea ratings
- `GET /dashboard` - Admin dashboard (requires admin user)

### Frontend (`frontend/src/`)
- **React 19 + TypeScript + Vite**
- `services/api.ts` - Axios client for all backend calls (hardcoded to `localhost:8080`)
- `types.ts` - TypeScript interfaces for `Rating` and `Tea`
- `pages/` - Route-level components (Home, Dashboard)
- `components/` - UI components (Login, TeaRatingForm, RatingsTable, Summary, etc.)
- Auth token stored in localStorage as `authToken` (format: `user-{id}`)

### Data Model
- **Tea**: id, tea_name, provider, source
- **User**: id, name
- **TeaRating**: id, user_id, tea_id, flavor dimensions (umami, astringency, floral, vegetal, nutty, roasted, body), rating
