const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const pool = require('./database');
const { consumers } = require('nodemailer/lib/xoauth2');
const LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy((username, password, done) => {
    pool.query('SELECT * FROM users WHERE username = ?', username, (error, results) => {
        if (error) {
            return done(error);
        }
        if (!results.length) {
            return done(null, false, { message: 'Incorrect username' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) {
                return done(error);
            }
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }
        });
    });
}));


const authenticate = passport.authenticate('local', { session: false });


router.post('/login', authenticate, (req, res) => {
    
    res.json({ message: 'Login successful', user: req.user });
});




router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

module.exports = router;
