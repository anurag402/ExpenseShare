# Expense Sharing Application - Backend

A simplified Splitwise-like expense sharing application backend.

## Features

- ✅ Create groups
- ✅ Add shared expenses
- ✅ Track balances
- ✅ Settle dues
- ✅ Three split types: Equal, Exact, Percentage
- ✅ Simplified balance tracking

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

Server runs on http://localhost:3000

## API Endpoints

### Users

- `POST /api/users` - Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Groups

- `POST /api/groups` - Create a new group
  ```json
  {
    "name": "Trip to Paris",
    "createdBy": "user-id",
    "members": ["user-id-1", "user-id-2"]
  }
  ```

- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `GET /api/groups/user/:userId` - Get groups for a user
- `POST /api/groups/:id/members` - Add member to group

### Expenses

- `POST /api/expenses` - Create a new expense
  
  **Equal Split:**
  ```json
  {
    "groupId": "group-id",
    "description": "Dinner",
    "amount": 100,
    "paidBy": "user-id",
    "splitType": "equal"
  }
  ```

  **Exact Split:**
  ```json
  {
    "groupId": "group-id",
    "description": "Groceries",
    "amount": 100,
    "paidBy": "user-id",
    "splitType": "exact",
    "splits": [
      { "userId": "user-id-1", "amount": 30 },
      { "userId": "user-id-2", "amount": 70 }
    ]
  }
  ```

  **Percentage Split:**
  ```json
  {
    "groupId": "group-id",
    "description": "Rent",
    "amount": 1000,
    "paidBy": "user-id",
    "splitType": "percentage",
    "splits": [
      { "userId": "user-id-1", "percentage": 40 },
      { "userId": "user-id-2", "percentage": 60 }
    ]
  }
  ```

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `GET /api/expenses/group/:groupId` - Get expenses for a group
- `DELETE /api/expenses/:id` - Delete an expense

### Balances

- `GET /api/balances` - Get all simplified balances
- `GET /api/balances/user/:userId` - Get balances for a user
- `GET /api/balances/group/:groupId` - Get balances for a group
- `POST /api/balances/settle` - Settle a balance
  ```json
  {
    "fromUserId": "user-id-1",
    "toUserId": "user-id-2",
    "amount": 50,
    "groupId": "group-id" // optional
  }
  ```

## Example Usage Flow

1. Create users
2. Create a group with members
3. Add expenses to the group (equal, exact, or percentage split)
4. View balances to see who owes whom
5. Settle balances when payments are made

## Architecture

- **Models**: User, Group, Expense, Balance
- **Services**: ExpenseService (split calculations), BalanceService (balance tracking)
- **Routes**: RESTful API endpoints
- **Storage**: In-memory (can be replaced with database)
