crypto = require('crypto');
EC = require('elliptic').ec;
ec = new EC('secp256k1');

child_process2 = require('child_process').execFile;

TO1 = 0, TO2 = 0, timeout = 0;





function newRound(){	
	
	roundReset();
	
	if(parseInt(ID) == parseInt(leader))
		myProcedure.firstBlock();
	
	if(aheadBlock != null)	//如果是收到票才同步的.就甭getBlock
		postProcess.getBlock(aheadBlock);	//以免他以為他上回合是有收到票.然後投出他以為收到的票(其實是空的)
	
}


function roundReset(){
	
	receiveBlock = null;	//每回收一個block
	commitBlock = null;
	blockBody = null;
	isVoteLock = 0;		//每回只投一票
	mainProcess.setLockset();	//清空this.將上回的this移到last
	timeout = 0;
	
	round++;
	leader = (height+round+4) % num_member;
	
	
	if(Advanced == "nAdv"){
		if(round == 1){
			TO1 = TOs1;
			TO2 = TOs2;
		}

		else if(round > 1){
			TO1 = TO1 * TimeRate;
			TO2 = TO2 * TimeRate;
		}
	}
	
	
	if(Advanced == "Adv"){
		powS = ((round-1) / 6);
		
		if(powS < 1){
			TO1 = TOs1_List[leader];
			TO2 = TOs2_List[leader];
		}
		else{
			TO1 = TOs1_List[leader] * Math.pow(TimeRate, powS);
			TO2 = TOs2_List[leader] * Math.pow(TimeRate, powS);
		}
		
	}
	
	timeOut.timeOutStart();
}


function newHeight(){
	handle_TO1 = new Date().getTime();		//在myDeliver.traBlockRecord處理
	
	heightReset();
	
	console.log("\n\n=+=+=+=+= height : " + height + " =+=+=+=+=");
	
	newRound();
}


function heightReset(){
	
	//如果是syn的話.就終止之前的timeout設定
	if(height != 0)
		timeOut.timeOutStop();
	
	height++;
	round = 0;
	
	lastRoundBlock = null;
	lastRoundVote = null;
	
	isSynLock = 0;	
}


//========== Msig-BFT ==========
function msigStatusReset(){
	
	stopRecMsig = 0;
	broMsig = 0;
	notSignedWitness.length = 0;
	
	witnessList.length = 0;
	
	for(var i = 1; i < fault + 1; i++)
		witnessList.push( parseInt( (leader + i * (fault + 1) ) % num_member ) );
	
}



module.exports = {
	newRound,
	newHeight
}