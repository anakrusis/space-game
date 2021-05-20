class EntityShip extends Entity {
	
	constructor(x, y, dir){
		
		super(x,y,dir);
		
		// Core Properties
		this.name = "Ship";
		
		// Referential properties
		this.nationUUID = null;
	}
	
	update(){
		
		if (this.nationUUID){
			this.color = this.getNation().color;
		}
		
		super.update();
	
	}
	
	render(){
		
		if (cam_zoom < 1.5){ this.scale = 20/cam_zoom; } else { this.scale = 1; }
		
		super.render();
		
	}
	
	getAbsolutePoints() {
		//if (cam_zoom < 1.5){ scale = 20 / cam_zoom; } else { scale = 1; }
		var scale = 1;
		
        var point1x = rot_x(this.dir,-0.5*scale,0.4*scale) + this.x;
        var point1y = rot_y(this.dir,-0.5*scale,0.4*scale) + this.y;

        var point2x = rot_x(this.dir,0.8*scale,0.0) + this.x;
        var point2y = rot_y(this.dir,0.8*scale,0.0) + this.y;

        var point3x = rot_x(this.dir,-0.5*scale,-0.4*scale) + this.x;
        var point3y = rot_y(this.dir,-0.5*scale,-0.4*scale) + this.y;

        return [ point1x, point1y, point2x, point2y, point3x, point3y ];
    }
	
	getNation(){
		return server.world.nations[this.nationUUID];
	}
	
	moveToSpawnPoint(){
		var homenation = server.world.nations[this.nationUUID];
		var homeplanid = homenation.homePlanetUUID;
		var homechunkx = homenation.homeChunkX; var homechunky = homenation.homeChunkY;
		var homeplanet = server.world.chunks[homechunkx][homechunky].bodies[homeplanid];
		
		var homecity   = homenation.getCapitalCity(); var homeindex = homecity.getPlayerSpawnIndex();
		this.moveToIndexOnPlanet(homeindex, homeplanet, 0);
	}
	
	getNearestBody(){
		var nearestdist = 100000000;
		var nearestplanet = null;
		for (var uuid in this.getChunk().bodies){
			var body = this.getChunk().getBody(uuid);
			
			var dede = CollisionUtil.euclideanDistance(this.x, this.y, body.x, body.y);
			//if (this.ticksExisted < 5){ console.log("nearest:" + nearestdist + " dist:" + dede); };
			
			if (dede <= nearestdist){
				if (body.canEntitiesCollide){
					nearestdist = dede;
					nearestplanet = body;
					//if (this.ticksExisted < 5){console.log(nearestplanet.name);};
				}
			}
		}
		return nearestplanet;
	}
}