class City {
	constructor(nationuuid, chunkx, chunky, planetuuid){
		this.name = Nymgen.newName();
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
	
	getPlanet(){
		return server.world.getChunk( this.chunkx, this.chunky ).getBody( this.planetUUID )
	}
	
	getNation(){
		return server.world.nations[ this.nationUUID ] ;
	}
	
	getAvailableMissions(){
		
		var keys = Object.keys( server.world.cities );
		var randomcity = server.world.cities[keys[ keys.length * Math.random() << 0]];
		
		var n = new Mission(this.uuid, randomcity.uuid);
		
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