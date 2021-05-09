class Mission {
	
	constructor(){
		this.uuid = Math.round(random() * 10000000000);
		this.reward = 500;
		this.timeRemaining = 3600;
		
		this.desc = "No description found!";
		this.failtext = "No failure text found!";
		this.successtext = "No success text found!";
	}
	
	update(){
		this.timeRemaining--;
	}
	
	onFail(){
		
	}
	
	onSuccess(){
		
	}
}