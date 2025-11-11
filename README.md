Foodify – Smart Food Ordering and Delivery System
2. Problem Statement
Ordering food during peak hours in college canteens or local restaurants often leads to long
queues, confusion, and order delays. Foodify aims to simplify this process by providing a
digital food ordering system where users can browse menus, place online orders, make
secure payments, and track order status in real time.
3. System Architecture
Frontend → Backend (API) → Database
Frontend: React.js with React Router and Axios for API calls
Backend: Node.js + Express.js REST API
Database: MySQL (relational)
Authentication: JWT-based user login/signup system
Hosting: Frontend (Vercel / Netlify), Backend (Render / Railway), Database (PlanetScale /
Aiven MySQL Cloud)
4. Key Features
Category Features
Authentication & Authorization User registration, login, logout, password
encryption (bcrypt), role-based access
(user/admin)
Menu Management Admin can add, update, or delete food
items with name, price, image, and
category
Cart & Orders Users can add items to cart, view total cost,
place orders
Order Tracking Real-time order status: “Pending →
Preparing → Ready → Completed”
Payments (Optional) Razorpay or Stripe integration for secure
online payments
Search & Filters Filter by category (Snacks, Meals, Drinks),
Profile & History Hosting search by name
View past orders and re-order with one
click
Both backend and frontend deployed on
cloud platforms
5. Tech Stack
Layer Technologies
Frontend React.js, React Router, Axios, TailwindCSS
Backend Node.js, Express.js
Database MySQL
Authentication JWT, bcrypt
Hosting Vercel (frontend), Render (backend),
PlanetScale (MySQL)
6. API Overview
Endpoint Method Description Access
/api/auth/signup POST Register a new user Public
/api/auth/login POST Authenticate user
and return JWT
Public
/api/foods GET Fetch all food items Public
/api/foods/:id GET Fetch a single food
Public
item
/api/foods POST Add a new food item Admin only
/api/foods/:id PUT Update food item Admin only
/api/foods/:id DELETE Delete food item Admin only
/api/cart GET View items in cart Authenticated
/api/cart POST Add item to cart Authenticated
/api/orders POST Place order Authenticated
/api/orders GET Get all user orders Authenticated
/api/orders/:id/status PUT Update order status Admin only
