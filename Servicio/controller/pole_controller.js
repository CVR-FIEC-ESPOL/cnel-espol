var db = require('../model/model.js');

exports.get_pole_by_objectid =  function(req, res){
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

exports.get_poles = function(req, res){
  let wgs84_code = 32717;
  let gmap_latlon_code = 8307;
  var bounding_box = {
    'lat1' : req.params.lat1,
    'long1' : req.params.long1 ,
    'lat2' : req.params.lat2,
    'long2' : req.params.long2
  }

  db.select_poles(bounding_box,wgs84_code,gmap_latlon_code)
  .then(function(poles){
    rows = []
    console.log(poles);
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
  console.log(req.params);
  let wgs84_code = 32717;
  let gmap_latlon_code = 8307;
  var bounding_box = {
    'lat1' : req.params.lat1,
    'long1' : req.params.long1 ,
    'lat2' : req.params.lat2,
    'long2' : req.params.long2
  }

  db.select_poles_with_tags(bounding_box,wgs84_code,gmap_latlon_code)
  .then(function(poles){
    rows = []
    console.log(poles);
    res.end();
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
  poste['cables'] = JSON.parse(poste['cables']);

  for(var i in poste['cables']){
    poste['cables'][i] = JSON.parse(poste['cables'][i]);
  }

  console.log(poste);
  
  db.save_pole(poste)
  .then(function(){
    res.status(404);
    res.end();
  })
  .catch(function(err){
    console.log(err);
    res.status(404);
    res.end();
  });
}

exports.save_photo = function(req, res){
  let matches = req.headers['content-disposition'].match(/.+filename[ ]*=[ ]*"(.+)"$/);
  let filename = matches[1];
  var dir = __dirname +  "/img/" +  filename;
  console.log(dir);
  db.save_photo(req,res,dir);
}


exports.get_postes_extras = function(req,res){
  db.select_pole_extras().then(function(pole_extras){
    console.log(pole_extras);
    res.json(pole_extras);
  },function(err){
    console.log(err);
    res.status(404);
    res.end();
  });
}