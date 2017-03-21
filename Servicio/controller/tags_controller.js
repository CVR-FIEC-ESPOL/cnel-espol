var db = require('../model/model.js');

exports.get_tags = function(req, res){
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
}