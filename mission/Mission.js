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
		this.currentStage = 0;
		
		// Used in the Mission selection menu and confirmation, gives a summary about what the mission is about
		this.displaytext = "Mission\n$" + this.reward;
		
		// Single line of text used in the info bar, even shorter
		this.infobarblurb = "Mission";
		
		this.iconColor = [255,255,255];
		
		this.type = this.constructor.name;
	}
	
	getIcon(){
		return [];
	}
	
	update(){
		
		// -1 is a special time value for non time sensitive missions (Silly me that should really be a seperate boolean amirite)
		if (this.timeRemaining != -1){
			this.timeRemaining--;
			
			if (this.timeRemaining <= 0){
				this.onFail();
			}
		}
		
		// Checks to see if all objectives in a given stage are complete before moving on to the next stage
		
		var alldone = true;
		for ( i = 0; i < this.objectives[this.currentStage].length; i++ ){
			
			var obj = this.objectives[this.currentStage][i];
			if (!obj.complete){
				
				alldone = false; break;
			}
		}
		if (alldone){
			
			this.currentStage++;
			
			if (this.currentStage == this.objectives.length){
				
				this.onSuccess();
			}
		}
	}
	
	getSourceCity(){
		
		return server.world.cities[ this.sourceCityUUID ];
	}
	
	onFail(){
		this.getSourceCity().updateMissions();
		
		var p = server.world.getPlayer();
		GROUP_MISSION_FAIL.children[1].text = this.failtext; p.currentMission = null;
		p.history.events.push( new EventMissionFail( new Date(), this ) );
		GuiHandler.openWindow(GROUP_MISSION_FAIL);
	}
	
	onSuccess(){
		this.getSourceCity().updateMissions();
		
		var p = server.world.getPlayer();
		p.money += this.reward;
		
		GROUP_MISSION_SUCCESS.children[1].text = this.successtext; p.currentMission = null;
		p.history.events.push( new EventMissionSuccess( new Date(), this ) );
		GuiHandler.openWindow(GROUP_MISSION_SUCCESS);
	}
	
	onCancel(){
		this.getSourceCity().updateMissions();
	}
	
	onStart(){
		server.world.getPlayer().currentMission = this;
		
		var scm = this.getSourceCity().availableMissions;
		scm.splice( scm.indexOf( this ) );
	}
}