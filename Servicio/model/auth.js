var oracledb = require('oracledb');
var Promise = require('promise');
var security_utils = require('../utils/security_utils');
var crypto = require('crypto');

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
		
		connection.execute("SELECT access_key FROM auth WHERE user_id = '" + user_id + "'",{ },{outFormat: oracledb.OBJECT},
			function(err,result){
				console.log("return callback");
				console.log(result);

				if(err){
					reject(err);
				}

				if(!result.rows || typeof result.rows == 'undefined'){
					reject(new Error('Not results'));
				}

				if(result.rows.length > 0){
					let access_key = result.rows[0].ACCESS_KEY;
					let key = new Buffer(access_key, "base64");
					let hmac = crypto.createHmac("sha256", key);
					let inputvalue = security_utils.build_canonicalized_string(req);
					hmac.update(inputvalue);
					let query_sig = hmac.digest("base64");	
					if(req_sig === query_sig){
						resolve(user_id);
					}else{
						reject(new Error('Usert not registered in database'));
					}
				}else{
					console.log("Usuario no registrado en la base");
					reject(new Error('Usuario no registrado en la base'));
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
