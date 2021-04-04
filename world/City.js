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
		
		this.centerIndex = -1;
	}
	
	getAvailableMissions(){
		
		var n = new Mission(this.uuid, this.uuid);
		
		return [ n ]
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