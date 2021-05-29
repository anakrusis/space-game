class MissionDelivery extends Mission {
	constructor(sourceCityUUID, destinationCityUUID, item, quantity){
		super(sourceCityUUID);
			
		this.reward = 500;
		this.timeRemaining = 3600;
		this.item = item; this.quantity = quantity;	
			
		this.destinationCityUUID = destinationCityUUID;
		
		var dest = server.world.cities[ this.destinationCityUUID ];
		
		if (item == Items.ITEM_PASSENGERS){
			
			this.desc = "The city of " + dest.name + " is awaiting the arrival of " + item.name + ".\n";
			this.failtext = "The passengers did not reach their destination! This is an atrocity!";
			this.successtext = "The " + item.name + " were safely brought to the city of " + dest.name + "!\nGreat work!";
			
		}else{
		
			this.desc = "The city of " + dest.name + " is awaiting a delivery of " + item.name + ".\n";
			this.failtext = "The " + item.name + " did not reach its destination! Be more careful next time!";
			this.successtext = "The " + item.name + " was safely delivered to the city of " + dest.name + "!\nGreat work!\n";
		
		}
		
		this.objectives = [ [ new ObjectiveBringItemToPlace( this.item, this.quantity, new Place( dest.getSpaceport() ) ) ] ];
		
		// displayed on the select menu and confirmation screen
		
		this.displaytext  = this.item.name + " (" + this.quantity + ")\n";
		this.displaytext += this.getSourceCity().name + " ➔ " + this.getDestinationCity().name;
		this.displaytext += "\n$" + this.reward;
		
		this.infobarblurb = this.getSourceCity().name + " to " + this.getDestinationCity().name;
	}
	
	getDestinationCity(){

		return server.world.cities[ this.destinationCityUUID ];
	
	}
	
	onFail(){
		super.onFail();
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
	
	onSuccess(){
		
		super.onSuccess();
		
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
	
	onCancel(){
		server.world.getPlayer().inventory.shrink(this.item, this.quantity);
	}
	
	onStart(){
		super.onStart();
		
		server.world.getPlayer().inventory.add( new ItemStack( this.item, this.quantity ) );
	}
}