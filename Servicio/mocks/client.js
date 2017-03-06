var http = require('http');
var crypto = require('crypto');

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

function build_signature(method, d)
{
   let access_key = 'elpassword';
   let req = {'method': method, 'headers': {'date': d}};
   let key = new Buffer(access_key, "base64");
   let hmac = crypto.createHmac("sha256", key);
   let inputvalue = build_canonicalized_string(req)
   hmac.update(inputvalue);
   let sig = hmac.digest("base64");
   console.log('sig en client es: "' + sig + '"');
   return sig;
}

var method = 'GET';
var d = 'Tue, 05 Jul 2016 06:48:26 GMT';

var options = {
   host: '127.0.0.1',
   //path: '/poste/codigo/P090007',
   //path: '/poste/oid/104552',
   //path: '/poste/oid/97613',
   path: '/bb/100,0,0,100',
   port: '8081',
   method: method,
   headers: {'Authorization': 'SharedKey user1:' + build_signature(method, d),'Date': d}
};

var req = http.request(options, function(res) {
   var str = '';
   res.on('data', function(chunk) {
      str += chunk;
   });
   res.on('end', function() {
      console.log(str);
   });
});

req.end();
