var oracledb = require('oracledb');
var Promise = require('promise');
var security_utils = require('../utils/security_utils');
var crypto = require('crypto');
var db = require('./model.js');

function on_fail(err){
	console.log(err);
	return null;
}

function on_connect(connection,req){
	var query_promise = new Promise(function(resolve,reject){
		var auth = req.headers['authorization'];
		
		if(!auth){
			reject(new Error('Autorization field is empty'));
		}

		let matches = auth.match(/^SharedKey ([A-Za-z0-9]+):(.+)$/);
		let user_id = matches[1];
		let req_sig = matches[2];

		if(!user_id && !req_sig){
			reject(new Error('Auth Tokens Corrupted'));
		}
		
		db.select_user(connection,user_id).then(function(user){
			var access_key = user.access_key;
			let key = new Buffer(access_key, "base64");
			let hmac = crypto.createHmac("sha256", key);
			let inputvalue = security_utils.build_canonicalized_string(req);
			hmac.update(inputvalue);
			let query_sig = hmac.digest("base64");
			if(req_sig === query_sig){
				//console.log("user_id: ",user_id);
				var data = {
					connection : connection,
					user_id : user_id
				}
				resolve(data);
			}else{
				reject(new Error('User not registered in database'));
			}
		});
	});
	return query_promise;
}

exports.authenticate = function(connection_promise,req){
	return connection_promise.then(function(connection){ 
		return on_connect(connection,req);
	}, on_fail);
}
