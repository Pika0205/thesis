function timeOutStart(){
	
	t1 = setTimeout(function(){
		
		if(!blockBody && (ID != leader))	//我沒收到block也不是leader
			myDeliver.TimeOutVoteDeliver(height, round, ID);
			
	},TO1);
	
	
	if(newHeightTogether == "toget"){	//一起進入下一height的模式中
		t2 = setTimeout(function(){
			
			if(commitBlock != null)		//共識有成功
				myMain.newHeight();
				
			else	//共識沒有成功
				myMain.newRound();
				
		},TO2);
	}
	
	
	if(newHeightTogether == "ntoget")
		t2 = setTimeout(function(){	myMain.newRound(1);	},TO2);
	
}


function timeOutStop(){
	clearTimeout(t1);
	clearTimeout(t2);
	
	if(newHeightTogether == "ntoget")
		clearTimeout(t3);
}


function resetTimeOut(timeout, synround){
	
	if(timeout == 1 && synround > 1){
		TO1 = TOs1 * Math.pow(TimeRate, synround);
		TO2 = TOs2 * Math.pow(TimeRate, synround);
		TO3 = TOs3 * Math.pow(TimeRate, synround);
	}
		
	round = synround;
	
}


module.exports = {
	timeOutStart,
	timeOutStop,
	resetTimeOut
}