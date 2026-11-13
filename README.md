# Doorstep Shop — Mini E-Commerce Store (EF101-P18)

A full-stack e-commerce web application built using the MERN ecosystem (**React, Vite, Node.js, Express, and MongoDB Atlas**) with **Stripe Sandbox** and **Cash on Delivery (COD)** checkout workflows.

* **Project ID:** EF101-P18
* **Course:** EF101 — Information Technology Fundamentals (ITFA)
* **Department:** Electrical Engineering
* **Section & Group:** Section D — Group 11
* **Group Members:**
  * Afia Anshra (EE-162)
  * Ramiya (EE-167)
  * Muhammad Shahmeer Shahzad (EE-186)

## Live Deployment & Demo Credentials
* **Live Hosted Application (Vercel):** https://mini-e-commerce-store-two.vercel.app
* **GitHub Repository:** https://github.com/shahmeercodes161/Mini_E-Commerce_Store
* **Admin Dashboard Username / Email:** admin@doorstep.com
* **Admin Dashboard Password:** admin123
* **Customer Account:** user12@gmail.com
* **Customer Account Password :** 23456

## Online Database & Data Files
* **Online Database:** This project uses an online cloud database hosted on **MongoDB Atlas (MongoDB Cloud)** containing **57 products** across 5 categories (Accessories, Electronics, Men, Apparel, Home & Kitchen), along with customer order records.
* **Configuration Template:** `.env.example` (lists required environment variables: `MONGO_URI`, `STRIPE_SECRET_KEY`, `PORT`).
* **Sample Dataset:** `products_seed.json` (exported JSON dataset of the store catalog).

## Technologies Used
* **Frontend:** React.js (Vite), HTML5, CSS3, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Cloud Database) with Mongoose Object Modeling
* **File Uploads & Hosting:** Multer, Cloudinary, Vercel Cloud Hosting
* **Payment Simulation:** Stripe Sandbox API (Test Mode) & Cash on Delivery (COD)

## How to Run the Project Locally

### Prerequisites
* Ensure you have **Node.js** installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com.git
cd Mini_E-Commerce_Store
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backened
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your MongoDB connection string and Stripe test key:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   STRIPE_SECRET_KEY=your_stripe_sandbox_secret_key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd Frontened
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server (Vite):
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser to view the application.
  
