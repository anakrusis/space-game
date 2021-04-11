class City {
	constructor(nationuuid, chunkx, chunky, planetuuid){
		
		// core properties
		this.name = Nymgen.newName();
		
		this.uuid = Math.round(Math.random() * 10000000000);
		this.chunkx = chunkx;
		this.chunky = chunky;
		this.population = 0;
		
		this.claimedTileIndexes = [];
		
		this.centerIndex = -1;
		
		// referential properties
		this.buildingUUIDs      = [];
		this.planetUUID = planetuuid;
		this.nationUUID = nationuuid;
		
		this.resources = new Inventory(100); // like a citywide collective inventory of goods..
		// I guess every city is like a centralized command economy because its simpler to program lmao
		
		this.availableMissions = [];
	}
	
	getPlayerSpawnIndex(){
		return this.centerIndex + 2;
	}
	
	getBuilding(index){
		//return this.getTile(
	}
	
	getTile(index){
		return this.getPlanet().tiles[index];
	}
	
	getPlanet(){
		return server.world.getChunk( this.chunkx, this.chunky ).getBody( this.planetUUID );
	}
	
	getNation(){
		return server.world.nations[ this.nationUUID ] ;
	}
	
	generateMissions(){
		this.availableMissions = [];
		var missioncount = 3;
		for (var i = 0; i < missioncount; i++){
			
			var keys = Object.keys( server.world.cities );
			var randomcity = this;
			while (randomcity == this){
				randomcity = server.world.cities[keys[ keys.length * Math.random() << 0]];
			}
			var m = new Mission(this.uuid, randomcity.uuid);
			this.availableMissions.push(m);
		}
	}
	
	getAvailableMissions(){
		return this.availableMissions;
	}
	
	update(){
		
	}
	
	registerBuilding(building){
		this.buildingUUIDs.push(building.uuid);
		
		for (var i = building.startindex; i <= building.endindex; i++){
			this.claimedTileIndexes.push(i);
		}
		building.cityUUID = this.uuid;
	}
	
	getBuildings(){
		var buildings = [];
		for (var uuid of this.buildingUUIDs){
			var building = server.world.entities[uuid];
			buildings.push(building);
		}
		return buildings;
	}
}