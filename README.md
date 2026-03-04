# DildarNagar - Local Directory Platform

A comprehensive web platform for discovering and listing local services, businesses, events, job opportunities, and news in the DildarNagar community.

## 🎯 Features

- **Listings Management** - Browse and post local business listings with images
- **Services Directory** - Find local service providers (plumbers, electricians, etc.)
- **News & Updates** - Community news and announcements
- **Events Calendar** - Discover upcoming local events
- **Job Board** - Local job postings with full details
- **Unified Search** - Search across all content types with filtering
- **User Authentication** - Secure registration and login
- **Image Uploads** - Browse and upload listing images with preview

## 📁 Project Structure

```
DildarNagar/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # Database models (Listing, News, Event, Job, User)
│   │   ├── routers/     # API endpoints
│   │   ├── schemas/     # Pydantic schemas for validation
│   │   └── services/    # Business logic
│   ├── alembic/         # Database migrations
│   ├── main.py          # FastAPI application entry point
│   ├── requirements.txt  # Python dependencies
│   └── .env.example     # Environment variables template
│
└── frontend/             # Frontend (Vanilla JS + HTML/CSS)
    ├── assets/          # CSS, JS, images
    ├── admin/           # Admin dashboard pages
    ├── pages/           # Additional pages
    ├── index.html       # Homepage
    ├── dashboard.html   # User dashboard
    └── listing-detail.html  # Listing detail page
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

5. **Run database migrations (if needed):**
   ```bash
   alembic upgrade head
   ```

6. **Start the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   Backend will run on: `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start a local HTTP server:**
   ```bash
   python -m http.server 3000
   ```

   Frontend will run on: `http://localhost:3000`

## 📋 Environment Variables

Create a `.env` file in the backend folder using `.env.example` as template:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
APP_NAME=Dildarnagar.in
APP_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Content Management
- `GET/POST /api/listings` - List/create listings
- `GET/POST /api/services` - Services directory
- `GET/POST /api/news` - News articles
- `GET/POST /api/events` - Events
- `GET/POST /api/jobs` - Job postings

### Search & Filtering
- Query parameters: `?search=term&category=value`
- Supports full-text search and category filtering

### User
- `GET /api/user/me` - Get current user profile

### File Upload
- `POST /api/upload/image` - Upload images (returns URL)

## 💾 Database

- **Type:** PostgreSQL
- **ORM:** SQLAlchemy 2.0 (async)
- **Migrations:** Alembic

### Models
- `User` - User accounts with JWT auth
- `Listing` - Business listings with images
- `Service` - Local services with categories
- `News` - Community news articles
- `Event` - Upcoming events with dates
- `Job` - Job postings with salary info

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS enabled for frontend
- Environment variables for secrets
- Static file serving for uploads

## 📦 Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL with asyncpg
- **ORM:** SQLAlchemy 2.0
- **Async:** asyncio
- **Auth:** JWT (PyJWT)

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, shadows, animations
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests

## 🎨 Design Features

- Modern gradient backgrounds (navy → saffron color scheme)
- Responsive card-based layouts
- Smooth hover animations and transitions
- Category chip filters
- Quick-search tags for popular searches
- Image preview before upload
- Dynamic content type switching in search

## 🐛 Testing

Run search tests:
```bash
python test_search_api.py
```

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

## 📄 License

This project is open source. Specify your license here.

## 👤 Author

DildarNagar Community Platform

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Last Updated:** March 2026  
**Status:** Active Development
