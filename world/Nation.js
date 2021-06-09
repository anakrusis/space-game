class Nation {
	constructor(homeChunkX, homeChunkY, homePlanetUUID){
		this.name = Nymgen.newName();
		this.color = RandomUtil.randomNationColor();
		this.uuid = Math.round(p5.prototype.random() * 10000000000);
		this.homeChunkX = homeChunkX;
		this.homeChunkY = homeChunkY;
		this.homePlanetUUID = homePlanetUUID;
		
		this.cityUUIDs = [];
		this.capitalCityUUID = [];
		
		this.type = this.constructor.name;
	}
	
	getCapitalCity(){
		return server.world.cities[this.capitalCityUUID];
	}
}