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
	
	static loadWorld(world){
		
		server.newWorld = new World();
		for (var property in world){

			//if (typeof property == 'object'){
		
				server.newWorld[property] = world[property];
		
			//}
		}
		server.world = server.newWorld;
	}
	
}