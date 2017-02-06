var express = require('express');
var app = express();
var fs = require("fs");
var oracledb = require('oracledb');
var _ = require('underscore');
var q = require('q');

app.get('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       // console.log( data );
       res.end( data );
   });
})

var user = {
   "user4" : {
      "name" : "mohit",
      "password" : "password4",
      "profession" : "teacher",
      "id": 4
   }
}
app.post('/addUser', function(req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      datitos = JSON.parse(data);
      datitos["user4"] = user["user4"];
      res.end( JSON.stringify(datitos) );
   });
})

app.get('/jo/:id', function(req, res) {
   oracledb.getConnection(
     {
       user         : "cnelpostmaster",
       password     : "123",
       connectString: "localhost/XE"
     },
     function(err, connection)
     {
       if (err) { console.error(err); return; }
       //if (connection.oracleServerVersion < 1202000000) { // JSON_OBJECT is new in Oracle Database 12.2
       if (false) {
          console.log('JSON_OBJECT only works with Oracle Database 12.2 or greater');
          return;
       } else {
          connection.execute(
            "SELECT JSON_OBJECT ('codigo_poste' IS observacio, 'objid' IS objectid, "
          + "'empresa' IS codigoempr, 'elemento' IS codigoelem, "
          + "'mi_cosa' IS propiedad) objetito "
          + "FROM postes "
          + "WHERE observacio = :pid",
          [req.params.id],
          function(err, result)
          {
             if (err) { console.error(err); return; }
             console.log(result.rows);
             res.end( result.rows );
         });
       }
     });
})

app.get('/:id', function(req, res) {
   //fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      //datitos = JSON.parse(data);
      //var user = datitos["user" + req.params.id];
      //res.end( JSON.stringify(user) );

      oracledb.getConnection(
        {
          user          : "cnelpostmaster",
          password      : "123",
          connectString : "localhost/XE"
        },
        function(err, connection)
        {
          if (err) { console.error(err); return; }
          connection.execute(
            "SELECT observacio, objectid, "
          + "codigoempr, codigoelem, propiedad, "
          + "coord_x, coord_y "
          + "FROM postes "
          + "WHERE observacio = '" + req.params.id + "' or observacio = 'P116673'",
            {},
            { outFormat: oracledb.OBJECT },
            function(err, result)
            {
              if (err) { console.error(err); return; }
              var deferred = q.defer();
              console.log(result.rows);
              console.log('result.rows.length: ' + result.rows.length + "'");
              //for ( var i = 0; i < result.rows.length; i++) {
                //var obj = result.rows[i];
              _.each(result.rows, function(obj, index) {
                connection.execute(
                  "SELECT rfid, operador "
                + "FROM cabequip "
                + "WHERE poste_id = '" + obj.OBSERVACIO + "'",
                  {},
                  { outFormat: oracledb.OBJECT },
                  function(e2, r2)
                  {
                    if (e2) { console.error(e2); return; }
                    console.log('ahi va... ' + index);
                    console.log(r2.rows);
                    console.log('obj.OBSERblabla: ' + obj.OBSERVACIO);
                    obj.cabequip = r2.rows;
                    if (index + 1 == result.rows.length)
                      deferred.resolve('terminadito');
                  });
                console.log('second inner execute ended');
              });
              console.log('_.each ended...\n');
              deferred.promise.then(function(val) {
                console.log('promesa resuelta!: ' + val);
                console.log(result.rows);
                res.end( JSON.stringify(result.rows) );
              });
            });
          console.log('execute ended... :)');
        });
      console.log('getConnection ended... :)');
   //});
})

app.get('/bb/:lat1,:long1,:lat2,:long2', function(req, res) {
   //fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      //datitos = JSON.parse(data);
      //var user = datitos["user" + req.params.id];
      //res.end( JSON.stringify(user) );

      oracledb.getConnection(
        {
          user          : "cnelpostmaster",
          password      : "123",
          connectString : "localhost/XE"
        },
        function(err, connection)
        {
          if (err) { console.error(err); return; }
          connection.execute(
            "SELECT p.observacio, p.objectid, "
          + "p.coord_x, p.coord_y "
          + "FROM postes p, "
          + "     (select sdo_cs.transform( "
          + "                sdo_geometry(2001,8307, "
          + "                             SDO_POINT_TYPE("
          +                                  req.params.long1 + ","
          +                                  req.params.lat1 + ","
          + "                                NULL),"
          + "                             null, null),"
          + "                32717) as sdo from dual) t,"
          + "     (select sdo_cs.transform( "
          + "                sdo_geometry(2001,8307, "
          + "                             SDO_POINT_TYPE("
          +                                  req.params.long2 + ","
          +                                  req.params.lat2 + ","
          + "                                NULL),"
          + "                             null, null),"
          + "                32717) as sdo from dual) u "
          + "WHERE coord_x between t.sdo.sdo_point.x and u.sdo.sdo_point.x"
          + "  AND coord_y between t.sdo.sdo_point.y and u.sdo.sdo_point.y",
/*
          + "WHERE coord_x >= t.sdo.sdo_point.x"
          + "  AND coord_y >= t.sdo.sdo_point.y"
          + "  AND coord_x <= u.sdo.sdo_point.x"
          + "  AND coord_y <= u.sdo.sdo_point.y",
 */
            {},
            { outFormat: oracledb.OBJECT },
            function(err, result)
            {
              if (err) { console.error(err); return; }
              console.log(result.rows);
              res.end( JSON.stringify(result.rows) );
            });
        });

   //});
})


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
