var db = require('../model/model.js');

exports.get_user = function (req,res){
	var user_id = req.params.user_id; 
	
	db.get_user(user_id).then(function(rows){
		if(rows!=null){
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