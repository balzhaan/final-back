> [!NOTE] 
> At the end of the Documentation, tree of project displayed for better understanding.

# Portfolio Management Project

A portfolio management application that allows users to manage their portfolio items, including images and descriptions. The project includes authentication, CRUD operations for portfolio items, and a clean, responsive frontend using Bootstrap and EJS.

## Features
- Authentication with role-based access (admin and editor)
- CRUD operations for portfolio items
- Responsive design with Bootstrap
- Image uploading and display in a carousel
- Two API integrations
- Two datasets for data visualization
- Messaging via Nodemailer for notifications
- 2FA setup for extra security

## Technologies Used
- Node.js
- Express, express-session
- EJS
- MongoDB (for storing user data and portfolio items)
- bcrypt.js (for password hashing)
- nodemailer (for email notifications)
- bootstrap (for styling)
- axios (for API integrations)
- otplib (for one-time-password verifying, generating, linking and etc.)
- qrcode (creating QR code based on data)
- csv-parser (to read data from csv files)
- connect-flash (to render a message whenever a user is redirected to a particular webpage, temp stored)
- multer (to upload files into root directory)

## Prerequisites
- Node.js (>=v18.x)
- MongoDB (for local development)
- An email service provider (for Nodemailer)

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/portfolio-management.git
cd portfolio-management
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
    - You need to set your gmail app pass

4. Run the project

```bash
npm start
```

The project will be available at http://localhost:3000.

## Third Party APIs used

1. NewsAPI (https://newsapi.org/)
2. SportsDataIO (https://sportsdata.io/)

## For 2FA setup

- You just need to install on your mobile phone applications like Authenticator App, Google Authenticator App etc.
- After that just scan QR code, and you are linked with website.
- Now, when website prompts to enter OTP, you look into your app and write that OTP which displayed at that time.
- OTP changes each 30 seconds.

```bash
.
├── README.md
├── config
│   ├── database.js
│   └── email.js
├── controllers
│   ├── authController.js
│   └── portfolioController.js
├── data
│   ├── GlobalWeatherRepository.csv
│   └── StudentPerformanceFactors.csv
├── middleware
│   ├── auth.js
│   ├── isAdmin.js
│   └── upload.js
├── models
│   ├── portfolioItem.js
│   └── user.js
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   └── carousel.css
│   └── js
│       ├── create.js
│       ├── delete.js
│       ├── edit.js
│       ├── home.js
│       ├── login.js
│       ├── setup-2fa.js
│       ├── signup.js
│       └── verify-otp.js
├── routes
│   ├── authRoutes.js
│   ├── portfolioRoutes.js
│   └── viewRoutes.js
├── server.js
├── uploads
│   ├── 1731448936407.png
│   ├── 1731454206604.png
│   ├── 1731503579509.jpg
│   └── 1731503579510.png
├── utils
│   └── email-sender.js
└── views
    ├── createPortfolio.ejs
    ├── deletePortfolio.ejs
    ├── editPortfolio.ejs
    ├── error.ejs
    ├── home.ejs
    ├── login.ejs
    ├── news.ejs
    ├── security.ejs
    ├── setup-2fa.ejs
    ├── signup.ejs
    ├── sports.ejs
    ├── student-performance.ejs
    ├── verify-otp.ejs
    └── weather.ejs
```
