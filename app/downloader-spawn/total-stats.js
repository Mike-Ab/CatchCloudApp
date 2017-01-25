'use strict';
class TraceDownload {
	constructor(downloadersArray, totalSize, chunksDownloaded){
		this.defaults = {
			REFRESH_RATE : 350
		};
		
		this.totalSize = totalSize || 0;
		this.timer = null;
		this.jobs = downloadersArray;
		this.toalDownloaded = 0;
		this.totalCompleted = 0;
		this.alreadyDownloaded = chunksDownloaded ;
		this.statusRef = [
			'error - aborting',
			'stopped',
			'destroyed',
			'not started',
			'downloading',
			'error',
			'completed'
		];
	}
	
	initTotalDownloaded () {
		console.log('initializing');
		this.loopJobs ((job, jobNum) => {
			console.log(job);
			this.toalDownloaded += job.curSize;
		})
	}
	
	currentStatus(){
		var parent = this
		this.toalDownloaded = this.alreadyDownloaded;
		this.loopJobs((job, jobNum) => {
			var tempStats = job.getStats();
			var curSize = job.curSize;
		    //console.log(this.alreadyDownloaded);	
			this.toalDownloaded += parseInt(job.curSize+tempStats.present.downloaded);
    	})
		process.send(`${this.toalDownloaded} of  ${this.totalSize}` );
		parent.totalCompleted = (this.toalDownloaded/this.totalSize)*100;
	}

	started(){
		this.loopJobs((job, jobNum) => {
			if (job.status == 1) { return true; }
			else { return false; }
    	});
	}

	completed () {
		// var completed = [];
		this.loopJobs((job, jobNum) => {
			if (job.status == 3){
				console.log (`${job} ${jobNum} finished downloading`);
				// completed.push(jobNum);
			}
    	})
	//	return completed;
	}

	stopTracing (){
		console.log('STOPPING THE TRACE');
		clearInterval(this.timer);
		this.timer = null;
	}

	loopJobs (callback){
		this.jobs.forEach(function(element, index){
			callback (element, index);
		});
	}

	trace (){
		var parent = this;
		this.timer = setInterval(function() {
		parent.currentStatus();
		process.send({percentage: parent.totalCompleted, pid : process.pid} );
		// parent.completed();
        }, this.defaults.REFRESH_RATE);
    }

} // end of class


module.exports = TraceDownload