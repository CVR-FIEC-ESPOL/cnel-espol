var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var fs = require("fs");
var oracledb = require('oracledb');
var _ = require('underscore');
var q = require('q');

var bodyParser = require('body-parser');
var image_utils = require('./image_utils')
var db = require('./model');

var Promise = require('promise');


// Use connect method to connect to the Server 
app.use(express.static('./public'));

app.use(function(req,res,next){
	//middleware para autenticar el cliente que realiza la peticion
	db.auth(req).then(function(user_id){
		if (user_id != null) {
			console.log("Usuario autenticado");
	       	next();
	    } else {
	    	console.error('Authentication failed!, ' + user_id);
	        res.status(404);
	        res.end();
	    }
	})
	.catch(function(err){
		console.error('Authentication failed!');
		res.status(404);
		res.end();
	})
});

app.get('/get_user/:user_id',function(req,res){
	var user_id = req.params.user_id;	
	db.get_user(user_id)
	.then(function(rows){
		console.log(rows);
		if(rows.length > 0){
			res.json({ is_user : true});
		}else{
			res.json({ is_user : false});
		}
	})
	.catch(function(err){
		console.log(err);
		res.end();
   	});
});

app.get('/tags/:objectid', function(req, res){
	var objectid = req.params.objectid;
	var sql_clause = "poste_objectid = " + objectid;
	db.get_pole(sql_clause).then(function(rows){
		var pole = rows[0];
   		var pole_id = pole.POSTE_ID;
   		db.get_tags(pole_id).then(function(tags){
   			console.log(tags);
   			res.json(tags);
   		})
   		.catch(function(err){
   			console.log(err);
			res.end();
   		});
   	})
	.catch(function(err){
		console.log(err);
		res.end();
	});
})


app.get('/poste/oid/:objectid', function(req, res){
	var objectid = req.params.objectid;
	var sql_clause = "poste_objectid = " + objectid;

	db.get_pole(sql_clause).then(function(pole){
   		res.json(pole);
   	})
   	.catch(function(err){
   		console.log("error");
   		console.log(err);
   		res.end();
   	});
})

app.get('/poste/codigo/:codigo', function(req, res){
	var codigo =  "'" + req.params.codigo  + "'";

	var sql_clause = "poste_codigo = " + codigo;
	
	console.log(sql_clause);

	db.get_pole(sql_clause).then(function(pole){
		res.json(pole);
	})
	.catch(function(err){
   		console.log(err);
   		res.end();
   	});
})

app.get('/bb/:lat1,:long1,:lat2,:long2', function(req, res){
	console.log(req.params);

	let wgs84_code = '32717';
    let gmap_latlon_code = '8307';
    var bounding_box = {
    	'lat1' : req.params.lat1,
    	'long1' : req.params.long1 ,
    	'lat2' : req.params.lat2,
    	'long2' : req.params.long2
    }
    db.get_poles(bounding_box,wgs84_code,gmap_latlon_code).then(function(poles){
    	res.json(poles)
    })
    .catch(function(err){
    	console.log(err);
   		res.end();
    });

});

var server = app.listen(8020, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("CNEL service listening at http://%s:%s", host, port)
})



/*endpoints no revisados: */
app.post('/poste/extras', function(req, res)
{
   let codigo = req.body.codigo;
   let objectid = req.body.objectid;
   let uuid = req.body.uuid;
   let ncables = req.body.ncables;

   console.log(`codigo: ${codigo}, objectid: ${objectid}, uuid: ${uuid}, ncables: ${ncables}`);
/*
   let promise =
      promiseWriteFile('POS', objectid, req.body.fotoposte, null).then(
         function(val)
         {
            return promiseWriteFile('CAB', objectid, req.body.fotocables, val);
         });
   promise.then(
      function(val)
      {
         console.log('eeexito... value: ' + val);
         res.end();
      },
      function(errobj)
      {
         if (errobj.prevsucc) {
            console.log('A borrar ' + errobj.prevsucc[0].fname);
            fs.unlinkSync(errobj.prevsucc[0].fname);
         }
         res.status(500);
         res.send(errobj.erro);
         res.end();
         console.error('errorcito.. value: ' + errobj.erro);
      });
 */
   res.end();
})


app.post('/poste/extras/foto', function(req, res){
	/*
   req.on('data', (chunk) => {
      console.log('chunk of ' + chunk.length + ' recibido');
   });
 	*/
  let matches = req.headers['content-disposition'].match(/.+filename[ ]*=[ ]*"(.+)"$/);
  let filename = matches[1];
  let downloadfile = fs.createWriteStream(filename);
  req.pipe(downloadfile);
  res.end();
})