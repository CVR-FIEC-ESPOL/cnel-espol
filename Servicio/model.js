var oracledb = require('oracledb');
var Promise = require('promise');
var security_utils = require('./security_utils');
var crypto = require('crypto');

var oracle_config = {
  user          : "system",
  password      : "2487",
  connectString : "localhost/XE"
}


var connection_promise = oracledb.getConnection(oracle_config);

function execute_query(sql_sentence){
	return connection_promise.then(function(connection){
		var query_promise = new Promise(function(resolve,reject){
			connection.execute(sql_sentence,{},{outFormat: oracledb.OBJECT},function(err,result){
				if (err) {
					reject(err);
					return;
				}
				resolve(result.rows);
			})
			connection.close();
		});
		return query_promise;
	})
	.catch(function(err){
		console.log(err);
		return null;
	});
}

exports.onConnect = function(){
   	return connection_promise;
}

exports.auth = function(req){
	return connection_promise
	.then(function(connection){
		var query_promise = new Promise(function(resolve,reject){
			var auth = req.headers['authorization'];
			let matches = auth.match(/^SharedKey ([A-Za-z0-9]+):(.+)$/);
			let user_id = matches[1];
			let req_sig = matches[2];
			
			connection.execute("SELECT access_key FROM auth WHERE user_id = '" + user_id + "'",{ },{outFormat: oracledb.OBJECT},
				function(err,result){
					if(result.rows.length > 0){
						let access_key = result.rows[0].ACCESS_KEY;
						let key = new Buffer(access_key, "base64");
						let hmac = crypto.createHmac("sha256", key);
						let inputvalue = security_utils.build_canonicalized_string(req);
						hmac.update(inputvalue);
						let query_sig = hmac.digest("base64");
						if(err){
							reject(err);
						}
						if(req_sig == query_sig){
							resolve(user_id);
						}else{
							resolve(new Error('ko'));
						}
					}else{
						console.log("Usuario no registrado en la base");
						reject(new Error('Usuario no registrado en la base'));
					}
			});

			connection.close();
		});
		return query_promise;
	})
	.catch(function(err){
		console.log(err);
		return null;
	});

}

exports.get_user = function(user_id){
	var sql_sentence = "SELECT access_key FROM auth WHERE user_id = '" + user_id + "'";
	return execute_query(sql_sentence);
}

exports.get_pole = function(sql_clause){
	var sql_sentence = "SELECT poste_codigo, poste_objectid, poste_id FROM poste_extras WHERE " + sql_clause;
	return execute_query(sql_sentence);
} 	

exports.get_tags = function(pole_id){
	var sql_sentence = "SELECT tag, rfid, operadora_id FROM cabequip WHERE poste_id = '" + pole_id + "'";
	return execute_query(sql_sentence);
}

exports.get_poles = function(bounding_box, src_code, dst_code){
	var sql_sentence =   "SELECT v.sdp.sdo_point.y lat, v.sdp.sdo_point.x lng, "
			+ "       v.observacio, v.objectid object_id "
			+ "FROM "
			+ "   (SELECT sdo_cs.transform( "
			+ "              sdo_geometry(2001," + src_code + ", "
			+ "                           SDO_POINT_TYPE("
			+                                "p.coord_x, p.coord_y,"
			+ "                              NULL),"
			+ "                           null, null),"
			+ "              " + dst_code + ") sdp, "
			+ "           p.observacio, p.objectid "
			+ "    FROM postes p, "
			+ "         (select sdo_cs.transform( "
			+ "                    sdo_geometry(2001," + dst_code + ", "
			+ "                                 SDO_POINT_TYPE("
			+                                      bounding_box.long1 + ","
			+                                      bounding_box.lat1 + ","
			+ "                                    NULL),"
			+ "                                 null, null),"
			+ "                    " + src_code + ") as sdo from dual) t,"
			+ "         (select sdo_cs.transform( "
			+ "                    sdo_geometry(2001," + dst_code + ", "
			+ "                                 SDO_POINT_TYPE("
			+                                      bounding_box.long2 + ","
			+                                      bounding_box.lat2 + ","
			+ "                                    NULL),"
			+ "                                 null, null),"
			+ "                    " + src_code + ") as sdo from dual) u "
			+ "    WHERE p.coord_x between t.sdo.sdo_point.x"
			+ "                        and u.sdo.sdo_point.x"
			+ "      AND p.coord_y between t.sdo.sdo_point.y"
			+ "                        and u.sdo.sdo_point.y"
			+ "   ) v ";

	return execute_query(sql_sentence);
}