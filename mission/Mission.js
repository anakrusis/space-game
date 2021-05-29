class Mission {

	constructor(sourceCityUUID){
		
		// All missions must take in a source city which can be used to determine which nation commissioned it, from which planet it commenced, etc...
		this.sourceCityUUID = sourceCityUUID;
		
		this.uuid = Math.round(random() * 10000000000);
		this.reward = 0;
		this.timeRemaining = -1;
		
		this.desc = "No description found!";
		this.failtext = "No failure text found!";
		this.successtext = "No success text found!";
		
		this.objectives = [];
		this.currentObjectiveStage = 0;
		
		// Used in the Mission selection menu and confirmation, gives a summary about what the mission is about
		this.displaytext = "Mission\n$" + this.reward;
		
		// Single line of text used in the info bar, even shorter
		this.infobarblurb = "Mission";
	}
	
	update(){
		if (this.timeRemaining != -1){
			this.timeRemaining--;
			
			if (this.timeRemaining <= 0){
				this.onFail();
			}
		}
	}
	
	getSourceCity(){
		
		return server.world.cities[ this.sourceCityUUID ];
	}
	
	onFail(){
		GROUP_MISSION_FAIL.children[1].text = this.failtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_FAIL);
	}
	
	onSuccess(){
		server.world.getPlayer().money += this.reward;
		
		GROUP_MISSION_SUCCESS.children[1].text = this.successtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_SUCCESS);
	}
	
	onCancel(){
		
	}
	
	onStart(){
		server.world.getPlayer().currentMission = this;
		
		var scm = this.getSourceCity().availableMissions;
		scm.splice( scm.indexOf( this ) );
	}
}