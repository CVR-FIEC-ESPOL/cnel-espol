var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var request = require('request');
var util = require('./util.js')
var Promise = require('promise');
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');
const querystring = require('querystring');
var routes = require('./router.js');
var swig = require('swig');

jsonfile.spaces = 4;

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

// Use connect method to connect to the Server 
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({secret: 'ssshhhhh'}));
app.use(express.static('./public'));

app.use('/selector_tags',function(req,res,next){
  if(req.session.user !=null && req.session.password != null ){
    next();
  }else{
    res.redirect('/');
  }
});

app.get('/', function (req, res) {
  if(req.session.user !=null && req.session.password != null ){
    res.redirect('/selector_tags');
  }else{
    res.sendfile('./public/login.html');
  }
});

app.get('/selector_tags', function (req, res) {
  console.log("selector de tags");
  var user = req.session.user;
  res.render('selector_tags.html',{ user : user });
});

app.get('/auth_fail', function (req, res) {
  res.send("No tiene cuenta en la aplicación!");
});

app.get('/close_session',function(req,res){
  console.log("cerrar sesion");
  req.session.user = null;
  req.session.password = null;
  res.sendfile('./public/login.html');
});

app.use('/',routes);

var server = app.listen(5050, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('CNEL Application listening at http://%s:%s', host, port);
});