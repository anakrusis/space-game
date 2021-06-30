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
		ItemStack
	};
	
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
				var p = eval(srcobj.type); //console.log(p);
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