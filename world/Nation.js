class Nation {
	constructor(homeChunkX, homeChunkY, homePlanetUUID){
		this.name = "Nation";
		this.color = [ 0, 255, 255 ];
		this.uuid = Math.round(Math.random() * 10000000000);
		this.homeChunkX = homeChunkX;
		this.homeChunkY = homeChunkY;
		this.homePlanetUUID = homePlanetUUID;
		
		this.cityUUIDs = [];
		this.capitalCityUUID = [];
	}
	
	getCapitalCity(){
		return server.world.cities[this.capitalCityUUID];
	}
}