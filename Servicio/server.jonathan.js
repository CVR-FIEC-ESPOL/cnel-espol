var express = require('express');
var app = express();
var fs = require("fs");
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

function onConnect(success, failure)
{
   success(null);
}

app.post('/poste/extras/foto', function(req, res)
{
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

app.post('/poste/extras', function(req, res)
{
   var spid = req.body.spid;
   var objectid = req.body.objectid;
   var ncables = req.body.ncables;

   console.log(`spid: ${spid}, objectid: ${objectid}, ncables: ${ncables}`);
   res.end();
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

function promiseAuth(connection, req)
{
   let deferred = q.defer();

   let auth = req.headers['authorization'];
   let matches = auth.match(/^SharedKey ([A-Za-z0-9]+):(.+)$/);
   let user_id = matches[1];

         let access_key = 'elpassword';
         let key = new Buffer(access_key, "base64");
         let hmac = crypto.createHmac("sha256", key);
         let inputvalue = build_canonicalized_string(req);
         hmac.update(inputvalue);
         let sig = hmac.digest("base64");
         console.log('sig es: "' + sig + '"');

         let req_sig = matches[2];
         console.log('reqsig: "' + req_sig + '"');

         deferred.resolve( req_sig == sig ? user_id : new Error('ko') );

   return deferred.promise;
}

function onConnectAndAuth(req, res, success)
{
   onConnect(function(connection)
   {
      promiseAuth(connection, req).then(
         // val is the user_id or an Error
         function(val)
         {
            if (val instanceof Error) {
               console.error('Authentication failed!, ' + val);
               res.end('Authentication failed!, ' + val);
            } else {
               success(connection, val);
            }
         },
         function(err)
         {
            console.error(err);
            res.end(err);
         });
   });
}

app.get('/poste/codigo/:codigo', function(req, res)
{
   onConnectAndAuth(req, res, function(connection, user_id)
   {
      promiseGetPoste(connection, "observacio = '" + req.params.codigo + "'").then(
         function(rows)
         {
            console.log(rows);
            res.end( JSON.stringify(rows) );
         },
         function(err)
         {
            console.error(err);
            res.end(err);
         });
   });
})

app.get('/poste/oid/:objectid', function(req, res)
{
   onConnectAndAuth(req, res, function(connection, user_id)
   {
      promiseGetPoste(connection, "objectid = " + req.params.objectid).then(
         function(rows)
         {
            console.log(rows);
            res.end( JSON.stringify(rows) );
         },
         function(err)
         {
            console.error(err);
            res.end(err);
         });
   });
})


function promiseGetPoste(connection, sql_clause)
{
   var deferred = q.defer();

            deferred.reject(new Error('not implemented'));

   return deferred.promise;
}

app.get('/bb/:lat1,:long1,:lat2,:long2', function(req, res)
{
   onConnectAndAuth(req, res, function(connection, user_id)
   {
      let wgs84_code = '32717';
      let gmap_latlon_code = '8307';
      let p = promiseGetBB(connection, req.params.lat1, req.params.long1,
                   req.params.lat2, req.params.long2, 
                   wgs84_code, gmap_latlon_code);
      p.then(
         function(rows)
         {
            console.log(rows);
            res.end( JSON.stringify(rows) );
         },
         function(err)
         {
            console.error(err);
            res.end(err);
         });
   });
})

function promiseGetBB(connection, lat1, long1, lat2, long2, src_code, dst_code)
{
   var deferred = q.defer();

            deferred.reject(new Error('not implemented'));

   return deferred.promise;
}


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("CNEL service listening at http://%s:%s", host, port)

})
