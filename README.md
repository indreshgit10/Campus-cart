# Campus Cart

Campus Cart is a comprehensive e-commerce marketplace platform built specifically for college students to buy and sell items within their campus community. 

**Live Link:** https://www.campuscarts.in/ 

## Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io 
- JWT 
- Cloudinary 
- Resend API


## Features

- **User Authentication:** Secure signup and login using JWT.
- **Product Management:** Complete CRUD capabilities for listings with integrated image uploading via Cloudinary.
- **Real-Time Chat:** Integrated inbox and real-time chat powered by Socket.io, with conditional seller messaging restrictions.
- **Secure File Viewing:** PDF viewer for securely accessing digital materials or proof of purchase without direct downloads.
- **User Dashboard:** A comprehensive dashboard to manage profile, active product listings, and messages.
- **Security & Performance:** Robust protection using Helmet, HPP, expressive rate-limiting, and compression. 
- **SEO Optimized:** Friendly routing logic incorporating URL slugs and units.
- **Email Delivery:** Fast, reliable OTP-based password recovery integrated with the Resend API.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Campus-cart
   ```

2. **Backend Setup:**
   Navigate to the backend directory, install packages, and set up your environment variables.
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory based on required variables like `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_URL`, and `RESEND_API_KEY`.*

3. **Frontend Setup:**
   Navigate to the frontend directory, install packages, and set up your environment variables.
   ```bash
   cd ../frontend
   npm install
   ```

4. **Running the App Locally:**
   Run the backend Server:
   ```bash
   cd backend
   npm run dev
   ```
   Run the frontend Client:
   ```bash
   cd frontend
   npm run dev
   ```

