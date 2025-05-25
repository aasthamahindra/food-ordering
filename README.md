# Food Ordering Application

## Project Overview

This is a full-stack web application for food ordering with role-based access control (RBAC) and regional access management. The application allows users to view restaurants, create orders, and manage payments based on their assigned roles and geographical regions.

## Architecture

- **Backend**: Fastify (Node.js)
- **Frontend**: React + Vite + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control with regional restrictions

## Features Implemented

### Core Functionality
✅ **Backend (Fully Implemented)**
- User authentication and authorization
- Restaurant and menu management
- Order creation and management
- Payment method handling
- Order cancellation
- Role-based access control (RBAC)
- Regional access restrictions (Bonus feature)

⚠️ **Frontend (Partially Implemented)**
- Basic React setup with TypeScript
- Component structure in place
- API integration points defined
- **Note**: Frontend UI/UX implementation is incomplete due to limited frontend development experience

## User Roles & Permissions

| Function | Admin | Manager | Member |
|----------|-------|---------|---------|
| View restaurants & menu items | ✅ | ✅ | ✅ |
| Create order (add food items) | ✅ | ✅ | ✅ |
| Place order (checkout & pay) | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |
| Update payment method | ✅ | ❌ | ❌ |

## Regional Access Control (Bonus Feature)
- **India Region**: Captain Marvel (Manager), Thanos (Member), Thor (Member)
- **America Region**: Captain America (Manager), Travis (Member)
- Users can only access data and perform actions within their assigned region

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables: [Already setup]

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The backend will be running on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables: [Already setup]

4. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Default Users

The application comes with pre-seeded users:

| Name | Email | Role | Region | Password |
|------|-------|------|---------|----------|
| Nick Fury | nick.fury@example.com | Admin | Global | admin123 |
| Captain Marvel | captain.marvel@example.com | Manager | India | manager123 |
| Captain America | captain.america@example.com | Manager | America | manager123 |
| Thanos | thanos@example.com | Member | India | member123 |
| Thor | thor@example.com | Member | India | member123 |
| Travis | travis@example.com | Member | America | member123 |

## Current Status

### ✅ Completed Features
- Complete backend implementation with all required functionality
- JWT-based authentication system
- Role-based access control (RBAC)
- Regional access restrictions (Bonus feature)
- All API endpoints working as expected
- Database models and relationships
- Error handling and validation
- API documentation

### ⚠️ Pending/Incomplete Features
- Frontend UI implementation
- React component styling and user experience
- Form validations on frontend
- State management optimization
- Frontend error handling
- Responsive design

## Known Issues & Limitations

1. **Frontend Development**: The frontend implementation is basic due to limited experience with React/TypeScript development
2. **UI/UX**: User interface needs significant improvement for production use
3. **Testing**: Frontend unit tests are not implemented
4. **Error Handling**: Frontend error handling could be more robust

## Future Improvements

1. Complete frontend implementation with proper UI/UX
2. Add comprehensive frontend testing
3. Implement real-time order tracking
4. Add email notifications
5. Implement proper logging and monitoring
6. Add API rate limiting
7. Implement caching strategies

## Demo

- **Backend Demo**: All API endpoints are fully functional and can be tested using the provided Postman collection
- **Frontend Demo**: Basic React application structure is in place but requires UI development