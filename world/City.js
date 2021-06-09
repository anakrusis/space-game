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
		
		if (this.getNation() == server.world.getPlayer().getNation()){
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
		
		// Removes delivery missions if the item to be delivered is not present in the citys inventory.
		// With the exception of passengers, who are not in the city inventory ever.
		
		if (Object.keys(server.world.cities).length > 1){
		
			for (var i = 0; i < this.availableMissions.length; i++){
				var mission = this.availableMissions[i];
				
				if (mission instanceof MissionDelivery){
					if (mission.item != Items.ITEM_PASSENGERS){
						
						if (this.resources.totalAmount( mission.item ) <= 0){
							
							this.availableMissions.splice(i,1);
						}
						
					}
				}
			}
			
			// Adds passenger missions if there is none already.
			var passenger_mission_found = false;
			
			for (var i = 0; i < this.availableMissions.length; i++){
				var mission = this.availableMissions[i];
				
				if (mission.item == Items.ITEM_PASSENGERS){
					passenger_mission_found = true; break;
				}
			}
			if (!passenger_mission_found){
				var keys = Object.keys( server.world.cities );
				var randomcity = this;
				while (randomcity == this){
					randomcity = server.world.cities[keys[ keys.length * random() << 0]];
				}
				var m = new MissionDelivery(this.uuid, randomcity.uuid, Items.ITEM_PASSENGERS, 20);
				this.availableMissions.push(m);
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
					var m = new MissionDelivery(this.uuid, randomcity.uuid, Items.ITEM_FOOD, food_amt);
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
					var m = new MissionDelivery(this.uuid, randomcity.uuid, Items.ITEM_IRON, iron_amt);
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