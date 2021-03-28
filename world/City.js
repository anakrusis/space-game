class City {
	constructor(nationuuid, chunkx, chunky, planetuuid){
		this.name = "City";
		this.uuid = Math.round(Math.random() * 10000000000);
		
		this.planetUUID = planetuuid;
		this.nationUUID = nationuuid;
	
		this.chunkx = chunkx;
		this.chunky = chunky;
		this.population = 0;
		
		this.buildingUUIDs      = [];
		this.claimedTileIndexes = [];
	}
	
	update(){
		
	}
	
	registerBuilding(building, index){
		this.buildingUUIDs.push(building.uuid);
		this.claimedTileIndexes.push(index);
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