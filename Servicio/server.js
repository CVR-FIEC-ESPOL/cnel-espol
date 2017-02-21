var express = require('express');
var app = express();
var fs = require("fs");
var oracledb = require('oracledb');
var _ = require('underscore');
var q = require('q');
var bodyParser = require('body-parser');
var crypto = require('crypto');

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

function promiseWriteFile(prefix, objectid, photo, previousVal)
{
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
         function(err)
         {
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

   let promise =
      promiseWriteFile('POS', objectid, req.body.fotoposte, null).then(
         function(val)
         {
            return promiseWriteFile('CAB', objectid, req.body.fotocables, val);
         });

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
         console.error('errorcito.. value: ' + errobj.erro);
      });
})

function build_canonicalized_string(
             request, encoding, language, length,
             md5, content_type, if_mod_since, if_match,
             if_none_match, if_unmod_since, range)
{
   let cm_date = request.headers['date'];

   return request.method + "\n"
    + (encoding || '') + "\n"             /*Content-Encoding*/
    + (language || '') + "\n"             /*Content-Language*/
    + (length || '') + "\n"                 /*Content-Length*/
    + (md5 || '') + "\n"                       /*Content-MD5*/
    + (content_type || '') + "\n"     /*Content-Type*/
    + (cm_date || '') + "\n"               /*Date*/
    + (if_mod_since || '') + "\n"     /*If-Modified-Since*/
    + (if_match || '') + "\n"             /*If-Match*/
    + (if_none_match || '') + "\n"   /*If-None-Match*/
    + (if_unmod_since || '') + "\n" /*If-Unmodified-Since*/
    + (range || '') + "\n";                  /*Range*/
}

function promiseAuth(req)
{
   let deferred = q.defer();

   oracledb.getConnection(
      {
         user          : "cnelpostmaster",
         password      : "123",
         connectString : "localhost/XE"
      },
      function(err, connection)
      {
         if (err) {
             deferred.reject(err);
             return;
         }

         let auth = req.headers['authorization'];
         let matches = auth.match(/^SharedKey ([A-Za-z0-9]+):(.+)$/);
         let user_id = matches[1];

         connection.execute(
            "SELECT access_key, service_version "
          + "FROM auth "
          + "WHERE user_id = '" + user_id + "'",
            {},
            { outFormat: oracledb.OBJECT },
            function(err, result)
            {
               if (err) {
                  deferred.reject(err);
                  return;
               }
               if (result.rows.length == 0) {
                  // Not going to be rejected, but resolved with ko
                  deferred.resolve( new Error('no user ' + user_id) );
                  return;
               }
               let access_key = result.rows[0].ACCESS_KEY;
               let key = new Buffer(access_key, "base64");
               let hmac = crypto.createHmac("sha256", key);
               let inputvalue = build_canonicalized_string(req);
               hmac.update(inputvalue);
               let sig = hmac.digest("base64");
               console.log('sig es: "' + sig + '"');
   
               let req_sig = matches[2];
               console.log('reqsig: "' + req_sig + '"');

               deferred.resolve( req_sig == sig ? 'ok' : new Error('ko') );
            });
      });
   return deferred.promise;
}

app.get('/poste/codigo/:codigo', function(req, res)
{
   get_poste(req, res, "observacio = '" + req.params.codigo + "'");
})

app.get('/poste/oid/:objectid', function(req, res)
{
   get_poste(req, res, "objectid = " + req.params.objectid);
})

function get_poste(req, res, sql_clause)
{
   let promise = promiseAuth(req);
   promise.then(
      function(val)
      {
         if (val == 'ok') {
            let p = promiseGetPoste(sql_clause);
            p.then(
               function(rows) {
                  console.log(rows);
                  res.end( JSON.stringify(rows) );
               },
               function(err) {
                  console.error(err);
                  res.end(err);
               });
         } else {
            console.error('Authentication failed!, ' + val);
            res.end('Authentication failed!, ' + val);
         }
      },
      function(err)
      {
         console.error(err);
         res.end(err);
      });
}

function promiseGetPoste(sql_clause)
{
   var deferred = q.defer();
   oracledb.getConnection(
      {
         user          : "cnelpostmaster",
         password      : "123",
         connectString : "localhost/XE"
      },
      function(err, connection)
      {
         if (err) {
            deferred.reject(err);
            return;
         }
         connection.execute(
            "SELECT observacio, objectid "
          + "FROM postes "
          + "WHERE " + sql_clause,
            {},
            { outFormat: oracledb.OBJECT },
            function(err, result)
            {
               if (err) {
                  deferred.reject(err);
                  return;
               }
               _.each(result.rows, function(obj, index)
               {
                  connection.execute(
                     "SELECT rfid, operador "
                   + "FROM cabequip "
                   + "WHERE poste_id = " + obj.OBJECTID,
                     {},
                     { outFormat: oracledb.OBJECT },
                     function(e2, r2)
                     {
                        if (e2) {
                           deferred.reject(e2);
                           return;
                        }
                        obj.cabequip = r2.rows;
                        if (index + 1 == result.rows.length) {
                           deferred.resolve(result.rows);
                           return;
                        }
                     });
               });
            });
      });
   return deferred.promise;
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
