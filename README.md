# ♻️ EcoSort AI – Smart Waste Segregation Assistant

## Overview

EcoSort AI is an AI-powered waste segregation and sustainability platform that helps users identify waste items, understand proper disposal methods, and promote responsible waste management practices.

The system uses image analysis and AI-powered recommendations to classify waste into categories such as Plastic, Paper, Metal, Glass, Organic Waste, E-Waste, and more.

This project supports **United Nations Sustainable Development Goal (SDG) 12: Responsible Consumption and Production**.

---

## Problem Statement

Improper waste segregation is one of the major causes of pollution and inefficient recycling.

Many people are unaware of:

* Which waste items are recyclable
* Which bin should be used
* Environmental impact of improper disposal
* Sustainable alternatives

EcoSort AI aims to solve this problem through intelligent waste classification and sustainability guidance.

---

## Objectives

* Promote responsible waste disposal
* Improve recycling awareness
* Reduce landfill waste
* Provide AI-powered sustainability recommendations
* Support environmental conservation efforts

---

## SDG Alignment

### SDG 12 – Responsible Consumption and Production

EcoSort AI encourages sustainable waste management by helping users:

* Identify waste correctly
* Recycle effectively
* Reduce environmental impact
* Develop sustainable habits

---

## Features

### User Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Routes

### Waste Analysis

* Upload Waste Images
* AI-Based Classification
* Waste Category Detection
* Disposal Recommendations
* Environmental Impact Analysis
* Eco Score Generation

### Dashboard

* Total Upload Statistics
* Waste Category Distribution
* Average Eco Score
* Recent Waste Scans
* Personal Waste History

### API Documentation

* Swagger Integration
* Interactive API Testing
* OpenAPI Specification

---

## Technology Stack

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* bcryptjs

### AI

* Google Gemini API

### Documentation

* Swagger UI
* Swagger JSDoc

---

## Project Structure

```text
EcoSort-AI
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── server.js
│   └── package.json
│
└── Frontend (Coming Soon)
```

---

## API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/profile  |

### Waste Management

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/waste/analyze |
| GET    | /api/waste/history |
| GET    | /api/waste/stats   |
| GET    | /api/waste/recent  |

---

## Dashboard APIs

### Waste Statistics

```http
GET /api/waste/stats
```

Returns:

```json
{
  "totalUploads": 25,
  "plastic": 12,
  "paper": 5,
  "metal": 3,
  "glass": 2,
  "organic": 3,
  "averageEcoScore": 84
}
```

### Recent Scans

```http
GET /api/waste/recent
```

Returns latest user waste scans.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Dhruvbhagat24/EcoSort-AI.git
```

### Install Dependencies

```bash
cd Backend
npm install
```

### Configure Environment Variables

Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

### Start Server

```bash
npm run dev
```

---

## Swagger Documentation

Run the server and open:

```text
http://localhost:5000/api-docs
```

to access the interactive API documentation.

---

## Responsible AI Considerations

* Fairness in recommendations
* Transparency in AI-generated outputs
* Privacy protection
* Sustainable and ethical AI usage
* No misuse of personal data

---

## Future Enhancements

* React Frontend Dashboard
* Real-Time Waste Analytics
* AI Chatbot for Sustainability Guidance
* Cloudinary Image Storage
* Sustainability Leaderboard
* Eco Reward System
* Mobile Application
* Carbon Footprint Estimation

---

## Author

**Dhruv Bhagat**

Computer Science Engineering Student

GitHub:
https://github.com/Dhruvbhagat24

---

## License

This project is developed for educational and sustainability-focused purposes.
