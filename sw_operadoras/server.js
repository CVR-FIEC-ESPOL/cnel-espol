var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var request = require('request');
var util = require('./util.js')
var Promise = require('promise');
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');

jsonfile.spaces = 4;

// Use connect method to connect to the Server 
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({secret: 'ssshhhhh'}));
app.use(express.static('./public'));
//app.use(express.static('public', {index: 'login.html'}))
//app.use(express.static('./public/img'));
//app.use(express.static(__dirname + '/public'));

/*
app.use('/selector_tags',function(req,res,next){
  if(req.session.user){
    res.sendfile('./public/selector_tags.html');
  }else{
    res.redirect('/');
  }
});


app.use('/',function(req,res,next){
  if(req.session.user){
    res.sendfile('./public/selector_tags.html');
    return;
  }
  next();
});*/

app.get('/', function (req, res) {
  console.log("login");
  res.sendfile('./public/login.html');
});

app.get('/selector_tags', function (req, res) {
  console.log("selector de tags");
  res.sendfile('./public/selector_tags.html');
});

app.get('/auth_fail', function (req, res) {
  res.send("No tiene cuenta en la aplicación!");
});

function do_realease(res,result_code){
  res.status(result_code);
  res.end();
}

app.post('/login',function(req,res){
  if(!req.body){
    do_realease(res,404)
  }
  var user = req.body.username;
  var password = req.body.password;

  if(!user && !password){
    do_realease(res,404);
  }

  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";

  var options = {
    uri: 'http://127.0.0.1:8020/get_user/' + user,
    method: method,
    json: true,
    headers: {'Authorization': 'SharedKey ' + user + ':'  + util.build_signature(method,d,password),'Date': d}
  };

  console.log(options.headers);

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if(!body || typeof body == 'undefined'){
        res.redirect('/auth_fail');
      }else{
        var is_user = body.is_user; 
        if (typeof is_user != 'undefined' && is_user != null){
          if(is_user){
            req.session.user = user;
            req.session.password = password;
            console.log("session ",req.session.user);
            res.redirect('/selector_tags');
          }else{
            res.redirect('/auth_fail');
          }
        }else{
          res.redirect('/auth_fail');
        }
      }
    }else{
      res.redirect('/auth_fail');
    }
  });

});

app.get('/get_pole/:id',function(req,res){
	var id = req.params.id;	
  //97613
	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "GET";
	var options = {
    uri: 'http://127.0.0.1:8020/poste/oid/' + id,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user + ':' + util.build_signature(method, d,req.session.password),'Date': d}
	};

  request(options, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		console.log(body) // Show the HTML for the Google homepage.
    		res.json(body);
  		}else{
        console.log(error);
        res.json({});
      }
	});

});

//{7B28EF9808-A009-4529-87CE-0C51D0848B38}

app.get('/get_pole_by_code/:codigo',function(req,res){
  var code = req.params.codigo;

  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  
  var method = "GET";
  
  var options = {
    uri: 'http://127.0.0.1:8020/poste/codigo/' +  code,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
        res.json(body);
      }else{
        console.log(error);
        res.json({});
      }
  });

});

app.get("/get_tags/:object_id",function(req,res){
  var object_id =  req.params.object_id;
  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    uri: 'http://127.0.0.1:8020/tags/' +  object_id,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
      res.json(body);
    }else{
      console.log(error);
      res.json({});
    }
  });

});


app.get("/get_tags_from_poles/",function(req,res){
	//var id_poles = req.query['poles'];
  var object_id_poles = [104552,97613];

  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

	var get_pole = function(object_id){
		return new Promise(function(resolve,reject){
      options.uri = "http://127.0.0.1:8020/tags/" + object_id;
			request(options,function(error,response,body){
				if (error) reject(error);
    		else resolve(body);
			});
    })
	}

	var promises = []

	for (var i in object_id_poles){
		promises.push(get_pole(object_id_poles[i]));
	}

	Promise.all(promises).then(function(poles_tags){

		if(poles_tags.length<0){
			res.json({});
		}

		var tags = {};
		
    for(var i in poles_tags){
      var object_id = object_id_poles[i];
      tags[object_id] = JSON.parse(poles_tags[i]);
    }

		console.log("ha terminado");
  	res.json({poles:tags});
  },
  function(err){
  	console.log(err);
  });
})

app.get('/get_poles',function(req,res){
  console.log("/get_poles");
  //req.session.user = "rodrigo";
  //req.session.password = "castro";

	var boundingbox = req.query['bounding_box'];
	var end_point = "/bb/" + boundingbox['min_lat'] + "," + boundingbox['min_lng'] + "," + boundingbox['max_lat'] + "," + boundingbox['max_lng'];

  console.log(end_point);

	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    uri:  "http://127.0.0.1:8020" + end_point ,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

	request(options, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
        if(typeof body != 'undefined' && body!=null){
          var result = JSON.parse(body);
          res.json({ 'locations' : result});
        }else{
          console.log(error);
          res.json({});
        }
  		}else{
  			console.log(error);
  			res.json({});
  		}
	});
});

app.get('/get_poles_with_tags',function(req,res){
  var boundingbox = req.query['bounding_box'];
  var end_point = "/bb_with_tags/" + boundingbox['min_lat'] + "," + boundingbox['min_lng'] + "," + boundingbox['max_lat'] + "," + boundingbox['max_lng'];

  console.log(end_point);

  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    uri:  "http://127.0.0.1:8020" + end_point ,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        res.json({ 'locations' : result});
      }else{
        console.log(error);
        res.json({});
      }
  });
});

var server = app.listen(5050, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('CNEL Application listening at http://%s:%s', host, port);
});