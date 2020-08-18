const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Quote = require('../models/Quote');

// @desc Login/Landing page
// @route GET / 
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login'
  })
})

// @desc Dashboard
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const quotes = await Quote.find({user: req.user.id}).lean()

    // Second param is the content accessible by {{}}
    res.render('dashboard', {
    name: req.user.firstName,
    image: req.user.image,
    quotes
  })
  } catch(err) {
    console.error(err)
  }
  
})

module.exports = router