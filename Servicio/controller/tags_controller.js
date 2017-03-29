var db = require('../model/model.js');

exports.save_tags = function(req,res){
  console.log("save_tags ",req.body);
  var user_id = req.user_id;
  var object_id = parseInt(req.body.object_id);
  var tag = req.body.tag;
  var checked = JSON.parse(req.body.checked);

  console.log("get tags ",tag);
  console.log("user id ",user_id);
  console.log("checked ",checked);

  var connection = req.connection;

  db.select_pole_by_objectid(connection,object_id).then(function(result){
    if(!result || typeof result == 'undefined'){
      res.status(500);
      res.end();
      return
    }

    var pole_id = result.outBinds.poste_id;
    if(!pole_id || typeof pole_id == 'undefined'){
      res.status(500);
      res.end();
      return;
    }
    
    if(!checked){
      user_id = 'null';
    }

    db.update_tag(connection,user_id,pole_id,tag).then(function(result){
      console.log(result);
      res.status(200);
      res.end();
    },function(err){
      console.log(err);
    });

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
      db.select_tags(connection,user_id,pole_id).then(function(tags){
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