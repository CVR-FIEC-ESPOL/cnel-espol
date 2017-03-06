

exports.decodeBase64Image = function(dataString) {
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

exports.promiseWriteFile = function (prefix, objectid, photo, previousVal)
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