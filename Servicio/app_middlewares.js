var db = require('./model/model.js');

exports.auth = function(req,res,next){
	db.auth(req).then(function(result){
		if(result == null){
      		res.status(500);
      		res.end();
      		return;
    	}
		var user_id = result.user_id;
		req.connection = result.connection;
		req.user_id = user_id;
		if (user_id != null) {
			next();
		} else {
			console.log("User " + user_id + " has rejected for accessing to API ");
			res.status(404);
			res.end();
			next();
		}
  },function(err){
    res.status(400);
  	res.end();
  }).catch(function(err){
  	res.status(400);
  	res.end();
  });
}