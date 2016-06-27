var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '2do2go' });
});

router.get('/child', function(req, res, next) {
  res.render('child', { title: '2do2go-child' });
});

module.exports = router;
