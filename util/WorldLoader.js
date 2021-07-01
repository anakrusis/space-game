class WorldLoader {
	
	static acceptedBaseClasses = {
		World,
		Chunk,
		Entity,
		City,
		Nation,
		Tile,
		Mission,
		Objective,
		Place,
		Inventory,
		ItemStack,
		ForceVector
	};
	
	// will export a json string
	static saveWorld( sw ) {
			
		server.world.datestamp = new Date(Date.now());
		var d = JSON.stringify(server.world); var p = JSON.parse(d);
		
		var worldclone = this.loadWorld( p ); //console.log(worldclone);
		
		for (var chunk of worldclone.getLoadedChunks()){

			for (var uuid in chunk.bodies){
		
				var body = chunk.bodies[uuid];
				if (!( body instanceof BodyPlanet )){ continue; }
				
				body.tiles = [];
			}
		}
			
		return worldclone;
	}
	
	// sw = source world, dw = dest world
	static loadWorld(sw){
		
		var dw = this.loadObject(sw);
		
		// I'm not sure why but loadWorld() pollutes the server.world with a bunch of corrupt OreVein entities
		// so this gets rid of them by deleting entitys without a proper X position (wich is initialized in all good entities)
		
		for ( var uuid in server.world.entities ){
		
			var e = server.world.entities[uuid];	
			if ( e.x != 0 && !e.x ){
				delete server.world.entities[uuid];
			}
		}
		
		// Reinstating tile objects in situations where they are empty
		
		for (var chunk of dw.getLoadedChunks()){

			for (var uuid in chunk.bodies){
		
				var body = chunk.bodies[uuid];
				if (!( body instanceof BodyPlanet )){ continue; }
				if (body.tiles.length > 0){ continue; }
				
				body.tiles = [];
				for ( var i = 0; i < body.terrainSize; i++){
					
					// Checks if tiles have road
					var tile = new Tile( i, body.terrain[i] );
					if ( body.roads[i] ){
						tile.hasRoad = true;
					}
					
					// Checks if any ore veins or buildings have a spot on the tile
					for ( var entityuuid in dw.entities ) {
						
						var e = dw.entities[entityuuid];
						if ( (!(e instanceof EntityOreVein)) && (!(e instanceof EntityBuilding)) ){ continue; }
						
						var startindex = e.startindex; var endindex = e.endindex;
						if (endindex < startindex) { 
							endindex -= body.terrainSize;
						}
						
						for ( var q = startindex; q <= endindex; q++) {
							
							if (q == i){
								
								if (e instanceof EntityOreVein){  tile.oreVeinUUID  = e.uuid; }
								if (e instanceof EntityBuilding){ tile.buildingUUID = e.uuid; }
							}
						}
					}
					
					body.tiles[i] = tile;
				}
			}
		}
		
		return dw;
	}
	
	// loadObject is meant to be a versatile recursive object loader "thawer"
	
	static loadObject(srcobj){
		
		//console.log(srcobj);
		
		if ( Array.isArray( srcobj ) ){
			
			var destobj = [];
			
			for (var i = 0; i < srcobj.length; i++){
				
				destobj[i] = this.loadObject(srcobj[i]);
				
			}
			
		} else if ( typeof srcobj == 'object' && ( srcobj != null ) ){
			
			if ( srcobj.type ){
				
				// We remove all non alphanumeric characters so that when eval goes to evaluate the Class name there is no possibility for funny bisnis 
				
				var typestring = srcobj.type.replace(/\W/g, '')
				var p = eval(typestring); 
				
				// We ensure that only permissible base classes are used in the world construction
				var perm = false;
				for ( var classname in this.acceptedBaseClasses ){
					var cl = this.acceptedBaseClasses[classname];
					
					if ( new p() instanceof cl){ perm = true; break; }
				}
				if (!perm){ console.log("Non-allowed class found: " + typestring); return null; }
				
				var destobj = new p();
				
			} else {
				var destobj = {};
			}
			
			for (var property in srcobj){
				
				//console.log(property);
				//destobj[property] = srcobj[property];
				
				//if (typeof srcobj[property] == 'object' && srcobj[property] != null){
				
				destobj[property] = this.loadObject(srcobj[property]);
				
				//}
			}
		}else{
			return srcobj;
		}
		
		return destobj;
		
	}
}