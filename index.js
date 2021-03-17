const express = require('express')
const session = require("express-session")
const app = express()
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

//Import Routes
const auth = require('./Routes/auth')
const user = require('./Routes/user')

//Middleware
app.use(express.static(__dirname + "/Views"));
app.set('view engine', 'ejs');

app.use(express.json())
app.use(session({
  name: 'abc',
  secret: 'abc',
  user_id: 'abc',
  saveUninitialized: true,
  resave: true,
    cookie: {
      secure: false,
      maxAge: 2160000000,
      httpOnly: true,
      sameSite: "lax",
  }
}))

//Routes
app.use('/auth', auth);
app.use('/user', user);

app.get('/', async (req, res) => {
  const access_token = await req.query.access_token
  if(access_token == null){
    res.render(path.resolve("./Views/Landing"));
  }
  else{
    req.session.secret = access_token
    res.redirect('/user');
  }
})

/**
 * If a user goes a non existing link
 * Reroute them based on the status of their session.
 * Route them to dashboard if they're logged on 
 * Route them to the Landing page if they arent'
 */
app.get('*', async(req, res) => {
  const access_token = await req.session.secret;
  if(access_token == undefined){
    res.redirect(process.env.MAIN_URI);
  } else{
    res.redirect('/user');    //store this link as dashboard_URI as an ENV. So, you can direct the user to the main page if login.
  }
})

//Hosting PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}.`)
})
