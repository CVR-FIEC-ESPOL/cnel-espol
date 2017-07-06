var db = require('../model/model.js');
const uuid = require('uuid/v1');

var getRandomArbitrary = function (min, max) {
  return Math.random() * (max - min) + min;
}

var create_uuid_code = function (){
  return "new_pole_" + getRandomArbitrary(0,100000000);
}

var create_false_pole  = function(connection,user_id,object_id,res){
  console.log("Crear falso poste");
  var pole_id = uuid();
  var tag = '0';
  //Crear el poste false
  db.save_false_pole(connection,pole_id,object_id).then(function(result){
    console.log(result);
    if(result.outBinds.op_code =='OK'){
      console.log("Se ha creado un falso poste con id ",pole_id);
      //Crear el tag virtual
      db.update_tag(connection,user_id,pole_id,tag).then(function(result){
        if(result.outBinds.op_code == 'OK'){
          connection.commit();
          connection.close();
          res.status(200);
          res.end();
        }else{
          connection.rollback();
          connection.close();
          res.status(500);
          res.end();
        }
      },function(err){
        console.log(err);
        res.status(500);
        res.end();
      });
    }
  },function(err){
    console.log(err);
    res.status(500);
    res.end();
  });

}

var delete_virtual_tag = function(connection,user_id,pole_id,tag_id,res){
  db.remove_virtual_tag(connection,user_id,pole_id,tag_id).then(function(result){
    console.log(result);
    var op_code = result.outBinds.op_code;
    if(op_code == 'OK'){
      res.status(200);
      res.end();
    }else{
      connection.rollback();
      connection.close();
      res.status(500);
      res.end()
    }
  },function(err){
    console.log(err);
    res.status(500);
    res.end()
  });
}


exports.get_tags = function(req, res){
  var objectid = req.params.objectid;
  
  var connection = req.connection;
  var user_id = req.user_id;
  console.log("tag_id : ",objectid);
  console.log("user_id: ",user_id);
  
  db.select_pole_by_objectid(connection,objectid).then(function(result){
    var pole = result.outBinds;
    var pole_id = String(pole.poste_id);
    if(pole_id!="-1"){
      console.log("preguntando por tags");
      db.select_tags(connection,user_id,pole_id).then(function(tags){
        console.log("tags",tags);

        if(!tags || typeof tags == 'undefined'){
          res.status(400);
          res.end();
          return;
        }
        res.json(tags);
      },function(err){
        console.log(err);
        res.json({});
      },function(err){
        console.log(err);
        res.status(400);
        res.end();
      });
    }else{
      res.json({});
    }

  },function(err){
      console.log(err)
      res.json({});
    }
  );
}

exports.save_tag_auto = function(req,res){
  var object_id = parseInt(req.body.object_id);
  console.log("save_tag_auto",object_id);
  var connection = req.connection;
  var user_id = req.user_id;
  db.select_pole_by_objectid(connection,object_id).then(function(result){
    var pole_id = result.outBinds.poste_id;
    console.log("pole_id ", pole_id);
    if(pole_id == "NA"){
      create_false_pole(connection,user_id,object_id,res);
    }else{
      console.log("Auto tag");
      db.save_pole_auto(connection,pole_id,user_id).then(function(result){
        var op_code = result.outBinds.op_code;
        if(op_code == 'OK'){
          res.status(200);
          res.end();
        }else{
          res.status(500);
          res.end();
        }
      },function(err){
        console.log(err);
      });
    }
  },function(err){
    connection.rollback();
    connection.close();
  });
}


module.exports.save_tags = function(req,res){
  var connection = req.connection;
  var user_id = req.user_id;
  var object_id = parseInt(req.body.object_id);
  var tag = req.body.tag;
  var checked = JSON.parse(req.body.checked);

  console.log("get tags ",tag);
  console.log("user id ",user_id);
  console.log("checked ",checked);

  db.select_pole_by_objectid(connection,object_id).then(function(result){
    if(!result || typeof result == 'undefined' || !result.outBinds || typeof result.outBinds == 'undefined' ){
      res.status(500);
      res.end();
      return
    }
    var pole_id = result.outBinds.poste_id;
    
    if (tag == '0' && !checked){
      res.status(200);
      res.end();
      return;
    }

    if(pole_id == "NA"){//no se han registrado tags en ese poste aún
      create_false_pole(connection,user_id,object_id,res);
      return;
    }
   
    if (tag.indexOf("SN") != -1 && !checked){//si es un tag virtual y se ha desmarcado de la interfaz, debe borrarse
      console.log("Removiendo tag VIRTUAL",tag);
      delete_virtual_tag(connection,user_id,pole_id,tag,res)
      return;
    }

    if(!checked){//si el tag esta desmarcado en la interfaz, se debe asignar la operadora 'NA' al tag
      user_id = 'null';
    }


    //para tags físicos
    db.update_tag(connection,user_id,pole_id,tag).then(function(result){
      var op_code = result.outBinds.op_code;
      if(op_code == 'OK'){
        res.status(200);
        res.end();
      }else{
        res.status(500);
        res.end();
      }
    },function(err){
      res.status(500);
      res.end();
      console.log(err);
    });

  });
}


exports.get_tags_by_id = function(req,res){
  var object_id =  req.params.object_id;
  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    uri: 'http://127.0.0.1:8020/tags/' +  object_id,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };
  
  console.log("get_tags",object_id);

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
      res.json(body);
    }else{
      console.log(error);
      res.json({});
    }
  });
}