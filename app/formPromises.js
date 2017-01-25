
function formPromises(fileData, callback){
	var Promise = require('promise');
	promises = [];
	var resolvers = [];
	fileData.chunks.forEach(function(data){
		var pName = 'p'+data.chunk
		var pResolve = pName+'Resolve';
		var pReject = pName+'Reject';
	
		pName = new Promise(function (resolve, reject){
					resolvers[pResolve] = resolve;
	//				pReject = reject;
			});
	
		promises.push (pName);
	});
	
	// console.dir (resolvers);
		callback (fileData , promises, resolvers);
	}

exports.formPromises = formPromises;