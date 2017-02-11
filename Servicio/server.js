var express = require('express');
var app = express();
var fs = require("fs");
var oracledb = require('oracledb');
var _ = require('underscore');
var q = require('q');
var bodyParser = require('body-parser');

app.use( bodyParser.json() );
//app.use( bodyParser.text() );
//app.use( bodyParser.urlencoded({extended: false}) );


/* decodeBase64Image(<base64 string>)
 * Decodes a base-64 image
 * Adapted from:
 *   http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
 */
function decodeBase64Image(dataString) 
{
   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
   var response = {};

   if (!matches || matches.length !== 3) 
   {
      return new Error('Invalid base64 header');
   }

   var types = matches[1].match(/\/(.+)$/);
   response.type = types[1];
   response.data = Buffer.from(matches[2], 'base64');

   return response;
}

function promiseWriteFile(prefix, objectid, photo, previousVal) {
   let deferred = q.defer();

   let b64obj = decodeBase64Image(photo);
   if (b64obj instanceof Error) {
      deferred.reject({"code": "B64",
                       "erro": b64obj,
                       "prevsucc": previousVal});
   } else {
      let fname = prefix + objectid + '.' + b64obj.type;
      fs.writeFile(
         fname, b64obj.data,
         function(err) {
            if (err) {
               let emsg = 'Error writing image file ' + fname + ': ' + err;
               deferred.reject({"code": prefix,
                                "erro": new Error(emsg),
                                "prevsucc": previousVal});
            } else {
               resobj = {"prefix": prefix, "fname": fname};
               if (previousVal)
                  deferred.resolve([previousVal, resobj]);
               else
                  deferred.resolve([resobj]);
            }
         });
   }
   return deferred.promise;
}

app.post('/poste/extras', function(req, res) {
   var spid = req.body.spid;
   var objectid = req.body.objectid;
   var ncables = req.body.ncables;

   //let promisePOS = promiseWriteFile('POS', objectid, req.body.fotoposte);
   //let promiseCAB = promiseWriteFile('CAB', objectid, req.body.fotocables);
   let promise =
      promiseWriteFile('POS', objectid, req.body.fotoposte, null).then(
         function(val) {
            return promiseWriteFile('CAB', objectid, req.body.fotocables, val);
         });

   //q.all([promisePOS, promiseCAB]).then(
   promise.then(
      function(val) {
         console.log('eeexito... value: ' + val);
         res.end();
      },
      function(errobj) {
         if (errobj.prevsucc) {
            console.log('A borrar ' + errobj.prevsucc[0].fname);
            fs.unlinkSync(errobj.prevsucc[0].fname);
         }
         res.status(500);
         res.send(errobj.erro);
         res.end();
         console.log('errorcito.. value: ' + errobj.erro);
      });
})

app.get('/poste/codigo/:codigo', function(req, res) {
   get_poste(res, "observacio = '" + req.params.codigo + "'");
})

app.get('/poste/oid/:objectid', function(req, res) {
   get_poste(res, "objectid = " + req.params.objectid);
})

function get_poste(res, sql_clause)
{
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
            "SELECT observacio, objectid "
          + "FROM postes "
          + "WHERE " + sql_clause,
            {},
            { outFormat: oracledb.OBJECT },
            function(err, result)
            {
               if (err) { console.error(err); return; }
               var deferred = q.defer();
               _.each(result.rows, function(obj, index) {
                  connection.execute(
                     "SELECT rfid, operador "
                   + "FROM cabequip "
                   + "WHERE poste_id = " + obj.OBJECTID,
                     {},
                     { outFormat: oracledb.OBJECT },
                     function(e2, r2)
                     {
                        if (e2) { console.error(e2); return; }
                        obj.cabequip = r2.rows;
                        if (index + 1 == result.rows.length)
                           deferred.resolve('terminadito');
                     });
               });
               deferred.promise.then(function(val) {
                  console.log('promesa resuelta!: ' + val);
                  console.log(result.rows);
                  res.end( JSON.stringify(result.rows) );
               });
            });
      });
}

app.get('/bb/:lat1,:long1,:lat2,:long2', function(req, res) {

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
            "SELECT v.sdp.sdo_point.y lat, v.sdp.sdo_point.x lon, "
          + "       v.observacio, v.objectid "
          + "FROM "
          + "   (SELECT sdo_cs.transform( "
          + "              sdo_geometry(2001,32717, "
          + "                           SDO_POINT_TYPE("
          +                                "p.coord_x, p.coord_y,"
          + "                              NULL),"
          + "                           null, null),"
          + "              8307) sdp, "
          + "           p.observacio, p.objectid "
          + "    FROM postes p, "
          + "         (select sdo_cs.transform( "
          + "                    sdo_geometry(2001,8307, "
          + "                                 SDO_POINT_TYPE("
          +                                      req.params.long1 + ","
          +                                      req.params.lat1 + ","
          + "                                    NULL),"
          + "                                 null, null),"
          + "                    32717) as sdo from dual) t,"
          + "         (select sdo_cs.transform( "
          + "                    sdo_geometry(2001,8307, "
          + "                                 SDO_POINT_TYPE("
          +                                      req.params.long2 + ","
          +                                      req.params.lat2 + ","
          + "                                    NULL),"
          + "                                 null, null),"
          + "                    32717) as sdo from dual) u "
          + "    WHERE p.coord_x between t.sdo.sdo_point.x"
          + "                        and u.sdo.sdo_point.x"
          + "      AND p.coord_y between t.sdo.sdo_point.y"
          + "                        and u.sdo.sdo_point.y"
          + "   ) v ",
/*
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
 */
/*
            "SELECT p.observacio, p.objectid, "
          + "       p.coord_x, p.coord_y "
          + "FROM postes p "
          + "WHERE sdo_cs.transform( "
          + "                sdo_geometry(2001,32717, "
          + "                             SDO_POINT_TYPE("
          +                                  "p.coord_x,"
          +                                  "p.coord_y,"
          + "                                NULL),"
          + "                             null, null),"
          + "                8307).sdo_point.x between " + req.params.long1
          + "                                      and " + req.params.long2
          + "  AND sdo_cs.transform( "
          + "                sdo_geometry(2001,32717, "
          + "                             SDO_POINT_TYPE("
          +                                  "p.coord_x,"
          +                                  "p.coord_y,"
          + "                                NULL),"
          + "                             null, null),"
          + "                8307).sdo_point.y between " + req.params.lat1
          + "                                      and " + req.params.lat2,
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
})


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("CNEL service listening at http://%s:%s", host, port)

})
