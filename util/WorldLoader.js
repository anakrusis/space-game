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
		ForceVector,
		History,
		HistoryEvent,
		Random
	};
	
	// will export a json string
	static saveWorld( sw ) {
			
		server.world.datestamp = new Date(Date.now());
		var d = JSON.stringify(server.world); var p = JSON.parse(d);
		
		var worldclone = this.loadWorld( p ); //console.log(worldclone);
		
		for (var chunk of worldclone.getGeneratedChunks()){

			for (var uuid in chunk.bodies){
		
				var body = chunk.bodies[uuid];
				if (!( body instanceof BodyPlanet )){ continue; }
				
				body.terrain = [];
				body.tiles = [];
				body.forms = [];
			}
		}
			
		return worldclone;
	}
	
	// sw = source world, dw = dest world
	static loadWorld(sw){
		
		var dw = this.loadObject(sw);
		
		// I'm not sure why but loadWorld() pollutes the server.world with a bunch of corrupt OreVein entities
		// so this gets rid of them by deleting entitys without a proper X position (wich is initialized in all good entities)
		
/* 		for ( var uuid in server.world.entities ){
		
			var e = server.world.entities[uuid];	
			if ( e.x != 0 && !e.x ){
				delete server.world.entities[uuid];
			}
		} */
		
		// Reinstating tile objects in situations where they are empty, and also planet LOD forms 
		
		for (var chunk of dw.getLoadedChunks()){

			for (var uuid in chunk.bodies){
		
				var body = chunk.bodies[uuid];
				if (!( body instanceof BodyPlanet )){ continue; }
				
				// Performs a swap if the terrain is found to be empty:
				// the body's prng is replaced temporarily with a new one in its initial state.
				// the terrain is generated anew, and then the old rng with the latter state returns
				var emptyterrainflag = false;
				if ( body.terrain == [] ){
					var r = body.random;
					var tempr = new Random( r.seed );
					body.random = tempr;
					body.generateTerrain();
					
					body.random = r;
					emptyterrainflag = true;
				}
				
				body.initLOD();
				
				if (body.tiles.length > 0 && !emptyterrainflag){ console.log("no tilemaking"); continue; }
				
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
						// must actually be on the planet (wow!)
						if ( e.planetUUID != body.uuid ){ continue; }
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
		
		var e = dw.getPlayer().history.events;
		for (var i = 0; i < e.length; i++){
			e[i].date = new Date(e[i].date);
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