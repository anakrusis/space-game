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