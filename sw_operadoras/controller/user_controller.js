var util = require('../util.js')
var request = require('request');
var Promise = require('promise');

exports.login = function(req,res){
	var user = req.body.username;
  	var password = req.body.password;

	if(!user && !password){
		res.status(404);
		res.end();
	}
	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "GET";

	var options = {
		uri: 'http://127.0.0.1:8020/user/' + user,
		method: method,
		json: true,
		headers: { 'Authorization': 'SharedKey ' + user + ':'  + util.build_signature(method,d,password), 'Date': d }
	};
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
						console.log("usuario autenticado ",req.session.user);
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
}