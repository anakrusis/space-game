class MissionDelivery extends Mission {
	constructor(sourceCityUUID, destinationCityUUID, item, quantity){
		super();
			
		this.item = item; this.quantity = quantity;	
			
		this.sourceCityUUID = sourceCityUUID;
		this.destinationCityUUID = destinationCityUUID;
		
		var dest = server.world.cities[ this.destinationCityUUID ];
		// temporarily baked in for now
		this.desc = "The city of " + dest.name + " is awaiting a delivery of " + item.name + ".\n";
		this.failtext = "The " + item.name + " did not reach its   destination! Be more careful next time!";
		this.successtext = "The " + item.name + " was safely delivered to the city of " + dest.name + "!\nGreat work!";
	}
	
	getSourceCity(){
		
		return server.world.cities[ this.sourceCityUUID ];
	}
	
	getDestinationCity(){

		return server.world.cities[ this.destinationCityUUID ];
	
	}
	
	onFail(){
		GROUP_MISSION_FAIL.children[1].text = this.failtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_FAIL);
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
	
	onSuccess(){
		GROUP_MISSION_SUCCESS.children[1].text = this.successtext; server.world.getPlayer().currentMission = null;
		GuiHandler.openWindow(GROUP_MISSION_SUCCESS);
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
		server.world.getPlayer().money += this.reward;
	}
}