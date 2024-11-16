const express = require('express');
const session = require('express-session');
require('dotenv').config();
require('./config/database');
const authRoutes = require('./routes/authRoutes');
const portfolioRouter = require('./routes/portfolioRoutes');
const viewRoutes = require('./routes/viewRoutes');
const path = require('path');
const flash = require('connect-flash');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views'); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(flash());

app.use(
  session({
    secret: '71231ca5a34d7ab1ae1a3b8583efe3598a84ed21d6d9baa21f73727b4c958545',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,      
      secure: false,
      sameSite: 'strict',   
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use('/auth', authRoutes); 
app.use('/portfolio', portfolioRouter); 
app.use(viewRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
