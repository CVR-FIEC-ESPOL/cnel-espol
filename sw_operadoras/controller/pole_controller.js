var util = require('../util.js')
var request = require('request');
var Promise = require('promise');

exports.get_pole_by_objectid = function(req,res){
	var id = req.params.id;	
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

}

exports.get_poles_of_user = function(req,res){
	console.log("/get_poles_of_user");
	var user_id = req.session.user;
	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "GET";
	var options = {
		uri:  "http://127.0.0.1:8020/postes_extras/" + user_id ,
		method: method,
		headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
	};

	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    if(typeof body != 'undefined' && body!=null){
	      var result = JSON.parse(body);
	      console.log(result);
	      res.json({ 'poles' : result});
	    }else{
	      console.log(error);
	      res.json({});
	    }
	  }else{
	    console.log(error);
	    res.json({});
	  }
  });
}



exports.get_poles = function(req,res){
	var boundingbox = req.query['bounding_box'];
	var end_point = "/bb/" + boundingbox['min_lat'] + "," + boundingbox['min_lng'] + "," + boundingbox['max_lat'] + "," + boundingbox['max_lng'];
	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "GET";

	if(req.session.user == null && req.session.password == null ){
		res.status(404);
		res.end();
		return;
	}

	var options = {
		uri:  "http://127.0.0.1:8020" + end_point ,
		method: method,
		headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if(typeof body != 'undefined' && body!=null){
				var result = JSON.parse(body);
				console.log(result.length);
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
}

exports.get_poles_with_tags = function(req,res){
  console.log("/get_poles_with_tags");

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
        if(typeof body != 'undefined' && body!=null){
          console.log(body);
          var result = JSON.parse(body);
          res.json({ 'locations' : result});
        }else{
          console.log(error);
          res.json({});
        }
      }else{
        console.log("error",error);
        res.json({});
      }
  });

}


