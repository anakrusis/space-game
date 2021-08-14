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
		return this.getTile(index).getBuilding();
	}
	
	getTile(index){
		return this.getPlanet().tiles[index];
	}
	
	getPlanet(){
		return server.world.getChunk( this.chunkx, this.chunky ).bodies[ this.planetUUID ];
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
		if ( server.world.worldTime % 60 == 59 ){ this.updateDensities(); this.doDensityEvent(); }
	}
	
	updateDensities(){
		for (var uuid of this.buildingUUIDs){
			var building = server.world.entities[uuid]; var plnt = this.getPlanet();
			var terrsize = plnt.terrainSize;
			var buildingradius = 5;
			
			var strt = building.startindex - buildingradius;
			var ende = building.endindex + buildingradius;
			if (building.endindex < building.startindex){ ende += terrsize; }
			
			for (var p = strt; p <= ende; p++){
				var i = loopyMod(p,terrsize);
			
				if (!plnt.densities[i]){ plnt.densities[i] = 0 };
				
				if (building.isIndexInBuilding(i)){
					var amt = 0.1;
				}else{
					var leftdist = plnt.terrainIndexDistance(building.startindex, i);
					var rightdist = plnt.terrainIndexDistance(building.endindex, i);
					var dist = Math.min(leftdist, rightdist);
					var amt = 0.1 * ( ( buildingradius - dist) / buildingradius );
				}
				plnt.densities[i] += amt;
			}
		}
	}
	
	// Picks a random index in the city bounds, or the near radius outside the city bounds
	// Will do a weighted random chance of picking any building based on the distances between them all
	doDensityEvent(){
		
		var plnt = this.getPlanet();
		
		// Updating city buildings must be done first by selecting a random index within the city bounds, or slightly outside it in either direction
		var possibleIndices = [];
		for (var i = 0; i < this.claimedTileIndexes.length; i++){
			var ci = this.claimedTileIndexes[i];
			
			// The city will not modify the spaceport because it is neccessary for survival
			if ( this.getBuilding(ci) instanceof BuildingSpaceport ) { continue; }
			
			possibleIndices.push(ci);
		}
		// These are the extreme ends of the city
		var minindex = Math.min(...this.claimedTileIndexes);
		var maxindex = Math.max(...this.claimedTileIndexes);
		var terrsize = plnt.terrainSize;
		
		for (var i = 0; i < 5; i++){
			var lr = loopyMod(minindex - i, terrsize);
			var rr = loopyMod(maxindex + i, terrsize);
			
			possibleIndices.push(lr, rr);
		}
		
		// If there are no possible indices to update, then whatever, i guess, just dont
		if (possibleIndices.length == 0){ 
			console.log("couldn't update city");
			return false; }
		
		var index = possibleIndices[Math.floor(Math.random() * possibleIndices.length)]; //console.log(index);
		
		// It is now time to calculate the chance of all different possible buildings being built, given the ideal density of the building templates and the density of the tile
		var keys    = [];
		var chances = [];
		var sum = 0;
		for ( var key in Buildings.buildings ){
			var template = Buildings.buildings[key];
			//if (!this.densities[index]){ this.densities[index] = 0; }
			var diff = Math.abs( template.density - plnt.densities[index] )
			var chance = 1 / diff;
			
			chances.push(chance);
			keys.push(key);
			
			sum += chance;
		}
		
		console.log(chances);
		
		var selectedKey;
		for (var q = 0; q < keys.length; q++){
			var prob = chances[q] / sum;
			if ( random() < prob ){
				selectedKey = keys[q];
				break;
			}
		}
		if (!selectedKey){ return false; }
		
/* 		var random = Math.random() * sum;
		var selectedKey = keys[0];
		for ( var q = keys.length - 1; q >= 0; q-- ){
			
			if (random >= sum) { 
				selectedKey = keys[q];
				break;
			}
			sum -= chances[q];
		} */
		
		var template = Buildings.buildings[selectedKey]; //console.log(template);
		if (!template){ return false; }
		var bldg;
		switch (template.buildingtype){
			case "farm":
				bldg = new BuildingFarm( plnt.x, plnt.y, plnt.uuid, this.uuid, index, plnt.terrainSize);
				break;
			case "house":
				bldg = new BuildingHouse( plnt.x, plnt.y, plnt.uuid, this.uuid, index, plnt.terrainSize, selectedKey);
				break;
		}
		plnt.spawnBuilding( bldg, this );
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