# AI Resume ↔ Job Skill Gap Analyzer

A full-stack web application that analyzes resumes against job descriptions to identify skill gaps and provide personalized learning recommendations using AI.

## 📋 Features

- **User Authentication**: Secure JWT-based registration and login
- **Resume Upload**: Support for PDF and DOCX file formats
- **Job Description Analysis**: Paste any job description for comparison
- **AI-Powered Skill Extraction**: Uses Google Gemini AI to extract and compare skills
- **Match Score**: Get a percentage match between your resume and the job
- **Skill Gap Analysis**: View matched, missing, and extra skills
- **Learning Roadmap**: Personalized recommendations with free learning resources
- **History Tracking**: Save and review past analyses

## 🛠️ Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router v6
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (file uploads)
- pdf-parse & mammoth (text extraction)
- Google Gemini AI

## 📁 Project Structure

```
Resume Checker/
├── server/                    # Backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth & error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── services/             # Business logic (AI, file parsing)
│   ├── uploads/              # Temporary file storage
│   ├── server.js             # Entry point
│   └── package.json
│
├── client/                    # Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service
│   │   ├── App.jsx           # Main app with routing
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### 1. Clone/Download the Project

Navigate to the project directory:
```bash
cd "Resume Checker"
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env and fill in your values
cp .env.example .env
```

Edit the `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your-secret-key-here-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### 4. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create environment file (optional, defaults work for local dev)
cp .env.example .env
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:5173

### 7. Access the Application

Open your browser and go to: http://localhost:5173

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile (protected) |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/analyze` | Upload resume & analyze (protected) |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get all analyses (protected) |
| GET | `/api/history/:id` | Get single analysis (protected) |
| DELETE | `/api/history/:id` | Delete analysis (protected) |

## 🏗️ Architecture Explanation

### MVC Pattern (Backend)

- **Models**: Define data structure (User, Analysis)
- **Controllers**: Handle business logic and API responses
- **Routes**: Define API endpoints and connect to controllers

### Component-Based Architecture (Frontend)

- **Common Components**: Reusable UI elements (Button, Input, Card)
- **Feature Components**: Domain-specific components (SkillTag, FileUpload)
- **Pages**: Full page components connected to routes
- **Context**: Global state management for authentication

### Data Flow

1. User uploads resume + pastes job description
2. Frontend sends FormData to backend API
3. Backend extracts text from resume file
4. Text is sent to Gemini AI for skill analysis
5. Results are saved to MongoDB and returned
6. Frontend displays results with visual charts

## 🎓 College Viva - Key Points

### What technologies did you use?
- MERN Stack (MongoDB, Express, React, Node.js)
- JWT for secure authentication
- Google Gemini AI for intelligent skill analysis
- Tailwind CSS for responsive design

### How does the skill matching work?
- AI extracts skills from both resume and job description
- Compares and categorizes as: matched, missing, or extra
- Calculates match percentage based on required skills present

### Why MongoDB?
- Flexible schema for storing varied skill data
- Easy to scale for multiple users
- Native JSON format matches JavaScript objects

### How is security handled?
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with 7-day expiry
- Protected routes require valid token
- No sensitive data in client-side storage

### What happens to uploaded files?
- Files are temporarily stored during processing
- Text is extracted and file is immediately deleted
- Only extracted text is stored in database

## 🔮 Future Improvements

1. **Resume Builder**: Generate optimized resumes based on job requirements
2. **Job Board Integration**: Fetch jobs from LinkedIn, Indeed APIs
3. **Progress Tracking**: Track skill development over time
4. **Multiple Resume Support**: Store and compare different resume versions
5. **Email Notifications**: Alert users when match score improves
6. **PDF Export**: Download analysis results as PDF reports
7. **Dark Mode**: Theme toggle for better user experience
8. **Admin Dashboard**: Analytics on skill trends and user activity

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally
- Check MONGODB_URI in .env file
- Try using MongoDB Atlas for cloud database

### Gemini API Error
- Verify API key is correct in .env
- Check if you have API quota remaining
- Ensure stable internet connection

### File Upload Not Working
- Check file size (max 5MB)
- Only PDF and DOCX are supported
- Ensure uploads directory exists in server

## 📝 License

This project is created for educational purposes.

---

Built with ❤️ for job seekers and career changers
