# Backend Application

This is a backend application built using TypeScript, Prisma, MySQL, and Express. It provides various authentication and user management routes.

## Technologies Used

- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Prisma**: An ORM (Object-Relational Mapping) tool for database management.
- **MySQL**: A relational database management system.
- **Express**: A minimal and flexible Node.js web application framework.

## Routes

### Authentication Routes

- **Login**
    ```http
    POST /auth/login
    ```
    - Middleware: `senstiveRoutes`
    - Controller: `login`

- **Signup**
    ```http
    POST /auth/signup
    ```
    - Controller: `signup`

- **Forgot Password**
    ```http
    POST /auth/forgot-password
    ```
    - Controller: `forgotPassword`

- **Reset Password**
    ```http
    POST /auth/reset-password
    ```
    - Middleware: `senstiveRoutes`
    - Controller: `resetPassword`

- **Logout**
    ```http
    POST /auth/logout
    ```
    - Middleware: `authenticateToken`
    - Controller: `logout`

- **Refresh Token**
    ```http
    GET /auth/refresh-token
    ```
    - Controller: `refreshAccessToken`

### User Management Routes

- **Get All Users**
    ```http
    GET /users
    ```
    - Middleware: `authenticateToken`, `isAdmin`
    - Controller: `getAllUsers`

- **Get User by ID**
    ```http
    GET /users/:id
    ```
    - Middleware: `isUser`
    - Controller: `getUserById`

- **Update User**
    ```http
    PUT /users/:id
    ```
    - Middleware: `isUser`
    - Controller: `updateUser`

- **Delete User**
    ```http
    DELETE /users/:id
    ```
    - Middleware: `isAdmin`
    - Controller: `deleteUser`

## Getting Started

### Prerequisites

- Node.js
- MySQL

### Installation

1. Clone the repository:
     ```sh
     git clone <repository-url>
     ```
2. Install dependencies:
     ```sh
     npm install
     ```
3. Set up the database using Prisma:
     ```sh
     npx prisma migrate dev
     ```

### Running the Application

1. Start the server:
     ```sh
     npm run dev
     ```

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact [meenavishal2211@gmail.com].
