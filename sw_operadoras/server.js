var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var request = require('request');
var crypto = require('crypto');
var Promise = require('promise');
var http = require('http');

jsonfile.spaces = 4;

// Use connect method to connect to the Server 
app.use(express.static('./public'));
app.use(express.static('./public/img'));


app.get('/', function (req, res) {
	res.sendfile('index.html');
});



app.get('/get_pole/:id',function(req,res){

	var id = req.params.id;
	
	/*var options = {
		url: 'http://localhost:8081/poste/oid/:' + id
	};*/
	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "GET";
	var options = {
   		host: '127.0.0.1',
   		port: '8081',
   		path: '/poste/oid/97613',
   		method: method,
   		headers: {'Authorization': 'SharedKey user1:' + build_signature(method, d),'Date': d}
	};

	/*http.request(options,function(err,response,body){
		console.log(err);
	})*/

	var r = http.request(options, function(res) {
	   console.log(res);
	});

	r.end();

	/*request('http://192.168.1.131:8081/' + id, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		console.log(body) // Show the HTML for the Google homepage.
    		res.json(body);
  		}
	});*/
});

app.get("/get_tags",function(req,res){
	var id_poles = req.query['poles'];


	var get_pole = function(id){
		return new Promise(function(resolve,reject){
			request('http://localhost:6050/get_pole/' + id ,function(error,response,body){
				if (error) reject(error);
    			else resolve(body);
			});
		})
	}

	var promises = []

	for (var i in id_poles){
		promises.push(get_pole(id_poles[i]));
	}

	Promise.all(promises).then(function(poles_tags){
		if(poles_tags.length<0){
			poles_tags.json({});
		}
		var poles = []
		for(var i in poles_tags){
			poles.push(JSON.parse(poles_tags[i]));
		}
		console.log("ha terminado");
  		res.json({poles:poles});
  	},function(err){
  		console.log(err);
  	})
})

app.get('/get_poles',function(req,res){
	var boundingbox = req.query['bounding_box'];
	//var end_point = "/bb/" + boundingbox['min_lat'] + "%," + boundingbox['min_lng'] + "%," + boundingbox['max_lat'] + "%," + boundingbox['max_lng'];
	var end_point = "/bb/" + boundingbox['min_lat'] + "," + boundingbox['min_lng'] + "," + boundingbox['max_lat'] + "," + boundingbox['max_lng'];
	//var end_point = "/bb/" + boundingbox['max_lat'] + "," + boundingbox['max_lng'] + "," + boundingbox['min_lat'] + "," + boundingbox['min_lng'];

	var options = {
		url: 'http://localhost:8081' + end_point
	};

	request(options, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			var result = JSON.parse(body);
  			console.log(result);
    		res.json({ 'locations' : result});
  		}else{
  			console.log(error);
  			res.json({});
  		}
	});
});

var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Heatmap Application listening at http://%s:%s', host, port);
});


function build_signature(method, d)
{
   let access_key = 'elpassword';
   let req = {'method': method, 'headers': {'date': d}};
   let key = new Buffer(access_key, "base64");
   let hmac = crypto.createHmac("sha256", key);
   let inputvalue = build_canonicalized_string(req)
   hmac.update(inputvalue);
   let sig = hmac.digest("base64");
   console.log('sig en client es: "' + sig + '"');
   return sig;
}

function build_canonicalized_string(
             request, encoding, language, length,
             md5, content_type, if_mod_since, if_match,
             if_none_match, if_unmod_since, range)
{
   let cm_date = request.headers['date'];

   return request.method + "\n"
    + (encoding || '') + "\n"             /*Content-Encoding*/
    + (language || '') + "\n"             /*Content-Language*/
    + (length || '') + "\n"                 /*Content-Length*/
    + (md5 || '') + "\n"                       /*Content-MD5*/
    + (content_type || '') + "\n"     /*Content-Type*/
    + (cm_date || '') + "\n"               /*Date*/
    + (if_mod_since || '') + "\n"     /*If-Modified-Since*/
    + (if_match || '') + "\n"             /*If-Match*/
    + (if_none_match || '') + "\n"   /*If-None-Match*/
    + (if_unmod_since || '') + "\n" /*If-Unmodified-Since*/
    + (range || '') + "\n";                  /*Range*/
}