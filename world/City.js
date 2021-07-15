class City {
	constructor(nationuuid, chunkx, chunky, planetuuid){
		
		// core properties
		this.name = Nymgen.newName();
		
		this.uuid = Math.round(p5.prototype.random() * 10000000000);
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
		
		this.type = this.constructor.name;
	}
	
	getChunk(){
		return server.world.chunks[this.chunkx][this.chunky];
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
	
	getAvailableMissions(){
		return this.availableMissions;
	}
	
	getSpaceport(){
		
		for (var uuid of this.buildingUUIDs){
			var building = server.world.entities[uuid];
			if (building instanceof BuildingSpaceport){
				return building;
			}
		}
		
	}
	
	update(){
		
	}
	
	updateMissions(){
		this.updateExploreMissions();
		this.updateDeliveryMission( "passengers" );
		this.updateDeliveryMission( "food" );
		this.updateDeliveryMission( "iron" );
	}
	
	findDeliveryMission( itemtype ){
		for (var i = 0; i < this.availableMissions.length; i++){
			var mission = this.availableMissions[i];
			
			if (mission.item == itemtype){
				return mission;
			}
		}
		return false;
	}
	
	updateDeliveryMission( itemtype ){
		// Can't have delivery missions if there aren't at least 2 cities
		if (Object.keys(server.world.cities).length <= 1){ return; }
		
		// Will try to find an existing mission of the corresponding item type
		var cm = this.findDeliveryMission(itemtype); if (cm){ return; }
		
		// If no existing mission is found, then the city inventory will be checked to see if it has the items
		// passenger missions are exempt because they don't ever enter the city inventory
		var amt = this.resources.totalAmount( itemtype );
		if (amt <= 0 && itemtype != "passengers"){ return; }
		if (itemtype == "passengers"){ amt = 20; }
		
		// finds a random city to assign the mission
		var keys = Object.keys( server.world.cities );
		var randomcity = this;
		while (randomcity == this){
			randomcity = server.world.cities[keys[ keys.length * random() << 0]];
		}
		var m = new MissionDelivery(this.uuid, randomcity.uuid, itemtype, amt);
		this.availableMissions.push(m);
	}
	
	updateExploreMissions(){
		// Only the home nation can give a player exploration missions
		if (this.getNation() != server.world.getPlayer().getNation()){ return; }
		
		for ( var uuid in server.world.getChunk(this.chunkx,this.chunky).bodies ){
			var b = server.world.getChunk(this.chunkx,this.chunky).bodies[uuid];
			
			if (b instanceof BodyPlanet && (!b.explored)){
				
				// Adds exploration missions if there is none already.
				var explore_mission_found = false;
				for (var i = 0; i < this.availableMissions.length; i++){
					var mission = this.availableMissions[i];
					
					if (mission instanceof MissionExploration){
						if (mission.destination.uuid == b.uuid){
							explore_mission_found = true; break;
						}
					}
				}
				
				if (!explore_mission_found){

					var m = new MissionExploration(this.uuid, b);
					this.availableMissions.push(m);
				
				}
			}
		}
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