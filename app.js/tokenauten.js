const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('./userauthen'); 
const passport = require('passport'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const pool = require('./database');
const LocalStrategy = require('passport-local').Strategy; 

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


app.use('/users', usersRouter);


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


function verifyToken(req, res, next) {
    
    const bearerHeader = req.headers['authorization'];
    
    if (typeof bearerHeader !== 'undefined') {
        
        const bearer = bearerHeader.split(' ');
       
        const token = bearer[1];
       
        jwt.verify(token, 'Secretkey', (err, authData) => {
            if (err) {
                res.sendStatus(403); 
            } else {
                req.authData = authData;
                next(); 
            }
        });
    } else {
        
        res.sendStatus(403);
    }
}


function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username  }, 'Secretkey', { expiresIn: '1h' });
}


app.post('/login', authenticate, (req, res) => {
    const token = generateToken(req.user); 
    res.json({ message: 'Login successful', token });
});


app.get('/protected', verifyToken, (req, res) => {
   
    res.json({ message: 'Protected data', user: req.authData });
});


app.post('/register', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
