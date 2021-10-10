class City {
	constructor(nationuuid, chunkx, chunky, planetuuid){
		
		// core properties
		this.name = Nymgen.newName();
		
		this.uuid = Math.round(p5.prototype.random() * 10000000000);
		this.chunkx = chunkx;
		this.chunky = chunky;
		this.population = 0;
		this.pophistory = [];
		this.updateInterval = 240;
		this.updateTime = Math.floor( Math.random() * this.updateInterval );
		this.updateCount = 0;
		
		this.claimedTileIndexes = [];
		
		this.centerIndex = -1;
		
		// referential properties
		this.buildingUUIDs      = [];
		this.planetUUID = planetuuid;
		this.nationUUID = nationuuid;
		
		this.resources = new Inventory(100); // like a citywide collective inventory of goods..
		// I guess every city is like a centralized command economy because its simpler to program lmao
		this.resources.add( new ItemStack("food",30) ); // starting amount to kickstart city growth
		this.demands = {
			"food": 0,
		}
		this.foodTicksRemaining = null; // how much time left until starvation
		this.houseCount = 0; // how many houses (for food use calculation)
		
		this.availableMissions = [];
		
		this.type = this.constructor.name;
	}
	
	addPopulation(val){
		var plnt = this.getPlanet(); var l = this.claimedTileIndexes.length;
		for (var i = 0; i < l; i++){
			var ind = this.claimedTileIndexes[i];
			if (!plnt.densities[ind]){ plnt.densities[ind] = 0; }
			plnt.densities[ind] += ((val*10)/l);
		}
	}
	
	getChunk(){
		return server.world.chunks[this.chunkx][this.chunky];
	}
	
	getPlayerSpawnIndex(){
		return this.centerIndex;
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
	
	// Checks if a city contains both the smallest and largest index of the planets tiles, signifying it crosses the seam boundary
	isOnSeam(){
		var terrsize = this.getPlanet().terrainSize;
		return ( this.claimedTileIndexes.indexOf( terrsize - 1 ) != -1 ) && (this.claimedTileIndexes.indexOf( 0 ) != -1 );
	}
	
	getLeftIndex(){
		var plnt = this.getPlanet();
		if (this.isOnSeam()){
			// furthest left index must be selected the long way..
			var maxdist = 0; var index;
			for (var ind of this.claimedTileIndexes){
				if (!plnt.isIndexLeftOfIndex(ind,this.centerIndex)){ continue; }
				
				var currentdist = plnt.terrainIndexDistance( ind, this.centerIndex );
				if ( currentdist > maxdist ){
					maxdist = currentdist; index = ind;
				}
			}
			return index;
		}else{
			return Math.min(...this.claimedTileIndexes);
		}
	}
	
	getRightIndex(){
		var plnt = this.getPlanet();
		if (this.isOnSeam()){
			// ditto
			var maxdist = 0; var index;
			for (var ind of this.claimedTileIndexes){
				if (plnt.isIndexLeftOfIndex(ind,this.centerIndex)){ continue; }
				
				var currentdist = plnt.terrainIndexDistance( ind, this.centerIndex );
				if ( currentdist > maxdist ){
					maxdist = currentdist; index = ind;
				}
			}
			return index;
		}else{
			return Math.max(...this.claimedTileIndexes);
		}
	}
	
	update(){
		this.updateTime--;
		if (this.updateTime > 0){ return; }
		
		this.updateTime = this.updateInterval - 1; this.updateCount++;
		
		this.updateDensities(); this.doDensityEvent(); this.updateFood();
		
		var plnt = this.getPlanet();
		this.population = 0;
		for (var i = 0; i < this.claimedTileIndexes.length; i++){
			var ind = this.claimedTileIndexes[i];
			var d = plnt.densities[ind];
			if (d){
				this.population += Math.floor( d );
			}
		}
		this.population = Math.floor( this.population / 10 );
		this.pophistory.push(this.population);
	}
	
	updateFood(){
		if (this.updateCount % 5 == 0){
			// Base food use for city
			this.resources.shrink("food",1);
			// 1 food per house
			this.resources.shrink("food", this.houseCount );
		}
		
		var totalfood = this.resources.totalAmount("food");
		this.foodTicksRemaining = totalfood * this.updateInterval * 5 * (1 + this.houseCount);
		
		// Ideally strives for at least 8 food per house plus the base 8, to say that it is not in a state of want
		var idealfoodamt = 8 * (1 + this.houseCount);
		var ratio = totalfood / idealfoodamt;
		this.demands["food"] = Math.max(0, 1 - ratio);
	}
	
	updateDensities(){
		
		var densityaddamt; // now in the building classes
		//this.resources.shrink("food",1)
		this.houseCount = 0;
		
		for (var uuid of this.buildingUUIDs){
			var building = server.world.entities[uuid]; var plnt = this.getPlanet();
			if (!building.densityaddamt || building.abandoned){ continue; }
			densityaddamt = building.densityaddamt;
			
			// Just doing a count for now (later used in updateFood) but abandoned buildings don't count
			if (building instanceof BuildingHouse && !building.abandoned){ this.houseCount++; }
			
			// In the abscence of food, density will decrease? (testing out)
			if (this.resources.totalAmount("food") == 0){ 
				densityaddamt *= -1; 
			}
			
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
				plnt.densities[i] = Math.max(plnt.densities[i], 0);
			}
		}
	}
	
	// Picks a random index in the city bounds, or the near radius outside the city bounds
	// Will do a weighted random chance of picking a building to build based on the distances between them all
	// However there are many criteria which may make such building impossible to build, as detailed below
	doDensityEvent(){
		
		var plnt = this.getPlanet();
		var terrsize = plnt.terrainSize;

		var minindex = this.getLeftIndex(); var maxindex = this.getRightIndex();
		if (minindex > maxindex){ minindex -= terrsize; }
		var truemin  = loopyMod( minindex - 1, terrsize );
		var allIndices = [];
		
		// Randomly shuffles all the possible building indices, so as to not favor one side over another
		for (var i = minindex - 1; i <= maxindex + 1; i++){
			var ci = loopyMod(i,terrsize);
			var cb = this.getBuilding(ci);
			// And empty tiles are doubly represented, so as to strongly encourage empty land to be built upon
			if (!cb){ allIndices.push(ci); }
			allIndices.push(ci);
		}
		var shuffledIndices = this.shuffle(allIndices);
		
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
			
			// Special case where the chance of building farms is inflated during periods of food demand
			if (template.buildingtype == "farm"){
				chance *= ( 1 + ( 4 * this.demands["food"] ) );
			}
			
			// If the diff is 0, the chance will be INFINITY!!! so we have to replace this chance value with something really big but not infinity, or the weighted random will just totally break
			if (chance === Infinity){ chance = 10000; }
			
			chances.push(chance);
			keys.push(key);
			
			sum += chance;
		}
/* 		for (i = 0; i < keys.length; i++){
			console.log( keys[i] + ": " + chances[i]);
		} */
		
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
		if (ogtemplate == template){
			if (cb){
				if (!cb.abandoned){
					console.log("building template is the same (" + template.constructor.name + ")"); return false;
				}
			}
			console.log("template is the same (" + template.constructor.name + ")"); return false;
		}
		
		// This part adjusts the index so it doesnt overlap certain buildings when built on the edge of city limits
		var adjustedIndex = index;
		if (index == truemin){
			adjustedIndex = loopyMod( index - (template.size - 1), terrsize ); console.log("index adjusted (" + index + " -> " + adjustedIndex + ")");
		}
		
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
			case "none":
				if (this.demands["food"] > 0 && this.demands["food"] < 1 && cb instanceof BuildingFarm){
					if ( !cb.abandoned ){
						console.log("won't demolish farm due to food demand"); return false;
					}
				}else{
					//plnt.removeBuilding(cb); 
					if (cb){
						cb.abandon();
						console.log("building abandoned"); return true;
					}
				}
				break;
		}
		
		if (!bldg){ console.log("no valid building"); return false; }
		
		// There are now TWO PASSES which will check several things to ensure this spot is valid
			
		// FIRST PASS: checks if any of the tiles are underwater, part of another city, or part of a Spaceport, which if so, will cancel the construction
		for (var q = adjustedIndex; q < adjustedIndex + template.size; q++){
			var ci = loopyMod(q, terrsize);
			var ob = plnt.tiles[ci].getBuilding();
			if (ob instanceof BuildingSpaceport){ console.log("Can't place building over spaceport"); return false;}
			
			var height = plnt.tiles[ci].height;
			if (height < 0){ console.log("Can't place building underwater!"); return false; }
			
			var cc = plnt.tiles[ci].cityUUID;
			if (cc && cc != this.uuid){ console.log("Can't place building in another city"); return false; }
		}
		
		// SECOND PASS: This part clears any buildings that may be already present in the space where the new building will occupy
		for (var q = adjustedIndex; q < adjustedIndex + template.size; q++){
			var ci = loopyMod(q, terrsize);
			var ob = plnt.tiles[ci].getBuilding();
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
		
		// Clears out all missions
		for (var i = 0; i < this.availableMissions.length; i++){
			var mission = this.availableMissions[i];
			this.availableMissions.splice(mission);
		}
		
		this.updateExploreMissions();
		this.updateFoodMissions();
		//this.updateDeliveryMission( "passengers" );
		//this.updateDeliveryMission( "food" );
		//this.updateDeliveryMission( "iron" );
	}
	
	updateFoodMissions(){
		// City has to like, have food lol
		var totalamt = this.resources.totalAmount( "food" );
		if (totalamt < 5){ return; }
		// Will give away one fifth of total food, or 64, whichever is less
		var amt = Math.floor(totalamt / 5); amt = Math.min(64, amt);
		
		var cities = server.world.cities;
		for (var uuid in cities){
			var c = cities[uuid];
			if (c.demands["food"] > 0 && c != this){
				var m = new MissionDelivery(this.uuid, c.uuid, "food", amt);
				this.availableMissions.push(m);
			}
		}
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
/* 		// Can't have delivery missions if there aren't at least 2 cities
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
		this.availableMissions.push(m); */
	}
	
	updateExploreMissions(){
		// Only the home nation can give a player exploration missions
		if (this.getNation() != server.world.getPlayer().getNation()){ return; }
		
		for ( var uuid in server.world.getChunk(this.chunkx,this.chunky).bodies ){
			var b = server.world.getChunk(this.chunkx,this.chunky).bodies[uuid];
			if (!(b instanceof BodyPlanet)){ continue; }
			if (b.explored){
				
				var m = new MissionSettlement(this.uuid, "spaceport", b);
				this.availableMissions.push(m);
				
			}else{
				var m = new MissionExploration(this.uuid, b);
				this.availableMissions.push(m);
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