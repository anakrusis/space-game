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
		
		var densityaddamt = 1; // set really high right now for testing
		
		for (var uuid of this.buildingUUIDs){
			var building = server.world.entities[uuid]; var plnt = this.getPlanet();
			if (!(building instanceof BuildingSpaceport || building instanceof BuildingHouse || building instanceof BuildingMine)){ continue; }
			if (building instanceof BuildingHouse){ densityaddamt = 0.1; }
			
			var terrsize = plnt.terrainSize;
			var buildingradius = 5;
			
			var strt = building.startindex - buildingradius;
			var ende = building.endindex + buildingradius;
			if (building.endindex < building.startindex){ ende += terrsize; }
			
			for (var p = strt; p <= ende; p++){
				var i = loopyMod(p,terrsize);
			
				if (!plnt.densities[i]){ plnt.densities[i] = 0 };
				
				if (building.isIndexInBuilding(i)){
					var amt = densityaddamt;
				}else{
					var leftdist = plnt.terrainIndexDistance(building.startindex, i);
					var rightdist = plnt.terrainIndexDistance(building.endindex, i);
					var dist = Math.min(leftdist, rightdist);
					var amt = densityaddamt * ( ( buildingradius - dist) / buildingradius );
				}
				plnt.densities[i] += amt;
			}
		}
	}
	
	// Picks a random index in the city bounds, or the near radius outside the city bounds
	// Will do a weighted random chance of picking a building to build based on the distances between them all
	// However there are many criteria which may make such building impossible to build, as detailed below
	doDensityEvent(){
		
		var plnt = this.getPlanet();
		var terrsize = plnt.terrainSize;

		// These are the extreme ends of the city
		var minindex = Math.min(...this.claimedTileIndexes);
		var maxindex = Math.max(...this.claimedTileIndexes);
		var truemin  = loopyMod( minindex - 1, terrsize );
		var allIndices = [];
		
		// Randomly shuffles all the possible building indices, so as to not favor one side over another
		for (var i = minindex - 1; i <= maxindex + 1; i++){
			var ci = loopyMod(i,terrsize);
			allIndices.push(ci);
		}
		var shuffledIndices = this.shuffle(allIndices);
		
		// Selects the index of the tile with the greatest difference in density between itself and the template of the building currently occupying it
/* 		var biggestdensitydiff = 0; var index; var ogtemplate;
		for (var i = 0; i < shuffledIndices.length; i++){
			var ci = shuffledIndices[i];
			var ct; // current template
			var cb = this.getBuilding(ci); // current building
			
			// Kind of working backwards to find a template given a building, should probably be alot less messy
			if (!cb){
				ct = Buildings.buildings["none"];
			}else{
				switch (cb.type){
					// The city will not modify the spaceport because it is neccessary for survival
					case "BuildingSpaceport":
						continue;
					case "BuildingHouse":
						ct = Buildings.buildings[cb.template];
						break;
					case "BuildingFarm":
						ct = Buildings.buildings["farm2"];
						break;
					default:
						ct = Buildings.buildings["none"];
						break;
				}
			}
			
			if (!ct){ continue; }
			
			if (!plnt.densities[ci]){ plnt.densities[ci] = 0 };
			var diff = Math.abs( ct.density - plnt.densities[ci] );
			if ( diff >= biggestdensitydiff ){
				biggestdensitydiff = diff; index = ci; ogtemplate = ct;
			}
		} */
		
		// this just picks a random index
		var indexindex = Math.floor( Math.random() * shuffledIndices.length );
		var index = shuffledIndices[ indexindex ];
		
		if (!index){ console.log("no valid index found"); return false; }
		
		var cb = this.getBuilding(index); // current building
		var ct;
		// Kind of working backwards to find a template given a building, should probably be alot less messy
		if (!cb){
			ct = Buildings.buildings["none"];
		}else{
			switch (cb.type){
				// The city will not modify the spaceport because it is neccessary for survival
				case "BuildingSpaceport":
					console.log("selected index belongs to spaceport"); return false;
				case "BuildingHouse":
					ct = Buildings.buildings[cb.template];
					break;
				case "BuildingFarm":
					ct = Buildings.buildings["farm2"];
					break;
				case "BuildingMine":
					ct = Buildings.buildings["mine1"];
					break;
				default:
					ct = Buildings.buildings["none"];
					break;
			}
		}
		var ogtemplate = ct;
		//console.log(biggestdensitydiff);
		
		// It is now time to calculate the chance of all different possible buildings being built, given the ideal density of the building templates and the density of the tile
		var keys    = [];
		var chances = [];
		var sum = 0;
		for ( var key in Buildings.buildings ){
			var template = Buildings.buildings[key];
			// Some templates like the mines will never spawn simply based on density, they need other special criteria to spawn
			if (!template.density){ continue; }
			
			var diff = Math.abs( template.density - plnt.densities[index] )
			var chance = 1 / diff;
			
			// If the diff is 0, the chance will be INFINITY!!! so we have to replace this chance value with something really big but not infinity, or the weighted random will just totally break
			if (chance === Infinity){ chance = 10000; }
			
			chances.push(chance);
			keys.push(key);
			
			sum += chance;
		}
		//console.log(chances);
		
		// Here is the weighted random which selects a template to build
		var selectedKey;
		var random = Math.random() * sum;
		var selectedKey = keys[0];
		for ( var q = keys.length - 1; q >= 0; q-- ){
			
			if (random > sum) { 
				selectedKey = keys[q+1];
				break;
			}
			sum -= chances[q];
		}
		var template = Buildings.buildings[selectedKey]; //console.log(template);
		
		// Overriding template on special cases: mines will spawn always on ore vein tiles
		if ( plnt.tiles[index].oreVeinUUID != null ){
			template = Buildings.buildings["mine1"];
		}
		
		if (!template){ console.log("no valid template"); return false; }
		
		// Won't try to overwrite a building with another identical building
		if (ogtemplate == template){ console.log("template is the same (" + template.constructor.name + ")"); return false; }
		
		// This part adjusts the index so it doesnt overlap certain buildings when built on the edge of city limits
		var adjustedIndex = index;
		if (index == truemin){
			adjustedIndex = loopyMod( index - (template.size - 1), terrsize );
		}
/* 		for (var q = index; q <= index + template.size - 1; q++){
			var ci = loopyMod(q, terrsize);
			var oldbuildinguuid = plnt.tiles[ci].buildingUUID;
			if (oldbuildinguuid){ 
				
				if (plnt.isIndexLeftOfIndex( ci, this.centerIndex )){
					adjustedIndex--; 
				}else{
					adjustedIndex++;
				}
			}
		} */
		
		// This part creates the building given the template
		var bldg;
		switch (template.buildingtype){
			case "farm":
				bldg = new BuildingFarm( plnt.x, plnt.y, plnt.uuid, this.uuid, adjustedIndex, plnt.terrainSize);
				break;
			case "house":
				bldg = new BuildingHouse( plnt.x, plnt.y, plnt.uuid, this.uuid, adjustedIndex, plnt.terrainSize, selectedKey);
				break;
			case "mine":
				bldg = new BuildingMine( plnt.x, plnt.y, plnt.uuid, this.uuid, adjustedIndex, plnt.terrainSize);
				break;
		}
		
		if (!bldg){ console.log("no valid building"); return false; }
	
		// This part clears any buildings that may be already present in the space
		// It also checks if any of the tiles are underwater, or part of a Spaceport, which if they are, it will completely cancel
		for (var q = index; q <= index + template.size - 1; q++){
			var ci = loopyMod(q, terrsize);
			var ob = plnt.tiles[ci].getBuilding();
			var height = plnt.tiles[ci].height;
			if (height < 0){ console.log("Can't place building underwater!"); return false; }
			if (ob instanceof BuildingSpaceport){ console.log("Can't place building over spaceport"); return false;}
			if (!ob){ continue; }
			
			plnt.removeBuilding(ob);
			
/* 			var p = loopyMod(q, terrsize);
			var ob = plnt.tiles[p].getBuilding();
			if (!ob){ continue; }
			
			ob.dead = true;
			plnt.tiles[p].buildingUUID = null;
			var uuidIndex = this.buildingUUIDs.findIndex(ob.uuid);
			this.buildingUUID.splice(uuidIndex,1);  */ 
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
		
		var ende = building.endindex;
		if (building.endindex < building.startindex){
			ende += this.getPlanet().terrainSize;
		}
		for (var i = building.startindex; i <= ende; i++){
			
			var index = loopyMod(i, this.getPlanet().terrainSize);
			this.claimedTileIndexes.push(index);
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
	
	// Durstenfeld shuffle from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	shuffle(arrIn) {
		var a = arrIn.slice(0); // deep copy
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
}