var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var request = require('request');
var Promise = require('promise');

jsonfile.spaces = 4;

// Use connect method to connect to the Server 
app.use(express.static('./public'));
app.use(express.static('./public/img'));


app.get('/', function (req, res) {
	res.sendfile('index.html');
});

app.get('/get_pole/:id',function(req,res){
	var id = req.params.id;
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
	var end_point = "/bb/" + boundingbox['min_lat'] + "%" + boundingbox['min_lng'] + "%" + boundingbox['max_lat'] + "%" + boundingbox['max_lng'];
	request('http://localhost:6050' + end_point, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		res.json(JSON.parse(body));
  		}else{
  			res.json({});
  		}
	});
});

var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Heatmap Application listening at http://%s:%s', host, port);
});

