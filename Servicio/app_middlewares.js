var db = require('./model/model.js');

exports.auth = function(req,res,next){
	db.auth(req).then(function(result){
		var user_id = result.user_id;
		req.connection = result.connection;
		req.user_id = user_id;
    if (user_id != null) {
    	console.log("Usuario autenticado " , user_id);
    	next();
    } else {
    	console.error('Authentication failed!');
    	res.status(404);
    	res.end();
    	next();
    }
  },function(err){
    console.log(err);
  }).catch(function(err){
  	console.log(err);
  	res.status(400);
  	res.end();
  });
}