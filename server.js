const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet')
const passport = require('passport')
const { Strategy } = require('passport-google-oauth20')

const PORT = 3000;

require('dotenv').config()

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET  
}

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.clientSecret
}
// This is a callback function that is call when passport authenticate a user
// so passport parse it the user credentials contains in that request
function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log('Google profile', profile)
  // with this function you're indicating to passport that user is logged in 
  //
  done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

const app = express();

app.use(helmet())
// this helps us to initialize passport specifically passport session
app.use(passport.initialize())

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true // TODO
  if (!isLoggedIn) {
    res.status(401).json({
      error: 'You must log in'
    })
  }
  next()
}

app.get('/auth/google', passport.authenticate('google', {
  scope: ['email']
}))

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false
  }), 
  (req, res) => {
    console.log('Google call us back, wojooo!')
  }
)

app.get('/auth/logout', (req,res) => {})

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secret value is 42!');
});

app.get('/failure', (req, res) => {
  res.send('Failed to log in')
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});