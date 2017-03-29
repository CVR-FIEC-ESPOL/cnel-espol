var db = require('../model/model.js');

exports.get_user = function (req,res){
	var user_id = req.params.user_id; 
	var connection = req.connection;
	db.select_user(connection,user_id).then(function(rows){
		if(rows!=null){
			console.log("rows: ",rows);
			res.json({ is_user : true});
		}else{
		  	res.json({ is_user : false});
		}
	})
	.catch(function(err){
		console.log(err);
		res.end();
	});
}

exports.get_users = function(req,res){
	var connection = req.connection;
	db.select_users(connection).then(function(users){
		res.json({ users: users });
	});
}