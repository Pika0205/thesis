args = process.argv;
fs = require('fs');
var sum = function(x,y){ 	return parseFloat(x) + parseFloat(y);	};		//求和函数
const exec = require('child_process').exec;


whichSize = 2;
granularity = 1;
timeout1 = [], timeout2 = [];
finalTO1 = [];finalTO2 = [];
genTO = []
testBlock = [],testVote = [];	//single
meanList = [],meanTO1List = [], ninty_fiveList = [], ninty_fiveTO1List =[];

fileName = "6node-" + whichSize + "MB-" + args[2];
country = ["A","C","L","P","T","S", "All"];
//eachCountryBaseTestTO1 = [3000, 3000, 4000, 4000, 4250, 4500,4000];	//6
ninty_five = 0;
baseTestTO1seedList = [];
var num_member = tran_vote.length;
testType = "single"	//"all"

//if(args[2] == "A")	AllDC();
//if(args[2] == "S"){
	
main();	
	
function main(){	
	var readfile = 'TOTypeList.txt';
	
	fs.readFile(readfile, function(err, data) {
		if (err) return console.log(err);
			
		readfile = data.toString().split('\n');
		
		for(int i = 0; i < num_member; i++)
			get_block[i] = readfile[i].replace(/[\r\n]/g,"");
		
		for(int i = 0; i < num_member; i++)
			tran_vote[i + 6] = readfile[i + 6].replace(/[\r\n]/g,"");
		
		
		AllDC();
		
		for(var j = 0; j < 6; j++){
			var testBlock = [], testVote = [];
			var totalBlock = [], totalVote = [];
			
			for(var i = 0; i < 6; i++){
				testBlock.push(get_block[i][j]);
				testVote.push(tran_vote[i][j]);
				totalBlock = totalBlock.concat(get_block[i][j]);
				totalVote = totalVote.concat(tran_vote[i][j]);
			}
			ninty_five = showTO(totalBlock, totalVote, "S");
			baseTestTO1seed = ninty_five - (ninty_five % 500) - 500
			baseTestTO1seedList.push( parseInt(baseTestTO1seed) );
			
			
			
			whichCountry = j;
			//console.log(country[whichCountry]);
			fileName = "6node-" + whichSize + "MB-" + args[2];	//幾點
			
			SingleDC(testBlock, testVote, baseTestTO1seed);
		}
		
		//console.log("baseTestTO1seedList : " + baseTestTO1seedList);
		var paint = exec("python heatmapS2.py" + " " + whichSize + " " + args[2] + " " +  baseTestTO1seedList[0] + " " + baseTestTO1seedList[1] + " " + baseTestTO1seedList[2] + " " + baseTestTO1seedList[3] + " " + baseTestTO1seedList[4] + " " + baseTestTO1seedList[5], (error, stdout, stderr) => {
			if (error) {
				console.error(`error: ${error}`);
				return;
			}		//console.log(`stdout: ${stdout}`);	console.error(`stderr: ${stderr}`);
		});
		
		
		console.log("if(diff == 1){")
		console.log("//" + whichSize + "MB " + args[2] + " 平均")
		console.log("TOs1_List = [" + meanTO1List + "]")
		console.log("TOs2_List = [" + meanList + "]")
		console.log("}")
		
		console.log("if(diff == 2){")
		console.log("//" + whichSize + "MB " + args[2] + " 95%")
		console.log("TOs1_List = [" + ninty_fiveTO1List + "]")
		console.log("TOs2_List = [" + ninty_fiveList + "]")
		console.log("}")
	}
	
}

//}



function SingleDC(testBlock, testVote, baseTestTO1seed){	//單一data center
	var GBaccumulation = [], GVaccumulation = [];
	var gbMin = [], gbMax = [], gvMin = [], gvMax = [];
	
	
	for(var i = 0; i < 6; i++){
		gbMin.push(Math.min.apply(null, testBlock[i]));
		gbMax.push(Math.max.apply(null, testBlock[i]));
		gvMin.push(Math.min.apply(null, testVote[i]));
		gvMax.push(Math.max.apply(null, testVote[i]));
		
		GBaccumulation.push( genAccumulation( gbMax[i], gbMin[i], granularity, testBlock[i] ) );		
		GVaccumulation.push( genAccumulation( gvMax[i], gvMin[i], granularity, testVote[i] ) );
	}
	
	//console.log("GBaccumulation : " + GBaccumulation);
	//console.log("GVaccumulation : " + GVaccumulation);
	
	var result = MonteCarloTO12(GBaccumulation,GVaccumulation, gbMin, gvMin, granularity, testType, baseTestTO1seed);
	genDataForOptimalRateHeatmap(result);
}



function genAccumulation(max, min, granularity, original_Data){
	var interval = Math.ceil( (max - min) / granularity );
	var distribution = new Array(interval);
	var accumulation = [];
	
	
	for(var i = 0; i < interval + 1; i++)		//初始化 distribution
		distribution[i] = 0;
	
	for(var i = 0; i < original_Data.length; i++){
		temp = parseInt( (original_Data[i]  - min) / granularity );
		
		distribution[temp] = distribution[temp] + 1;
	}
	//console.log("distribution : " + distribution + "\n");
	
	
	accumulation[0] = distribution[0];
	
	for(var i = 1; i < distribution.length; i++)
		accumulation[i] = accumulation[i-1] + distribution[i];
	//console.log(accumulation[accumulation.length-1])
	
	
	//看是不是真的有模擬出input資料的分布情形
	//testGenTimeConsuming(accumulation, min, granularity, interval);
	return accumulation;
}



//不含rate
function MonteCarloTO12(GBaccumulation, GVaccumulation, gbMin, gvMin, granularity, testType, baseTestTO1seed){
	var result = [], x_tick = [], y_tick = [], result_gray = [];
	var allTotal = 0, tempTotal = 0, leader = -1, maxTO1 = 0; maxTO2 = 0;
	
	
	for(var base = 0; base <= 500; base = base + 50){
		
		for(var baseTestTO1 =baseTestTO1seed; baseTestTO1 <= baseTestTO1seed + 2000; baseTestTO1 = baseTestTO1 + 50){
			var baseTestTO2 = baseTestTO1 + base
			
			allTotal = 0;
			
			for(var testTime = 0; testTime < 10000; testTime++){
				tempTotal = baseTestTO2 ;
				testTO1 = baseTestTO1;
				testTO2 = baseTestTO2;
				timeout1.length = 0;
				timeout2.length = 0;
				
				
				while(true){
					leader = (leader + 1 ) % 6;
					
					if(testType == "all")
						genTO = genTO12_AllDC(GBaccumulation, GVaccumulation, gbMin, gvMin, granularity, leader);
					if(testType == "single")
						genTO = genTO12_SingleDC(GBaccumulation, GVaccumulation, gbMin, gvMin, granularity);
					
					
					if(testTO1 < genTO[0] || testTO2 < genTO[1]){
						testTO1 = testTO1 * 1.1;
						testTO2 = testTO2 * 1.1;
						tempTotal = tempTotal + testTO2;
					}
					else
						break ;
					
				}
				
				allTotal = allTotal + tempTotal;
			}
			
			result.push( (allTotal/10000).toFixed(2) );
			result_gray.push( (allTotal/10000).toFixed(2) );
			y_tick.push(baseTestTO1);
		}
		
		result.push("\n");
	}
	
	
	if(testType == "all")
		fileName = fileName + "-" + country[6];
	if(testType == "single")
		fileName = fileName + "-" + country[whichCountry];
	fs.appendFile(fileName + ".txt", result, function(err){	if(err)	console.log(err);	} );		//每組實驗的原始數據
	
	
	return result_gray;
}



function genTO12_SingleDC(GBaccumulation, GVaccumulation, gbMin, gvMin, granularity){
	genTO.length = 0;
	
	for(var receiver = 0; receiver < 6; receiver++){
		
		var tempTO1 = genTimeConsuming(GBaccumulation[receiver], gbMin[receiver], granularity);
		timeout1.push(tempTO1);
		
		
		for(var receiver2 = 0; receiver2 < 6; receiver2++){
			var tempTO2 = genTimeConsuming(GVaccumulation[receiver2], gvMin[receiver2], granularity);
			
			timeout2.push( tempTO1 + tempTO2 );
		}
		
	}
	
	//console.log("timeout1 : " + timeout1.length);
	//console.log("timeout2 : " + timeout2.length);
	finalTO1 = Math.max.apply(null, timeout1);
	finalTO2 = Math.max.apply(null, timeout2);
	//finalTO1 = getMax(timeout1,0);
	//finalTO2 = getMax(timeout2,1)
	/*
	max1 = Math.max.apply(null,timeout2)
	timeout2_index = timeout2.indexOf(max1);// 查詢最大元素索引
	timeout2[timeout2_index] = 0;// 把最大值置零
	finalTO2 = Math.max.apply(null,timeout2)
	*/
	
	genTO.push(finalTO1);
	genTO.push(finalTO2);
	
	return genTO;
}
function getMax(arr,show) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {	
		if(show)
			console.log("arr[len]" + arr[len])
		max = arr[len] > max ? arr[len] : max;	
		}
    return max;
}


function genTimeConsuming(accumulation, min, granularity){		//產生模擬這次的耗時
	
	var TC_seed = 0,TC = 0;
	
	TC_seed = Math.random() * accumulation[accumulation.length - 1];
	
	for(var i = 0; TC_seed > accumulation[i]; i++)
		TC = i * granularity + min;
	
	
	return TC
}





function genDataForOptimalRateHeatmap(resultList){
	
	var min = Math.min.apply(null, resultList);
	var rateMap = [], grayMap = [];
	//console.log("resultList : " + resultList);
	//console.log(min);
	
	for(var i in resultList){
		
		rateMap[i] = (min / resultList[i]);
			
		
		if(rateMap[i] >= 0.7 && rateMap[i] < 0.8)	grayMap[i] = 0.2;
		else if(rateMap[i] >= 0.8 && rateMap[i] < 0.9)	grayMap[i] = 0.4;
		else if(rateMap[i] >= 0.9 && rateMap[i] < 0.95)	grayMap[i] = 0.6;
		else if(rateMap[i] >= 0.95 && rateMap[i] < 0.99)	grayMap[i] = 0.8;
		else if(rateMap[i] >= 0.99)	grayMap[i] = 1;
		else	grayMap[i] = 0	
		
	}
	
	//console.log("result-rateMap : \n" + rateMap);
	//console.log("result-grayMap : \n" + grayMap);
	
	//fs.appendFile(fileName + "-rateMap.txt", rateMap, function(err){	if(err)	console.log(err);	} 
	fs.appendFile(fileName + "-grayMap.txt", grayMap, function(err){	if(err)	console.log(err);	} );	//每組實驗適合畫成heatmap的數據
}

function showTO(totalBlock, totalVote, type){
	/*
	console.log("totalBlock.length : " + totalBlock.length);
	console.log("totalVote.length : " + totalVote.length);
	console.log("收block平均 : " + totalBlock.reduce(sum) / totalBlock.length)
	console.log("收票平均 : " + totalVote.reduce(sum) / totalVote.length)
	*/
	sumabc = parseInt( parseFloat(totalBlock.reduce(sum) / totalBlock.length) + parseFloat(totalVote.reduce(sum) / totalVote.length) )
	
	//console.log("收block平均 + 收票平均 : " + sumabc);
	
	totalBlock.sort(function(a, b) {	return a - b;	});
	totalVote.sort(function(a, b) {	return a - b;	});
	//console.log("第0.95大的Block值 : " + totalBlock[ parseInt( 0.95 * totalBlock.length) ]);
	//console.log("第0.95大的Vote值 : " + totalVote[ parseInt( 0.95 * totalVote.length) ]);
	var ninty_five = totalBlock[ parseInt( 0.95 * totalBlock.length) ] + totalVote[ parseInt( 0.95 * totalVote.length) ]
	console.log("ninty_five : " + ninty_five);
	//console.log(ninty_five);
	/*
	var ninty_nine = totalBlock[ parseInt( 0.99 * totalBlock.length) ] + totalVote[ parseInt( 0.99 * totalVote.length) ]
	console.log("ninty_nine : " + ninty_nine);
	var hundred = totalBlock[ parseInt(totalBlock.length)-1 ] + totalVote[ parseInt(totalVote.length)-1 ]
	var hundred2 = totalBlock[ parseInt(totalBlock.length)-2 ] + totalVote[ parseInt(totalVote.length)-2 ]
	console.log("hundred : " + hundred);
	console.log("hundred2 : " + hundred2);
	*/
	
	if(type == "A"){
		console.log("平均 - ALL")
		console.log("node setNode.js t 6 " + parseInt(totalBlock.reduce(sum) / totalBlock.length) + " " + sumabc + " 2 300000 all toget 2 0 0 0")
		console.log("95% - ALL")
		console.log("node setNode.js t 6 " + totalBlock[ parseInt( 0.95 * totalBlock.length) ] + " " + ninty_five + " 2 300000 all toget 1.1 0 0 0");
	}
	
	
	if(type == "S"){
		meanTO1List.push( parseInt( totalBlock.reduce(sum) / totalBlock.length ) )
		meanList.push(sumabc)
		ninty_fiveTO1List.push( parseInt(totalBlock[ parseInt( 0.95 * totalBlock.length ) ]) )
		ninty_fiveList.push(ninty_five)
	}
	
	return ninty_five;
}



function AllDC(){	//全data center一起
	var totalBlock = [], totalVote = [], counter = -1;
	var GBaccumulation = [], GVaccumulation = [];
	var gbMin = [], gbMax = [], gvMin = [], gvMax = [];
	
	for(var j = 0; j < num_member; j++){
		for(var i = 0; i < num_member; i++){
			counter = counter + 1;
			
			gbMin.push(Math.min.apply(null, get_block[i][j]));
			gbMax.push(Math.max.apply(null, get_block[i][j]));
			
			gvMin.push(Math.min.apply(null, tran_vote[i][j]));
			gvMax.push(Math.max.apply(null, tran_vote[i][j]));
			
			totalBlock = totalBlock.concat(get_block[i][j]);
			totalVote = totalVote.concat(tran_vote[i][j]);
			
			
			GBaccumulation.push( genAccumulation( Math.max.apply(null, get_block[i][j]), Math.min.apply(null, get_block[i][j]), granularity, get_block[i][j] ) );
			GVaccumulation.push( genAccumulation( Math.max.apply(null, tran_vote[i][j]), Math.min.apply(null, tran_vote[i][j]), granularity, tran_vote[i][j] ) );
		}
	}
	
	showTO(totalBlock, totalVote, "A");
	
	//var result = MonteCarloTO12(GBaccumulation,GVaccumulation, gbMin, gvMin, granularity, "all", 6);
	//genDataForOptimalRateHeatmap(result);
}



function genTO12_AllDC(GBaccumulation, GVaccumulation, gbMin, gvMin, granularity, leader){
		
	for(var receiver = 0; receiver < 6; receiver++){
		
		var tempTO1 = genTimeConsuming(GBaccumulation[leader * 6 + receiver], gbMin[leader * 6 + receiver], granularity);
		timeout1.push(tempTO1);
		
		for(var receiver2 = 0; receiver2 < 6; receiver2++){
			var tempTO2 = genTimeConsuming(GVaccumulation[receiver * 6 + receiver2], gvMin[receiver * 6 + receiver2], granularity);
			
			timeout2.push( tempTO1 + tempTO2 );
		}
		
	}
	
	finalTO1 = Math.max.apply(null, timeout1);
	finalTO2 = Math.max.apply(null, timeout2);
	genTO.push(finalTO1);
	genTO.push(finalTO2);
	
	return genTO;
}