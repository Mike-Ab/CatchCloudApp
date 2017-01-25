function download(code){
		console.log('clicked');
		var spawn = require('child_process').spawn;
		var child = spawn('node',  ['./downloadFile-spawn.js' ,code] , { cwd: 'app', stdio : [null ,null , null, 'ipc' ] });
	  
	  child.on('error', function(data) {
	  	console.log('Error: ' + data);
	  })
	  
	  child.on('data', function(data) {
	  	console.log('stdout FROM DATA: ' + data);
	  })
	  child.on('close', function(code) {
		  console.log('closing code: ' + code);
	  });
  	  child.on('message', function(code) {
		  console.log(' FROM Message: ' + code);
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
 exports.kill = killProcess();