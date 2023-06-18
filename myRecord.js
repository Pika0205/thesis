handle_TO1 =0, handle_TO2 =0, handle_TO3 =0, handle_TO4 = 0;
TO1_Buffer = [], TO2_Buffer = [], TO3_Buffer = [], TO4_Buffer = [];

Handle1_Buffer = [];
Handle2_Buffer = [];
Handle3_Buffer = [];		//Msig-BFT 收到足夠的票所需時間
//Handle4_Buffer = [];

result = []

/*
nonAgg_tran_Buffer1 = []
nonAgg_tran_Buffer2 = []
nonAgg_handle_Buffer1 = []
nonAgg_handle_Buffer2 = []
nonAgg_handle_Buffer3 = []
*/

var sum = function(x,y){ 	return x + y;	};		//求和函数
var square = function(x){	 return x * x;	};		//数组中每个元素求它的平方

size = [8, 4, 2, 1, 0.5, 0.25];
sizeName = ["8MB", "4MB", "2MB", "1MB", "512KB", "256KB"];


function endRecordTime_Of(){		//在setNode實驗結束後輸出每階段耗時和效能
	
	setTimeout(function(){
		
		if(testType == "to" || testType == "all"){
			
			/*
			console.log("TO1_Buffer : " + TO1_Buffer);
			console.log("TO2_Buffer : " + TO2_Buffer);
			
			console.log("Handle1_Buffer : " + Handle1_Buffer);
			console.log("Handle2_Buffer : " + Handle2_Buffer);
			console.log("nonAgg_handle_Buffer3 : " + nonAgg_handle_Buffer3);
			
			*/
			
			/*
				
			stddevMean(TO1_Buffer);
			stddevMean(TO2_Buffer);
			
			stddevMean(Handle1_Buffer);
			stddevMean(Handle2_Buffer);
			
			stddevMean(nonAgg_handle_Buffer3);
			*/
			
			
			
			console.log("result : " + result);
		}
		
		if(testType == "tp" || testType == "all"){
			
			console.log("height : " + height);
			console.log("size[dataSize] : " + size[dataSize]);
			console.log("testTime: " + testTime);
			
			var throughput = (height * size[dataSize] / (testTime / 1000) ).toFixed(3);
			console.log("==========00000==========");
			console.log();
			console.log();
			console.log("throughput : " + throughput);
			console.log();
			console.log();
			console.log("==========00000==========");
			
			/*
			//寫檔的部分
			var write = TOs1 + "\t" + TOs2 + "\t" + TOs3 + "\t" + height + "\t\t" + throughput + "\t" + sizeName[dataSize] + "\n";
			var write2 = throughput + ", ";
		
			fs.appendFile('throughput.txt', write, function (err) {	if(err)	console.log(err);	})
			
			fs.appendFile('throughput2.txt', write2, function (err) {	if(err)	console.log(err);	})
			*/
		}
		
	},testTime);
	
}


function stddevMean(TObuffer){
	//console.log("TObuffer : " + TObuffer);
	
	var total = TObuffer.reduce(sum);
	var mean = ( parseFloat(total) / TObuffer.length ).toFixed(2);
	
	
	var deviations = TObuffer.map(function(x){ return parseFloat(x) - mean;});
	var stddev = ( Math.sqrt( deviations.map(square).reduce(sum) / (TObuffer.length-1) ) ).toFixed(2);
	
	
	result.push(mean);
	result.push(stddev);
	
	
	//console.log("平均值：" + mean);
	//console.log("偏差：" + deviations.toFixed(3));
	//console.log("標準差：" + stddev);
	
	//return stddev;
	/*
	//var sum = TObuffer.reduce(function (a, b) {	return a + b;	}, 0);
	*/
}



function recordTime_Of_TO1(start_TO1, sender){		//myPost.js	/Block
	var end_TO1 = new Date().getTime();
	
	TO1_Buffer.push(end_TO1 - start_TO1);
}


function recordTime_Of_TO2(start_TO2, sender){		//myPost.js	/Vote
	var end_TO2 = new Date().getTime();
	
	TO2_Buffer.push(end_TO2 - start_TO2);
}


function recordTime_Of_TO3(start_TO3){		//myPost.js	/fromAggregateVote
	var end_TO3 = new Date().getTime();
	
	TO3_Buffer.push(end_TO3 - start_TO3);
}


function recordTime_Of_TO4(){
	var end_TO4 = new Date().getTime();
	
	TO4_Buffer.push(end_TO4 - start_TO4);
}


module.exports = {
	endRecordTime_Of,
	recordTime_Of_TO1,
	recordTime_Of_TO2,
	recordTime_Of_TO3,
	recordTime_Of_TO4
	//recordTime_Of_Height
}