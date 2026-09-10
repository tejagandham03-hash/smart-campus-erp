# Smart Campus ERP - Backend Server

Backend server for the Smart Campus ERP platform built with Node.js, Express.js, and MongoDB.

## Setup

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-campus
JWT_SECRET=your_secure_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Students (Admin only)
- `GET /api/students` - List all students (pagination, search, filter)
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Faculty (Admin only)
- `GET /api/faculty` - List all faculty
- `POST /api/faculty` - Create new faculty
- `GET /api/faculty/:id` - Get faculty details
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Departments (Admin only)
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Courses (Admin only)
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subjects (Admin only)
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/:id` - Get subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance (Faculty/Admin)
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/attendance/report/summary` - Get attendance summary

### Fees (All)
- `GET /api/fees` - List fees
- `POST /api/fees` - Create fee record (Admin)
- `GET /api/fees/:id` - Get fee details
- `PUT /api/fees/:id` - Update fee
- `DELETE /api/fees/:id` - Delete fee (Admin)
- `GET /api/fees/statistics/overview` - Fee statistics (Admin)

### Timetable (Admin)
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create timetable entry
- `GET /api/timetable/:id` - Get timetable entry
- `PUT /api/timetable/:id` - Update timetable
- `DELETE /api/timetable/:id` - Delete timetable

### Examinations (All)
- `GET /api/examinations` - List examinations
- `POST /api/examinations` - Create exam (Admin)
- `GET /api/examinations/:id` - Get exam
- `PUT /api/examinations/:id` - Update exam (Admin)
- `DELETE /api/examinations/:id` - Delete exam (Admin)

### Results (Faculty/Admin)
- `GET /api/results` - List results
- `POST /api/results` - Create result (Faculty/Admin)
- `GET /api/results/:id` - Get result
- `PUT /api/results/:id` - Update result (Faculty/Admin)
- `DELETE /api/results/:id` - Delete result (Admin)

### Notifications (Admin/Faculty)
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification (Admin/Faculty)
- `GET /api/notifications/:id` - Get notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/:id` - Update notification (Admin)
- `DELETE /api/notifications/:id` - Delete notification (Admin)

### Placements (All)
- `GET /api/placements` - List placement opportunities
- `POST /api/placements` - Create opportunity (Admin)
- `GET /api/placements/:id` - Get opportunity
- `PUT /api/placements/:id` - Update opportunity (Admin)
- `DELETE /api/placements/:id` - Delete opportunity (Admin)
- `POST /api/placements/:id/apply` - Apply for opportunity (Student)
- `GET /api/placements/:placementId/applications` - Get applications (Admin)
- `PUT /api/placements/applications/:applicationId/status` - Update application status (Admin)

### AI Chat (All)
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/chat/history` - Get chat history
- `GET /api/ai/conversations` - Get all conversations
- `DELETE /api/ai/chat/:conversationId` - Delete conversation
- `PUT /api/ai/chat/:conversationId/clear` - Clear conversation

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 attempts per 15 minutes per IP
- AI endpoints: 30 requests per 15 minutes per user

## Security Features

- Password hashing with bcryptjs
- JWT authentication
- Role-based access control
- Helmet.js security headers
- CORS configuration
- Input validation
- Rate limiting
- MongoDB injection protection via Mongoose

## Environment Variables

All sensitive data must be configured via environment variables:

```env
PORT=5000                                              # Server port
MONGO_URI=mongodb+srv://...                           # MongoDB connection string
JWT_SECRET=your_secret_key                            # JWT secret key
GROQ_API_KEY=gsk_...                                  # Groq API key
CLIENT_URL=http://localhost:5173                      # Frontend URL
NODE_ENV=development                                  # Environment
```

## Database Models

- User
- Student
- Faculty
- Department
- Course
- Subject
- Attendance
- Fee
- Timetable
- Examination
- Result
- Notification
- Placement
- PlacementApplication
- Chat

## Testing

### Demo Credentials

After running seed:
- Admin: admin@smartcampus.edu / Admin@123
- Faculty: faculty1@smartcampus.edu / Faculty@123
- Student: student1@smartcampus.edu / Student@123

## Troubleshooting

### MongoDB Connection Failed
- Verify MONGO_URI is correct
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted

### JWT Errors
- Clear localStorage on client
- Verify JWT_SECRET matches
- Check token expiration

### Groq API Errors
- Verify GROQ_API_KEY is valid
- Check Groq API status
- Verify rate limits not exceeded

## Architecture

```
server/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── app.js           # Express app
│   └── server.js        # Entry point
└── scripts/
    └── seed.js          # Database seeding
```

## Contributing

Please follow existing code structure and patterns.

## License

MIT
