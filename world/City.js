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
	
	generateMissions(){
		this.availableMissions = [];
		var missioncount = 3;
		
		for (var i = 0; i < this.resources.length; i++){
			
		}
		
/* 		for (var i = 0; i < missioncount; i++){
			
			var keys = Object.keys( server.world.cities );
			var randomcity = this;
			while (randomcity == this){
				randomcity = server.world.cities[keys[ keys.length * random() << 0]];
			}
			var m = new Mission(this.uuid, randomcity.uuid);
			this.availableMissions.push(m);
		} */
	}
	
	getAvailableMissions(){
		return this.availableMissions;
	}
	
	update(){
		for (var i = 0; i < this.availableMissions.length; i++){
			var mission = this.availableMissions[i];
			
			// Removes delivery missions if the item to be delivered is not present in the citys inventory
			if (this.resources.totalAmount( mission.item ) <= 0){
				
				this.availableMissions.splice(i,1);
			}
		}
		
		// Adds delivery missions if there is a surplus of certain items in the citys inventory, 
		// and no existing missions that already plan on delivering it
		
		var food_amt = this.resources.totalAmount( Items.ITEM_FOOD );
		if (food_amt > 0){
			
			var food_mission_present = false;
			for (var i = 0; i < this.availableMissions.length; i++){
				var mission = this.availableMissions[i];
				if (mission.item == Items.ITEM_FOOD){
					food_mission_present = true;
				}
			}
			
			if (!food_mission_present){
				var keys = Object.keys( server.world.cities );
				var randomcity = this;
				while (randomcity == this){
					randomcity = server.world.cities[keys[ keys.length * random() << 0]];
				}
				var m = new Mission(this.uuid, randomcity.uuid, Items.ITEM_FOOD, food_amt);
				this.availableMissions.push(m);
			}
		
		}
		var iron_amt = this.resources.totalAmount( Items.ITEM_IRON );
		if (iron_amt > 0){
			
			var iron_mission_present = false;
			for (var i = 0; i < this.availableMissions.length; i++){
				var mission = this.availableMissions[i];
				if (mission.item == Items.ITEM_IRON){
					iron_mission_present = true;
				}
			}
			
			if (!iron_mission_present){
				var keys = Object.keys( server.world.cities );
				var randomcity = this;
				while (randomcity == this){
					randomcity = server.world.cities[keys[ keys.length * random() << 0]];
				}
				var m = new Mission(this.uuid, randomcity.uuid, Items.ITEM_IRON, iron_amt);
				this.availableMissions.push(m);
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