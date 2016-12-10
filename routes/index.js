const express = require('express');
const router = express.Router();
const graphql = require('graphql')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
