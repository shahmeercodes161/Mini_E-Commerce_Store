# Mini E-Commerce Store

A full-stack e-commerce application built using the MERN ecosystem (React, Vite, Node.js, Express, and MongoDB Atlas).

## 🚀 How to Run the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com
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
3. Create a `.env` file based on `.env.example` and add your MongoDB connection string:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
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

## ⚙️ Technologies Used
* **Frontend:** React, Vite, HTML5, CSS3, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Cloud Database) with Mongoose Object Modeling
* **File Uploads:** Multer
*
