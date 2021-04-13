class Mission {
	
	constructor(sourceCityUUID, destinationCityUUID, item, quantity){
			
		this.uuid = Math.round(Math.random() * 10000000000);
			
		this.item = item; this.quantity = quantity;	
			
		this.sourceCityUUID = sourceCityUUID;
		this.destinationCityUUID = destinationCityUUID;
		this.reward = 500;
		this.timeRemaining = 3600;
		
		var dest = server.world.cities[ this.destinationCityUUID ];
		// temporarily baked in for now
		this.desc = "The city of " + dest.name + " is awaiting a delivery of " + item.name + ".\n";
		this.failtext = "You failed! You frickin idiot! Dumass!!!";
		this.successtext = "You succeeded! You frickin idiot! Dumass!!!";
	}
	
	getSourceCity(){
		
		return server.world.cities[ this.sourceCityUUID ];
	}
	
	getDestinationCity(){

		return server.world.cities[ this.destinationCityUUID ];
	
	}
	
	update(){
		this.timeRemaining--;
	}
	
	onFail(){
		GROUP_MISSION_FAIL.children[0].text = this.failtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_FAIL);
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
	
	onSuccess(){
		GROUP_MISSION_SUCCESS.children[0].text = this.successtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_SUCCESS);
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
		server.world.getPlayer().money += this.reward;
	}
}