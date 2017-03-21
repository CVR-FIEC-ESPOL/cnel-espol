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


function execute_store_procedure(sql_sentence,bind_params){
	return connection_promise.then(function(connection){
		var query_promise = new Promise(function(resolve,reject){
			connection.execute(sql_sentence,bind_params,function(err,result){
				if (err) {
					reject(new Error(err));
				}else{
					var cursor = result.outBinds.cursor;
					var metadata = result.outBinds.cursor.metaData;
					if(cursor!=null && typeof cursor!= 'undefined'){
						var numRows = 1000;
						var pagination_callback = function(poles){
							cursor.getRows(numRows,function(err,rows){
								if (err) {
									reject(err);
									return;
								} else if (rows.length === 0) {
									resolve(parse_pole(metadata,poles));
									return;
								}else if (rows.length > 0) {
									console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
									poles = poles.concat(rows);
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
	},function(err){
		console.log(err);
		return null;
	});
}

function save_cabequipo(connection,data,poste_id){
	var sql_sentence = "INSERT INTO cabequip VALUES (:TAG,:RFID,:POSTE_ID,:OPERADORA_ID,:TIPO,:CABLE_O_EQUIPO,:CAPACIDAD,:USO,:DIMENSIONES)";
	var values = {
		tag: data["tag_id"] ,
		rfid: data["rfid"] ,
		poste_id: "'" + poste_id + "'" ,
		operadora_id: 5 ,
		tipo: data["tipo"] ,
		capacidad: data["n_hilos"] ,
		uso: data["uso"] ,
		dimensiones: data['dimension']
	}
	
	console.log(data["es_cable"]);

	if(parseInt(data["es_cable"])){
		values['cable_o_equipo'] = 'CABLE';
	}
	
	if(parseInt(data["es_cable"]) == 2){
		values['cable_o_equipo'] = 'EQUIPO';
	}

	console.log(values);
	return connection.execute(sql_sentence,values);
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

exports.save_pole = function(pole){
	var sql_sentence = "INSERT INTO poste_extras VALUES (:poste_id, :poste_objectid, :poste_codigo, :ncables, :coord_x, :coord_y, :mangas_count, :cajas_dispersion_count, :taps_count)";
	
	var cabequips = pole['cables'];

	return connection_promise.then(function(connection){	
		var poste_id = pole['uuid'];

		var values = {
			poste_id : "'" + pole['uuid'] + "'",
			poste_objectid : parseInt(pole['object_id']),
			poste_codigo : "'" + pole['codigo_poste'] + "'",
			ncables : parseInt(pole['ncables']),
			coord_x : parseFloat(pole['x']),
			coord_y : parseFloat(pole['y']),
			mangas_count : parseInt(pole['nmangas']),
			cajas_dispersion_count :parseInt(pole['ncdd']),
			taps_count : parseInt(pole['ntaps'])
		}

		connection.execute(sql_sentence,values)
		.then(function(result){
			console.log("Rows inserted: " + result.rowsAffected);  // 1
			if(cabequips.length > 0){
				save_cabequips(connection,cabequips,poste_id);
			}
			return ;
		})
		.catch(function(err){
			if (err) {
				console.log(err);
				connection.rollback();
				connection.close();
				return ;
			} 
		})
	})
}


exports.get_pole = function(sql_clause){
	var sql_sentence = "SELECT poste_codigo, poste_objectid, poste_id FROM poste_extras WHERE " + sql_clause;
	return execute_query(sql_sentence);
} 	

exports.get_tags = function(pole_id){
	var sql_sentence = "SELECT tag, rfid, operadora_id FROM cabequip WHERE poste_id = '" + pole_id + "'";
	return execute_query(sql_sentence);
}


exports.save_photo = function(req,res,filename){
	let downloadfile = fs.createWriteStream(filename);
	req.pipe(downloadfile);
	res.end();
}

exports.get_user = function(user_id){
	sql_sentence = "BEGIN select_user(:user_id,:access_key); END;"

	var bind_params = {
		user_id: user_id,
		access_key: { type: oracledb.STRING, dir : oracledb.BIND_OUT}
	}

	return connection_promise.then(function(connection){
		var query_promise = new Promise(function(resolve,reject){
			connection.execute(sql_sentence,bind_params,function(err,result){
				if (err) {
					reject(new Error(err));
				}else{
					console.log(result);
					resolve(result.outBinds);
				}
			})
		});
		return query_promise;
	},function(err){
		reject(new Error(err));
	});
}


exports.select_poles_with_tags = function(bounding_box, src_code, dst_code){
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

	return execute_store_procedure(sql_sentence,bind_params);
}

exports.select_poles = function(bounding_box, src_code, dst_code){
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

	return execute_store_procedure(sql_sentence,bind_params);
}


exports.select_pole_extras = function(){
	var sql_sentence = "BEGIN select_pole_extras(:cursor); END;"
	var bind_params = {
		cursor: { type: oracledb.CURSOR, dir : oracledb.BIND_OUT }
	}
	return execute_store_procedure(sql_sentence,bind_params);
}