const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Quote = require('../models/Quote');
const { populate, findById } = require('../models/Quote');

// @desc Show add page
// @route GET /quotes/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('quotes/add')
})

// @desc Process add form
// @route POST /quotes
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Quote.create(req.body)
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc Show all quotes
// @route GET /quotes
router.get('/', ensureAuth, async (req, res) => {
  try {
    const quotes = await Quote.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('quotes/index', {
      quotes,
    })
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
})

// @desc Show single quote
// @route GET /quotes/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let quote = await Quote.findById(req.params.id)
      .populate('user')
      .lean()
    
    if(!quote) {
      res.render('error/404')
    }

    res.render('quotes/show', {
      quote
    })

  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
})

// @desc Show edit page
// @route GET /quotes/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const quote = await Quote.findOne({ 
      _id: req.params.id,
     }).lean()
  
    if(!quote) {
      return res.render('error/404');
    }
  
    if(quote.user != req.user.id){
      res.redirect('/quotes')
    } else {
      res.render('quotes/edit', {
        quote,
      });
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500');
  }
})

// @desc Update quote
// @route PUT /quotes/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let quote = await Quote.findById(req.params.id).lean()

    if(!quote) {
      return res.render('error/404')
    }

    if(quote.user != req.user.id){
      res.redirect('/quotes')
    } else {
      quote = await Quote.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,
        runValidators: true,
      })

    res.redirect('/dashboard');
  }
  } catch (err) {
    console.error(err)
    return res.render('error/500');
  }
})

// @desc Delete Quote
// @route DELETE /quotes/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Quote.remove({ _id: req.params.id })
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err)
    return res.render('error/500');
  }
})

// @desc User Stories
// @route GET /quotes/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const quotes = await Quote.find({
      user: req.params.userId,
      status: 'public'
    })
      .populate('user')
      .lean()

    res.render('quotes/index', {
      quotes
    })
  } catch (err) {
    console.error(err)
    return res.render('error/500');
  }
})

module.exports = router