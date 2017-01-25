var Promise = require('promise');
var path = require ('path');
var base64 = require ('base-64');
var fs = require ('fs');
var  Downloader  = require('./lib/Downloader')
var downloader = new Downloader();

var handleEvents = require('./_handleEvents');
var printStats = require('./_printStats');

var registerDlEvents = function(num, dl) {
	handleEvents(dl, num);
	printStats(dl, num);
};

var info = require ('./getFileInfo');
var customPromises = require ('./formPromises');

info.getInfo('115', (Data)=> {
	var mainData = Data;
	customPromises.formPromises (Data, (fileData, promises, resolvers)=> {
	fileData.chunks.forEach(function(data){
		var fileSavePath = path.join(__dirname , 'downloads/'+fileData.fileName+'_'+data.chunk);
		var url = base64.decode(data.link);
		console.log(url);
		var dlName = 'dl'+data.chunk;
		var pName = 'p'+data.chunk
		var pResolve = pName+'Resolve';
		dlName = downloader.download(url, fileSavePath)
		dlName.start().on('end', function (){
			console.log ('resolving' + data.chunk);
			resolvers[pResolve]();
			});		
		registerDlEvents(data.chunk, dlName);
	});
	
})
	Promise.all(promises).then (function (data){
		console.log ('ALL PROMISES RESOLVED');
		console.log (mainData);
		loggStream(mainData);
	}); // end form promises
}); // end get info


// sync method
function loggSync (fileData){
	console.log('connecting pieces');
	bodyChunks = [];
	fileData.chunks.forEach(function(data){
		var fileName = fileData.fileName;
		var filePath = path.join(__dirname , 'downloads/'+fileName+'_'+data.chunk);
		var c = fs.readFileSync (filePath, { encoding: null });
		bodyChunks.push(c);
		console.log(c.length);
		if (data.chunk === 'last') {
			var content = Buffer.concat(bodyChunks)
			fs.writeFileSync(path.join(__dirname , 'downloads/'+fileName), content)
   		console.log('It\'s saved!');
		}
	});
}

// async buffers
 function loggBuf (fileData){
	console.log('asyenc buffers');
	var fileName = fileData.fileName;
	var resultingFile = path.join(__dirname , 'downloads/'+fileName);
	var fileToWriteIno = fs.open (resultingFile, 'w', (err, fileOpened) => {
	fileData.chunks.forEach(function(data){
		var fd = fileOpened;
		var totalChukns = fileData.chunksCount
		var startPos = data.startPos;
		var chunkPath = path.join(__dirname , 'downloads/'+fileName+'_'+data.chunk);
		var chunkSize = data.size;
		
		var rstream = fs.readFile(chunkPath, function (err, fileData){
				if (!err){
					console.log (fileData.length, startPos, chunkSize);
					var start = startPos;
					fs.writeFile(resultingFile, fileData, function() {
						console.log(startPos);
  						var writeStream = fs.createWriteStream(resultingFile,{flags: 'r+', mode: 0777, start: parseInt(startPos)});
  						writeStream.write(fileData);
					});
				}else {
					console.log (err);
				}					
			});
		})
	});
}

 // async streams @best method
 function loggStream (fileData){
	console.log('asyenc streams');
	var fileName = fileData.fileName;
	var resultingFile = path.join(__dirname , 'downloads/'+fileName);
	var fileToWriteIno = fs.open (resultingFile, 'w', (err, fileOpened) => {
		
	fileData.chunks.forEach(function(data){
		var fd = fileOpened;
		// var fileName = fileData.fileName;
		var totalChukns = fileData.chunksCount
		var startPos = data.startPos;
		var chunkPath = path.join(__dirname , 'downloads/'+fileName+'_'+data.chunk);
		var chunkSize = data.size;
		
		var rstream = fs.readFile(chunkPath, function (err, fileData){
				if (!err){
					console.log (fileData.length, startPos, chunkSize);
					fs.write(fd, fileData, 0, fileData.length,  parseInt(startPos), () => {
						console.log ('written data from position ' + startPos);
						fs.unlink (chunkPath);
						});
				}else {
						console.log (err);
				}					
			});
		})
	});
}