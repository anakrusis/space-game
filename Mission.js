class Mission {
	
	constructor(sourceCityUUID, destinationCityUUID){
			
		this.sourceCityUUID = sourceCityUUID;
		this.destinationCityUUID = destinationCityUUID;
	}
	
	getSourceCity(){
		
		return server.world.cities[ this.sourceCityUUID ];
	}
	
	getDestinationCity(){

		return server.world.cities[ this.destinationCityUUID ];
	
	}
}