var util = require('../util.js')
var request = require('request');
var Promise = require('promise');

exports.get_tags_by_id = function(req,res){
  var object_id =  req.params.object_id;
  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "GET";
  var options = {
    uri: 'http://127.0.0.1:8020/tags/' +  object_id,
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };
  
  console.log("get_tags",object_id);

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
      res.json(body);
    }else{
      console.log(error);
      res.json({});
    }
  });

};


exports.save_tags = function(req,res){
	var data = req.body;
	console.log("save_tags",data);

	if(!data || typeof data == 'undefined'){
		res.status(500);
		res.end();
	}

	var object_id = data.object_id
	var tags = data.tags;
	console.log("tags: ",tags);

	var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
	var method = "POST";
	var options = {
	uri : "http://127.0.0.1:8020/tag",
		method: method,
		headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
	};

	var save_tag = function(object_id,tag,checked){
		return new Promise(function(resolve,reject){
		options.json =  { object_id: object_id , tag : tag , checked: checked };
		request(options,function(error,response){
		if (error) reject(error);
		else resolve(response);
		});
		})
	}

	var promises = []

	for (var i in tags){
		var value = tags[i].value;
		var checked = tags[i].checked;
		promises.push(save_tag(object_id,value,checked));
	}

	Promise.all(promises).then(function(results){
	//responde status = 500 cuando existe un error con el codigo del poste
		var all_right = true;
		for(var i in results){
			var result = results[i];
			var tag = tags[i].value;
			var checked = tags[i].checked;
			if(result.statusCode != 200){
				all_right = false;
			}
		}

		if(results.length>0 && all_right){
			res.json({});
		}else{
			res.status(500);
			res.end();
		}
	},
		function(err){
		console.log(err);
	});
}

exports.save_tags_auto = function(req,res){
  var data = req.body;
  
  if(!data || typeof data == 'undefined'){
    res.status(500);
    res.end();
  }

  var ids = data.poles;
  console.log("object_ids: ",ids);

  var d = 'Tue, 05 Jul 2016 06:48:26 GMT';
  var method = "POST";
  var options = {
    uri : "http://127.0.0.1:8020/tag_auto",
    method: method,
    headers: {'Authorization': 'SharedKey ' + req.session.user  + ':' + util.build_signature(method, d,req.session.password),'Date': d}
  };

  var save_pole = function(object_id){
    return new Promise(function(resolve,reject){
      options.json =  { object_id: object_id };
      request(options,function(error,response,body){
        if (error) reject(error);
        else resolve(body);
      });
    })
  }

  var promises = []

  for (var i in ids){
    promises.push(save_pole(ids[i]));
  }

  Promise.all(promises).then(function(results){
    if(results.length<0){
      res.json({});
    }
    res.end();
  },
  function(err){
    console.log(err);
  });
}