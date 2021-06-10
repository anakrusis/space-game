class WorldLoader {
	
	static classes = {
		World,
		Chunk,
		Entity,
		City,
		Nation,
		Tile,
		Mission,
		Objective,
		Place
	};
	
	// sw = source world, dw = dest world
	static loadWorld(sw){
		
		server.world = this.loadObject(sw);
		return;
		
		//var dw = new World();
		//server.newWorld = dw;
	
		for ( var i = 0; i < sw.chunks.length; i++ ){
			
			for ( var j = 0; j < sw.chunks[i].length; j++){
			
				var cx = sw.chunks[i][j].x; var cy = sw.chunks[i][j].y; //console.log(cx + " , " + cy);
				dw.chunks[i] = [];
				dw.chunks[i][j] = new Chunk(cx, cy); dw.chunks[i][j].bodies = {};
				
				// source chunk , destination chunk
				var sc = sw.chunks[i][j]; var dc = dw.chunks[i][j];
				
				for (var uuid in sc.bodies){
					var sb = sc.bodies[uuid]; //console.log(sb.name);
					
					var db = this.loadObject(sb);
					dc.bodies[db.uuid] = db;
				}
			}
		}
		
		// Source and destination city
		
		for ( var cityuuid in sw.cities ){
			
			var srccity = sw.cities[cityuuid]; //var destcity = new City();
/* 			for (var property in srccity){
				destcity[property] = srccity[property];
			} */
			
			dw.cities[srccity.uuid] = this.loadObject(srccity);;
		}
		
		// Source and destination nation
		
		for ( var nationuuid in sw.nations ){
			
			var sn = sw.nations[nationuuid]; var dn = new Nation();
			for (var property in sn){
				dn[property] = sn[property];
			}
			
			dw.nations[dn.uuid] = dn;
		}
		
		dw.entities = {};
		for (var uuid in sw.entities){
			var sourceentity = sw.entities[uuid];
			dw.entities[uuid] = this.loadObject(sourceentity);
		}
		
		dw.playerUUID = sw.playerUUID;
			
		//this.loadObject(world, server.newWorld);
		//for (var property in world){

			//if (typeof property == 'object'){
		
				//server.newWorld[property] = world[property];
		
			//}
		//}
		dw.loadedChunksX = sw.loadedChunksX;
		dw.loadedChunksY = sw.loadedChunksY;
		
		server.world = dw;
	}
	
	static loadMission(sm){
		
		var p = eval(sm.type); //console.log(p);
		var db = new p();
		
		for (var property in sm){
			destmission[property] = sm[property];
		}
		for (var i = 0; i < sm.objectives.length; i++){
			//var destplace = 
			for (var j = 0; j < sm.objectives[i].length; j++){

				//var sourceobjective = sm.objectives[i][j]; console.log(sourceobjective);
			
			}
		}
		
		destcity.availableMissions.push(destmission);
		
		return dm;
	}
	
	static loadBody(sb){
		
		var p = eval(sb.type); //console.log(p);
		var db = new p();
		
		for (var property in sb){
			
			//console.log(property);
			db[property] = sb[property];
		}
		
		return db;
	}
	
	// loadObject is meant to be a versatile recursive object loader "thawer"
	
	static loadObject(srcobj){
		
		console.log(srcobj);
		
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
		
/* 		console.log(srcobj);
		
		var destobj = {};
		
		if (typeof srcobj == 'object' && srcobj != null){
			
			var p = eval(srcobj.type); console.log(p);
			
			var destobj = new p();
		}
		
		for (var property in srcobj){
			
			destobj[property] = srcobj[property];
			
			if (typeof srcobj[property] == 'object'){
				destobj[property] = this.loadObject( srcobj[property] );
			}
		}
		return destobj; */
	}
}