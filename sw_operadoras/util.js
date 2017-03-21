var crypto = require('crypto');

exports.build_signature = function (method,d,access_key)
{
  //access_key = 'elpassword';
  let req = {'method': method, 'headers': {'date': d}};
  let key = new Buffer(access_key, "base64");
  let hmac = crypto.createHmac("sha256", key);
  let inputvalue = build_canonicalized_string(req)
  hmac.update(inputvalue);
  let sig = hmac.digest("base64");
  return sig;
}

function build_canonicalized_string (request, encoding, language, length,
  md5, content_type, if_mod_since, if_match, if_none_match, if_unmod_since, range)
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
