var db = require('../model/model.js');
var fs = require('fs');
var json2csv = require('json2csv');
var fs = require('fs');
const uuid = require('uuid/v1');


exports.get_pole_by_objectid =  function(req, res){
  var objectid = req.params.objectid;
  var connection = req.connection;
  db.select_pole_by_objectid(connection,objectid).then(function(result){
    var pole = result.outBinds;  
    if(pole.poste_id == 'NA'){
      var pole = {}
      pole['n_cables'] = 0;
      pole['poste_path'] = "none";
      pole['equipo_path'] = "none";
      res.json(pole);
      return;
    }
    var poste_img = "pos_" + pole.poste_id + ".jpeg";
    var equipo_img = "cab_" + pole.poste_id + ".jpeg";

    var equipo_img_path = __dirname + "/img/" + equipo_img;
    var poste_img_path = __dirname + "/img/" + poste_img;

    if (fs.existsSync(poste_img_path)) {
      pole['poste_path'] = poste_img;
    }else{
      pole['poste_path'] = "none";
    }
    
    if (fs.existsSync(equipo_img_path)) {
      pole['equipo_path'] = equipo_img;
    }else{
      pole['equipo_path'] = "none";
    }

    res.json(pole);
  })
  .catch(function(err){
    console.log("error");
    console.log(err);
    res.end();
  });
}


exports.get_pole_by_codigo = function(req, res){
  var codigo =  "'" + req.params.codigo  + "'";

  var sql_clause = "poste_codigo = " + codigo;

  db.get_pole(sql_clause).then(function(pole){
    res.json(pole);
  })
  .catch(function(err){
    console.log(err);
    res.status(404);
    res.end();
  });
}

exports.get_poles_of_user = function(req,res){
  var user_id = req.params.user_id;
  var connection = req.connection;
  db.select_poles_of_user(connection,user_id).then(function(poles){
    console.log(poles);
    res.json(poles);
  });

}

exports.get_poles = function(req, res){
  var wgs84_code = 32717;
  var gmap_latlon_code = 8307;
  var bounding_box = {
    'lat1' : req.params.lat1,
    'long1' : req.params.long1 ,
    'lat2' : req.params.lat2,
    'long2' : req.params.long2
  }

  var connection = req.connection;
  console.log("get_poles");
  /*SELECT SRID,COORD_REF_SYS_NAME from SDO_COORD_REF_SYS;
  SELECT COORD_REF_SYS_NAME from SDO_COORD_REF_SYS WHERE SRID = 8307;*/

  db.select_poles(connection,bounding_box,wgs84_code,gmap_latlon_code)
  .then(function(poles){
    //var p = poles.slice(0,10000);
    /*var fields = ['LAT', 'LNG', 'OBSERVACIO','OBJECT_ID'];
    var csv = json2csv({ data: poles, fields: fields });

    fs.writeFile('file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    })*/
    console.log(poles.length);
    res.json(poles);
  },function(err){
    if(err){
      console.error(err.message);
      res.status(404);
      res.end();
    }
  });
}

exports.get_poles_with_tags = function(req, res){
  var wgs84_code = 32717;
  var gmap_latlon_code = 8307;
  var bounding_box = {
    'lat1' : req.params.lat1,
    'long1' : req.params.long1 ,
    'lat2' : req.params.lat2,
    'long2' : req.params.long2
  }

  var connection = req.connection;
  var user_id = req.user_id;
  console.log("get_poles_with_tags");

  db.select_poles_with_tags(connection,user_id,bounding_box,wgs84_code,gmap_latlon_code)
  .then(function(poles){
    
    res.json(poles);
  },function(err){
    if(err){
      console.error(err.message);
      res.status(404);
      res.end();
    }
  });

}


exports.save_pole = function(req, res){
  var poste = req.body;

  if (typeof poste['cables'] === 'string' || poste['cables'] instanceof String){
    poste['cables'] = JSON.parse(poste['cables']);
  }

  for(var i in poste['cables']){
    var cable = poste['cables'][i];
    if (typeof cable === 'string' || cable instanceof String){
      poste['cables'][i] = JSON.parse(cable);
    }
  }
  var poste_id = uuid(); //String(poste['uuid']);
  poste['uuid'] = poste_id;
  var cabequips = poste['cables'];
  var connection = req.connection;
  console.log(poste_id);

  db.save_pole(connection,poste).then(function(result){
    var op_code = result.outBinds.op_code;
    poste_id = result.outBinds.poste_id_out;
    switch (op_code){
      case 'OK': //no se habia registrado el poste antes
        console.log("Poste nuevo");

        if(cabequips.length <= 0){
          break;
        }

        db.save_cabequips(connection,cabequips,poste_id).then(function(results){
          console.log("Ingreso de tags: ");
          var tags_correct = [];
          var tags_repeated = [];
          var tags_fail = []

          for(var i in results){
            var op_code = results[i].outBinds.op_code;
            console.log(op_code);
            var tag = cabequips[i].tag_id;
            switch (op_code){
              case 'OK':
                tags_correct.push(tag);
                break;
              case 'FAIL':
                tags_fail.push(tag);
                break;
              case 'DATA_REPEATED':
                tags_repeated.push(tag);
                break;
            }
          }
          connection.commit();
          connection.close();
          var response = { poste_id : poste_id, tags_correct : tags_correct ,tags_fail : tags_fail, tags_repeated : tags_repeated };
          console.log(response);
          res.json(response);
          res.end();
        },function(err){
          console.log(err);
          connection.rollback();
          connection.close();
          res.status(404);
          res.end();
        });
        break;
      case 'POLE_NOT_EXISTS':
        console.log("Poste no existe");
        res.json({ pole:poste_id, status: op_code });
        break;
      case 'POLE_REPEATED':
        console.log("Poste repetido");
        //establece el uuid del poste
        var poste_id = result.outBinds.poste_id_out;
        poste['uuid'] = poste_id;// se establece el uuid del poste
        console.log("Intento de ingresar información repetida ",poste_id);
        db.update_pole(connection,poste,cabequips).then(function(result){
          var op_code = result.op_code;
          console.log(op_code);
          if(op_code == 'OK'){
            db.save_cabequips(connection,cabequips,poste_id).then(function(results){
              console.log("cabequips guardados");
              var tags_correct = [];
              var tags_repeated = [];
              var tags_fail = []

              for(var i in results){
                var op_code = results[i].outBinds.op_code;
                console.log(op_code);
                var tag = cabequips[i].tag_id;
                switch (op_code){
                  case 'OK':
                    tags_correct.push(tag);
                    break;
                  case 'FAIL':
                    tags_fail.push(tag);
                    break;
                  case 'DATA_REPEATED':
                    tags_repeated.push(tag);
                    break;
                }
              }

              connection.commit();
              connection.close();
              var response = { poste_id : poste_id, tags_correct : tags_correct ,tags_fail : tags_fail, tags_repeated : tags_repeated };
              console.log(response);
              res.json(response);
              res.end();
              
            },function(err){
              connection.rollback();
              connection.close();
              console.log(err);
              res.status(500);
              res.end();
            });
          }else{
            connection.rollback();
            connection.close();
            console.log(err);
            res.status(500);
            res.end();
          }
        },function(err){
          connection.rollback();
          connection.close();
          console.log(err);
          res.status(500);
          res.end();
        });
        break;
    }
  }, function(err){
    if (err) {
      console.log(err);
      connection.rollback();
      connection.close();
      res.status(500);
      res.end();
    } 
  });

}

exports.save_photo = function(req, res){
  var matches = req.headers['content-disposition'].match(/.+filename[ ]*=[ ]*"(.+)"$/);
  var filename = matches[1];
  var dir = __dirname +  "/img/" +  filename;
  console.log(dir);
  db.save_photo(req,res,dir);
}


exports.get_postes_extras = function(req,res){
  var connection = req.connection;
  db.select_pole_extras(connection).then(function(pole_extras){
    res.json(pole_extras);
  },function(err){
    res.status(404);
    res.end();
  });
}


exports.get_all_poles = function(req,res){
  var connection = req.connection;
  db.select_all_poles(connection).then(function(poles){
    res.json({postes: poles});
  },function(err){
    res.status(404);
    res.end();
  });
}

exports.get_new_poles = function(req,res){
  var connection = req.connection;
  console.log("sincronize poles");
  db.select_new_poles(connection).then(function(new_poles){
    db.select_erased_poles(connection).then(function(erased_poles){
      for(var i in new_poles){
        new_poles[i]['new'] = 1;
      }
      for(var i in erased_poles){
        erased_poles[i]['new'] = 0;
      }
      var poles = new_poles.concat(erased_poles);
      if(poles.length > 0){
        res.json({ postes: poles });
      }else{
        res.status(404);
        res.end();
      }
    },function(err){
      res.status(404);
      res.end();
    })
  },function(err){
    res.status(404);
    res.end();
  })
}
