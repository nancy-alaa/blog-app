# Blog App (Node.js + MySQL)

A simple blog application backend built with **Express.js** and **MySQL**.  
It handles user sign up, login, profile, and CRUD operations for blogs.

## Features

- User signup & login
- View user profile (with age and full name)
- Create, update, delete blogs
- Only blog owners can edit or delete their blogs
- Search users by name
- RESTful API structure

## Tech Stack

- Node.js
- Express.js
- MySQL (with mysql2)
- Postman (for testing)

## API Endpoints

### Users
- `POST /users/signup` – Register a new user
- `POST /users/signin` – User login
- `GET /users?id=1` – Get user by query ID
- `GET /users/:id/profile` – Get profile info
- `GET /users/search?name=A` – Search users
- `PATCH /users/update/:id` – Update gender
- `DELETE /users/delete/:id` – Delete user

### Blogs
- `POST /blogs` – Add a new blog
- `GET /users/blogs` – Get all users with their blogs
- `PATCH /users/:user_id/blogs/:blog_id` – Update blog (owner only)
- `DELETE /users/:user_id/blogs/:blog_id` – Delete blog (owner only)

## Setup Instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/nancy-alaa/blog-app.git
   cd blog-app
