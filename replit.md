# Qanzak Global Properties - Real Estate Website

## Overview
Professional real estate website for Qanzak Global Properties, a property sales, rentals, and maintenance company in Islamabad and Lahore, Pakistan.

## Architecture
- **Frontend**: React + Vite with shadcn/ui components, Tailwind CSS, wouter routing
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Replit Object Storage for media uploads (presigned URL flow)
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
- `GET /api/properties/:id/media` - Get all media for a property (public)
- `GET /api/team` - List active team members (public)
- `POST /api/inquiries` - Submit contact form
- `POST /api/uploads/request-url` - Get presigned upload URL (admin auth required)
- `GET /objects/*` - Serve uploaded files from object storage
- `GET/POST/PATCH/DELETE /api/admin/team` - Team member CRUD (admin auth required)

## Key Features
- WhatsApp floating button on all pages
- Responsive navbar with transparent-to-solid scroll effect on home page
- Property detail dialog with multi-media gallery
- Animated stat counters on home page
- Contact form with validation using shared schema

## Database Schema
- `properties` - id, title, description, price, type, status, location, city, area, bedrooms, bathrooms, image, featured, amenities
- `property_media` - id, propertyId, type (image/video/floorplan), url, thumbnailUrl, caption, tags, roomType, isFeatured, sortOrder, platform, videoId, fileSize, createdAt
- `inquiries` - id, name, email, phone, service, message, status, notes, propertyId, createdAt
- `admin_users` - id, email, passwordHash, name, role, createdAt, lastLogin
- `team_members` - id, name, role, department, specialization, bio, shortBio, email, phone, whatsapp, photo, sortOrder, isActive, createdAt

## Multi-Media Gallery System
- **Upload flow**: Admin uploads via drag-and-drop -> presigned URL from object storage -> PUT file directly -> POST metadata to API
- **Media types**: image (JPG/PNG/WebP), video (YouTube/Vimeo embeds), floorplan (images/PDF)
- **Admin management**: Reorder images, set featured, add captions, assign room types, delete
- **Frontend gallery**: Tabbed view (Photos/Videos/Floor Plans), lightbox with zoom/keyboard nav/thumbnails
- **Backward compatibility**: `properties.image` field auto-synced from featured/first media image; legacy images backfilled on startup
- **Security**: Upload endpoint protected with admin session authentication

## Admin Dashboard
- URL: `/admin` (login at `/admin/login`)
- Default credentials: admin@qanzakglobal.com / Admin@123
- Session-based auth with connect-pg-simple session store
- Dashboard with 6 metric cards (total/sale/rent properties, inquiries, featured, cities)
- Property CRUD: list with search, add/edit form with validation, delete with confirmation
- Media management: upload zone, gallery manager, video embed form, floor plan upload
- Inquiry management: list with status filters, status updates (new/contacted/resolved), notes, delete
- Team management: add/edit/delete members, photo upload, reorder, active/inactive toggle
- Sidebar navigation: Dashboard, Properties, Add Property, Inquiries, Team Members
- Protected routes redirect to /admin/login when not authenticated
- Admin API endpoints all under /api/admin/* with session middleware

## Recent Changes
- 2026-02-20: Added dynamic team member management: database table, admin CRUD page with photo upload, about page now uses API data
- 2026-02-16: Added multi-media gallery system with object storage uploads, admin media management, public gallery with lightbox, video embeds, floor plans
- 2026-02-16: Added admin dashboard with login, property CRUD, inquiry management, and dashboard metrics
- 2026-02-16: Initial build with 10 seeded properties, 5 pages, full API
