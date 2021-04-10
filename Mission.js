class Mission {
	
	constructor(sourceCityUUID, destinationCityUUID, item, quantity){
			
		this.uuid = Math.round(Math.random() * 10000000000);
			
		this.item = item; this.quantity = quantity;	
			
		this.sourceCityUUID = sourceCityUUID;
		this.destinationCityUUID = destinationCityUUID;
		this.reward = 500;
		this.timeRemaining = 600;
		
		var dest = server.world.cities[ this.destinationCityUUID ];
		// temporarily baked in for now
		this.desc = "The city of " + dest.name + " is awaiting a delivery of items."
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
}