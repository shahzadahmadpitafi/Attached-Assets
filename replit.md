# Qanzak Global Properties - Real Estate Website

## Overview
Professional real estate website for Qanzak Global Properties, a property sales, rentals, and maintenance company in Islamabad and Lahore, Pakistan.

## Architecture
- **Frontend**: React + Vite with shadcn/ui components, Tailwind CSS, wouter routing
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Deep blue primary, gold accents, Playfair Display headings + Inter body

## Pages
- `/` - Home (hero, stats, featured properties, services, testimonials, CTA)
- `/services` - All 6 services with details
- `/properties` - Property listings with filters (status, type, city, price, bedrooms)
- `/about` - Company story, values, team
- `/contact` - Contact form, info card, Google Map, WhatsApp

## API Routes
- `GET /api/properties` - List properties with optional query filters
- `GET /api/properties/:id` - Get single property
- `POST /api/inquiries` - Submit contact form

## Key Features
- WhatsApp floating button on all pages
- Responsive navbar with transparent-to-solid scroll effect on home page
- Property detail dialog with contact options
- Animated stat counters on home page
- Contact form with validation using shared schema

## Database Schema
- `properties` - id, title, description, price, type, status, location, city, area, bedrooms, bathrooms, image, featured, amenities
- `inquiries` - id, name, email, phone, service, message, createdAt

## Recent Changes
- 2026-02-16: Initial build with 10 seeded properties, 5 pages, full API
