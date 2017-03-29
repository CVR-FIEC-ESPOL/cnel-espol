var oracledb = require('oracledb');
var Promise = require('promise');
var security_utils = require('../utils/security_utils');
var crypto = require('crypto');
var fs = require("fs");
var app_auth = require('./auth.js')

var oracle_config = {
  user          : "system",
  password      : "2487",
  connectString : "localhost/XE"
}

var connection_promise = oracledb.getConnection(oracle_config);

exports.on_connect = function(){
   	return connection_promise;
}

exports.auth = function(request){
	return app_auth.authenticate(connection_promise,request);
}

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

function parse_pole(metadata,rows){
	var pole_parsed = [];
	for(var i in rows){
		var pole = {}
		for(var j in rows[i]){
			pole[metadata[j].name] = rows[i][j];
		}
		pole_parsed.push(pole);
	}
	return pole_parsed
}


function execute_store_procedure(connection,sql_sentence,bind_params,num_rows){	
	var query_promise = new Promise(function(resolve,reject){
		connection.execute(sql_sentence,bind_params,function(err,result){
			if (err) {
				reject(new Error(err));
			}else{
				var cursor = result.outBinds.cursor;
				var metadata = result.outBinds.cursor.metaData;
				
				if(cursor!=null && typeof cursor!= 'undefined'){
					console.log("metadata: ",metadata);
					var pagination_callback = function(poles){
						cursor.getRows(num_rows,function(err,rows){
							if (err) {
								reject(err);
								return;
							} else if (rows.length === 0) {
								resolve(parse_pole(metadata,poles));
								return;
							}else if (rows.length > 0) {
								console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
								poles = poles.concat(rows);
								if(rows.length < num_rows){
									resolve(parse_pole(metadata,poles));
									return
								}
								pagination_callback(poles);
							}
						});
					}
					pagination_callback([]);

				}else{
					reject(new Error(err));
				}
			}
		})
	});
	return query_promise;
}

/*users*/
exports.select_user = function(connection,user_id){
	sql_sentence = "BEGIN select_user(:user_id,:access_key); END;"

	var bind_params = {
		user_id: String(user_id),
		access_key: { type: oracledb.STRING, dir : oracledb.BIND_OUT}
	}
	
	var query_promise = new Promise(function(resolve,reject){
		connection.execute(sql_sentence,bind_params,function(err,result){
			if (err) {
				reject(new Error(err));
			}else{
				resolve(result.outBinds);
			}
		})
	});
	return query_promise;
}

exports.select_users = function(connection){
	var sql_sentence = "BEGIN select_users(:cursor); END;";
	var bind_params = {
		cursor:  { dir:oracledb.BIND_OUT, type: oracledb.CURSOR }
	}
	return execute_store_procedure(connection,sql_sentence,bind_params,1000);
}

/*users*/


/*tags*/

exports.select_tags = function(connection,user_id,pole_id){
	var sql_sentence = "BEGIN select_tags(:pole_id,:user_id,:cursor); END;";
	var bind_params = {
		pole_id : String(pole_id),
		user_id: String(user_id),
		cursor:  { dir:oracledb.BIND_OUT, type: oracledb.CURSOR }
	}
	console.log(bind_params);
	//sql_sentence = "SELECT TAG, OPERADORA_ID FROM cabequip WHERE OPERADORA_ID = -1 and poste_id =" + String(pole_id);
	//return execute_query(sql_sentence);
	return execute_store_procedure(connection,sql_sentence,bind_params,1000);
}

exports.update_tag = function(connection,user_id,poste_id,tag){
	var sql_sentence = "BEGIN update_tag(:user_id,:poste_id,:tag); END;";

	var bind_params = {
		user_id : String(user_id),
		poste_id : String(poste_id),
		tag : String(tag)
	}
	return connection.execute(sql_sentence,bind_params);
}


/*tags*/


/*poles*/

exports.get_pole = function(sql_clause){
	var sql_sentence = " " + sql_clause;
	return execute_query(sql_sentence);
} 

function save_cabequipo(connection,data,poste_id){
	var sql_sentence = "BEGIN insert_cabequip(:tag, :rfid, :poste_id, :operadora_id, :tipo, :cable_o_equipo, :capacidad, :uso, :dimensiones); END;"

	var bind_params = {
		tag: data["tag_id"] ,
		rfid: data["rfid"] ,
		poste_id: poste_id ,
		operadora_id: data["operadora"] ,
		tipo: data["tipo"] ,
		capacidad: data["n_hilos"] ,
		uso: data["uso"] ,
		dimensiones: data['dimension']
	}

	if(parseInt(data["es_cable"])){
		bind_params['cable_o_equipo'] = 'CABLE';
	}
	
	if(parseInt(data["es_cable"]) == 2){
		bind_params['cable_o_equipo'] = 'EQUIPO';
	}

	console.log(bind_params);

	return connection.execute(sql_sentence,bind_params);
}

function save_cabequips(connection,cabequips,poste_id){
	var tasks = [];

	for(var i in cabequips){
		task = save_cabequipo(connection,cabequips[i],poste_id);
		tasks.push(task);
	}
	
	Promise.all(tasks).then(function(results){
		//verify results;
		console.log("todo okey")
		connection.commit();
		connection.close();
	})
	.catch(function(err){
		console.log(err);
		connection.rollback();
		connection.close();
	});
}

exports.save_pole = function(connection,pole){
	var sql_sentence = "BEGIN insert_poste_extras(:poste_id, :poste_objectid, :poste_codigo, :ncables, :coord_x, :coord_y, :mangas_count, :cajas_dispersion_count, :taps_count); END;"
	var poste_id =  String(pole['uuid'])
	console.log(poste_id);

	var bind_params = {
		poste_id :  String(pole['uuid']),
		poste_objectid : parseInt(pole['object_id']),
		poste_codigo : String(pole['codigo_poste']),
		ncables : parseInt(pole['ncables']),
		coord_x : parseFloat(pole['x']),
		coord_y : parseFloat(pole['y']),
		mangas_count : parseInt(pole['nmangas']),
		cajas_dispersion_count :parseInt(pole['ncdd']),
		taps_count : parseInt(pole['ntaps'])
	}

	var cabequips = pole['cables'];

	connection.execute(sql_sentence,bind_params)
	.then(function(result){
		console.log("pole saved ",result.outBinds);
		if(cabequips.length > 0){
			save_cabequips(connection,cabequips,poste_id);
		}
		return ;
	},function(err){
		if (err) {
			console.log(err);
			connection.rollback();
			connection.close();
			return ;
		} 
	});
}

exports.save_photo = function(req,res,filename){
	let downloadfile = fs.createWriteStream(filename);
	req.pipe(downloadfile);
	res.end();
}

exports.select_pole_by_objectid = function(connection,object_id){
	var sql_sentence = "BEGIN select_pole_extras_by_objectid(:object_id,:poste_id,:poste_codigo); END;"
	var bind_params = {
		object_id: parseInt(object_id),
		poste_codigo: {dir:oracledb.BIND_OUT, type: oracledb.STRING},
		poste_id: {dir:oracledb.BIND_OUT, type: oracledb.STRING}
	}
	return connection.execute(sql_sentence,bind_params);
}



exports.select_poles_with_tags = function(connection,bounding_box, src_code, dst_code){
	bounding_box.long1 = -80.691759;
	bounding_box.lat1 = -3.004036;
	bounding_box.long2 = -78.928654;
	bounding_box.lat2 = -0.509060;
	var sql_sentence = "BEGIN select_poles_with_tags(:src_code,:dst_code,:sw_lng,:sw_lat,:ne_lng,:ne_lat,:cursor); END;"
	var bind_params = {
		src_code : src_code,
		dst_code: dst_code,
		sw_lng: parseFloat(bounding_box.long1),
		sw_lat: parseFloat(bounding_box.lat1),
		ne_lng: parseFloat(bounding_box.long2),
		ne_lat: parseFloat(bounding_box.lat2),
		cursor: { type: oracledb.CURSOR, dir : oracledb.BIND_OUT}
	}
	return execute_store_procedure(connection,sql_sentence,bind_params,1000);
}

exports.select_poles = function(connection,bounding_box, src_code, dst_code){
	var sql_sentence = "BEGIN select_poles(:src_code,:dst_code,:sw_lng,:sw_lat,:ne_lng,:ne_lat,:cursor); END;"
	var bind_params = {
		src_code : src_code,
		dst_code: dst_code,
		sw_lng: parseFloat(bounding_box.long1),
		sw_lat: parseFloat(bounding_box.lat1),
		ne_lng: parseFloat(bounding_box.long2),
		ne_lat: parseFloat(bounding_box.lat2),
		cursor: { type: oracledb.CURSOR, dir : oracledb.BIND_OUT}
	}
	return execute_store_procedure(connection,sql_sentence,bind_params,1000);
}


exports.select_pole_extras = function(connection){
	var sql_sentence = "BEGIN select_pole_extras(:cursor); END;"
	var bind_params = {
		cursor: { type: oracledb.CURSOR, dir : oracledb.BIND_OUT }
	}
	return execute_store_procedure(connection,sql_sentence,bind_params,1000);
}

exports.select_all_poles = function(connection){
	var sql_sentence = "BEGIN select_all_poles(:cursor); END;";
	var bind_params = {
		cursor: { type: oracledb.CURSOR, dir : oracledb.BIND_OUT }
	};
	return execute_store_procedure(connection,sql_sentence,bind_params,10000);
}


/*poles*/