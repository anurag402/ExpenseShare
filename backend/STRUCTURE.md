# Expense Sharing API - Backend

A Node.js/Express backend for an expense sharing application with MongoDB and JWT authentication.

## Project Structure

```
backend/
├── models/
│   ├── UserSchema.js        # User model with password hashing
│   ├── GroupSchema.js       # Group model
│   ├── ExpenseSchema.js     # Expense model
│   └── BalanceSchema.js     # Balance tracking model
├── controllers/
│   ├── authController.js    # Register & Login handlers
│   ├── userController.js    # User management handlers
│   ├── groupController.js   # Group CRUD & member management handlers
│   ├── expenseController.js # Expense tracking handlers
│   └── balanceController.js # Balance calculation & settlement handlers
├── routes/
│   ├── authRoutes.js        # Maps auth endpoints to controllers
│   ├── userRoutes.js        # Maps user endpoints to controllers
│   ├── groupRoutes.js       # Maps group endpoints to controllers
│   ├── expenseRoutes.js     # Maps expense endpoints to controllers
│   └── balanceRoutes.js     # Maps balance endpoints to controllers
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── services/
│   └── jwt.js               # JWT sign/verify helpers (access only)
├── server.js                # Express server setup
├── .env                     # Environment variables
└── package.json             # Dependencies

```

## Features

- **User Authentication**: Register and login with JWT tokens
- **Groups**: Create groups, manage members
- **Expenses**: Track expenses with equal/exact/percentage splits
- **Balances**: Calculate who owes whom and settle debts
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing (bcryptjs), JWT tokens

## Environment Variables

```
PORT=3000
MONGO_DB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
MONGO_SSL=true
MONGO_TLS_ALLOW_INVALID=true
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user

### Groups (Protected)
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `GET /api/groups/user/:userId` - Get user's groups
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member

### Expenses (Protected)
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/group/:groupId` - Get group expenses
- `DELETE /api/expenses/:id` - Delete expense

### Balances (Protected)
- `GET /api/balances` - Get all balances
- `GET /api/balances/user/:userId` - Get user balances
- `GET /api/balances/group/:groupId` - Get group balances
- `POST /api/balances/settle` - Settle a balance

## Installation & Running

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`
