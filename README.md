# Full Stack Web Application

A modern full-stack web application built with React, Python FastAPI, and MySQL.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Ant Design** for UI components
- **Axios** for API calls

### Backend
- **Python FastAPI** for REST API
- **MySQL** database
- **SQLAlchemy** for ORM
- **Pydantic** for data validation

### Database
- **MySQL** with database name "app"

## Project Structure

```
curaza/
├── frontend/          # React application
├── backend/           # Python FastAPI backend
├── database/          # MySQL schema and migrations
└── README.md          # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MySQL Server

### 1. Database Setup
1. Install and start MySQL server
2. Run the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 2. Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure database connection:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

6. Start the backend server:
   ```bash
   python main.py
   ```
   The API will be available at http://localhost:8000

### 3. Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check and database connection status
- `GET /users` - Get all users
- `POST /users` - Create a new user

## Development

### Frontend Development
- The frontend uses Vite for hot module replacement
- Tailwind CSS is configured for utility-first styling
- Ant Design provides pre-built components

### Backend Development
- FastAPI provides automatic API documentation at http://localhost:8000/docs
- CORS is configured to allow requests from the frontend
- Environment variables are used for configuration

### Database
- MySQL database with "app" schema
- Users table with basic user information
- Sample data is included for testing

## Next Steps

1. Add authentication and authorization
2. Implement more complex data models
3. Add form validation and error handling
4. Set up testing frameworks
5. Configure production deployment
