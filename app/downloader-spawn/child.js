function download(code){
		console.log('clicked new 2');
		var spawn = require('child_process').spawn;
		var child = spawn('node',  ['./downloadFile.js' ,code] , { cwd: 'app/downloader-spawn', stdio : [null,null,null,'ipc']});

	  child.stderr.on('data', (data) => {
		  // this is from error (not manual)
	  	console.log(`stderr: ${data}`);
	});
	
	child.stdout.on('data', (data) => {
		// this is from console.log
	  	console.log(`stdout: ${data}`);
	});

	child.on('data', function(data) {
		// this should handle binary piped files
	  	console.log('FROM DATA: ' + data);
	  })

  	  child.on('message', function(code) {
		  // this is from process.send
		  console.log(' FROM Message: ' + code);
		  if (code.hasOwnProperty('pid')){
			  console.log('PID FROM Message: ' + code.pid);
			  }
		
	  });

	  child.on('close', function(code) {
		  console.log('closing code: ' + code);
	  });

}

function killProcess (){
	
	var isWin = /^win/.test(process.platform);
	if(!isWin) {
    kill(process.pid);
	} else {
    var exec = require('child_process').exec;
    exec('taskkill /PID ' + process.pid + ' /T /F', function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // if(error !== null) {
        //      console.log('exec error: ' + error);
        // }
    	});             
	}
	
}

exports.download = download;
exports.endProcess = killProcess;