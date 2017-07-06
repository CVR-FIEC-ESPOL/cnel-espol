var db = require('../model/model.js');

exports.get_user = function (req,res){
	var user_id = req.params.user_id; 
	var connection = req.connection;

	db.select_user(connection,user_id).then(function(rows){
		if(rows!=null){
			res.json({ is_user : true});
		}else{
		  	res.json({ is_user : false});
		}
	},function(err){
		console.log("User " + user_id + " does not have account in this APP ");
		res.status(404);
		res.end();
	})
	.catch(function(err){
		console.log("User " + user_id + " does not have account in this APP ");
		res.status(404);
		res.end();
	});
}

exports.get_users = function(req,res){
	var connection = req.connection;
	db.select_users(connection).then(function(users){
		res.json({ users: users });
	});
}