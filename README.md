# todo_Lavanya

## To-Do List App

### Description

This is a full-stack To-Do List application that helps users manage daily tasks efficiently.  
The project is built using **Next.js** for the frontend and **ASP.NET Core Web API** for the backend, with:

- JWT-based authentication
- EF Core for database operations
- SQLite as the database

It features task categorization, filtering, drag-and-drop reordering, user profile management, and secure login/register functionality.

---

## Installation Instructions

### Backend Setup (ASP.NET Core Web API)

1. **Create a new Web API project**
   ```bash
   dotnet new webapi -n TodoApi
   cd TodoApi
   ```
   This creates a basic RESTful API structure with Program.cs and the Controllers/ folder.

2. **Add required NuGet packages**
   ```
   dotnet add package Microsoft.EntityFrameworkCore.Sqlite
   dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
   dotnet add package Microsoft.EntityFrameworkCore.Tools
   ```
   - Sqlite: Lightweight database
   - Identity.EntityFrameworkCore: For user registration/login
   - EFCore.Tools: For migrations via CLI

3. **Install EF Core CLI**
   If you haven't installed the EF Core CLI tools globally, run:

   ```bash
   dotnet tool install --global dotnet-ef
   ```
   Create initial migration and apply it

   ```bash
   dotnet ef migrations add Init
   dotnet ef database update
   ```
   This creates the necessary database schema and tables (in app.db).
   Ensure ApplicationDbContext.cs is correctly added in the root (TodoApi/) folder.

### Frontend Setup (Next.js + TypeScript)

1. **Create a Next.js project**
   ```bash
   npx create-next-app@latest todo-frontend
   cd todo-frontend
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```
3. **Connect to Backend API**
   Use `fetch()` or `axios` to call your .NET Web API endpoints.
   You may create an axiosInstance.ts for global config and interceptors.
   For mobile testing, replace localhost with your machine IP in axiosInstance.ts like http://192.168.x.x:5000.


## How to Run the Project

### Backend

   ```bash
   cd TodoApi
   dotnet run
   ```
   Runs the backend server on `http://localhost:5000`

### Frontend

   ```bash
   cd todo-frontend
   npm run dev
   ```
   Runs the frontend on `http://localhost:3000`
   Register or login to use the app.


## Features

- User Authentication
  - Register/Login with JWT
  - Refresh + Access token strategy

- Task Management
  - Add/edit/delete tasks with title, description, due date, priority, category
  - Mark as completed/uncompleted
  - Drag-and-drop task reordering
  - Filter by category, priority, due date, and status
  - Delete all completed tasks
  - Daily progress bar

- User Profile
  - Update name, mobile number, password
  - View task completion stats

- UI/UX
  - Responsive design
  - Expandable sidebar with blur effect
  - Toast messages for actions


## Technologies Used

### Frontend:
- Next.js
- TypeScript
- HTML/CSS
- Axios
- React Hooks

### Backend:
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- ASP.NET Core Identity
- JWT Authentication


## How GitHub Copilot Was Used

### Frontend
- Auto-generated React functional components and boilerplate
- Helped implement form validation and UI conditionals
- Assisted with axios integration and custom hooks
- Suggested variable/function names to enhance readability

### Backend
- Suggested controller methods for CRUD APIs
- Generated DTO classes and model definitions
- Helped configure Identity and JWT setup
- Streamlined DbContext setup and service layer patterns
- Assisted with validation, error handling, and logging patterns

### General
- Reduced repetitive code
- Acted as a pair programmer for faster prototyping
- Maintained consistency in naming and logic
- Significantly accelerated development pace


## Project Structure

TodoApi/
├── Controllers/
│   ├── AccountController.cs
│   ├── TodoController.cs 
├── Models/
│   ├── ApplicationUser.cs
│   ├── AuthDtos.cs
│   ├── ReorderDto.cs
│   ├── TodoItem.cs
│   ├── UpdateUserDto.cs
├── Services/
│   ├── Implementations/
│   │   ├── AccountService.cs
│   │   ├── TodoService.cs
│   ├── Interfaces/
│   │   ├── IAccountService.cs
│   │   ├── ITodoService.cs
├── ApplicationDbContext.cs
├── Migrations/
├── TodoApi.csproj
└── Program.cs
|
todo-frontend/
├── src/app/
│   ├── add-tasks/page.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── SideMenu.tsx
│   ├── edit/page.tsx
│   ├── login/page.tsx
│   ├── profile/page.tsx
│   ├── register/page.tsx
│   ├── utils/
│   │   ├── auth.ts
│   │   ├── axiosInstance.ts
│   │   ├── getUserIdFromToken.ts
│   └── page.tsx

