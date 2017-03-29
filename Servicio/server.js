var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var fs = require("fs");
var oracledb = require('oracledb');
var _ = require('underscore');
var q = require('q');

var bodyParser = require('body-parser');
var image_utils = require('./utils/image_utils')
var db = require('./model/model.js');
var Promhise = require('promise');

var routes=require('./router.js');
app.use(express.static('./public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/',routes);

app.get("/",function(req,res){
  res.send("CNEL API Rest");
})

var server = app.listen(8020, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("CNEL service listening at http://%s:%s", host, port)
})
