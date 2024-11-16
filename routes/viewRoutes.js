const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
    if(req.session.user){
        res.redirect('/home')
    } else{
        res.render('login'); 
    }
  });
  
router.get('/verify-otp', (req, res) => {
    const {username} = req.query;
    res.render('verify-otp', {username});
})

router.get('/setup-2fa', (req, res) =>{
    const {username} = req.query;
    res.render('setup-2fa', {username});
})

router.get('/signup', (req, res) => {
    res.render('signup');
})

router.get('/home', isAuthenticated, (req, res) => {
    res.render('home');
})

router.get('/create', isAuthenticated, (req, res) =>{
    res.render('createPortfolio');
})

router.get('/delete', isAuthenticated, isAdmin, (req, res) =>{
    res.render('deletePortfolio');
})

router.get('/edit', isAuthenticated, isAdmin, (req, res) =>{
    res.render('editPortfolio');
})

router.get('/error', (req, res) => {
    res.render('error', { message: req.flash('error') });
}); 

router.get('/security', isAuthenticated, (req, res) =>{
    const username = req.session.user.username;
    res.render('security', {username});
})

const NEWS_API_KEY = '8e149a6dfc464cbea0f30f45d4181370';
router.get('/news', isAuthenticated , async (req, res) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
        res.render('news', { articles: response.data.articles });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send('Error fetching news data');
    }
});

const SPORTS_API_KEY = '39b75a7405d94a0fb081b3d681aa86f2';
router.get('/sports', isAuthenticated, async (req, res) => {
    try {
        const response = await axios.get(`https://api.sportsdata.io/v4/soccer/scores/json/ActiveMemberships/EPL?key=${SPORTS_API_KEY}`);
        res.render('sports', { epl: response.data });
    } catch (error) {
        console.error('Error fetching sports data:', error);
        res.status(500).send('Error fetching sports data');
    }
});

router.get('/student', isAuthenticated, (req, res) => {
    const studentData = [];
    fs.createReadStream('data/StudentPerformanceFactors.csv')
        .pipe(csv())
        .on('data', (row) => {
            studentData.push({
                Hours_Studied: row.Hours_Studied,
                Sleep_Hours: row.Sleep_Hours,
                Attendance: row.Attendance,
            });
        })
        .on('end', () => {
            const limitedStudentData = studentData.slice(0, 100);
            res.render('student-performance', { limitedStudentData });
        });
});

router.get('/weather', isAuthenticated, (req, res) => {
    const weatherData = [];
    fs.createReadStream("data/GlobalWeatherRepository.csv")
        .pipe(csv())
        .on('data', (row) => weatherData.push(row))
        .on('end', () => {
            const limitedWeatherData = weatherData.slice(0, 100);
            res.render('weather', { weatherData: limitedWeatherData });
        });
});

module.exports = router;
