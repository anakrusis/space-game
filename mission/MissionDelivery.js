class MissionDelivery extends Mission {
	constructor(sourceCityUUID, destinationCityUUID, item, quantity){
		super();
			
		this.item = item; this.quantity = quantity;	
			
		this.sourceCityUUID = sourceCityUUID;
		this.destinationCityUUID = destinationCityUUID;
		
		var dest = server.world.cities[ this.destinationCityUUID ];
		
		if (item == Items.ITEM_PASSENGERS){
			
			this.desc = "The city of " + dest.name + " is awaiting the arrival of " + item.name + ".\n";
			this.failtext = "The passengers did not reach their destination! This is an atrocity!";
			this.successtext = "The " + item.name + " were safely brought to the city of " + dest.name + "!\nGreat work!";
			
		}else{
		
			this.desc = "The city of " + dest.name + " is awaiting a delivery of " + item.name + ".\n";
			this.failtext = "The " + item.name + " did not reach its   destination! Be more careful next time!";
			this.successtext = "The " + item.name + " was safely delivered to the city of " + dest.name + "!\nGreat work!";
		
		}
		
		this.objectives = [ new ObjectiveBringItemToPlace( this.item, this.quantity, new Place( dest.getSpaceport() ) ) ] 
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
	
	onCancel(){
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
}