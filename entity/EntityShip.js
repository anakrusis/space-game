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
	
	predictPoints2(){
		if (!pathPredictEnabled){ return [[],[]]; }
		var futurePointsX = [];
		var futurePointsY = [];
		var nearbody = this.getNearestBody();
		
		var cx = this.x; var cy = this.y; var cdir = this.dir;
		var fv = [];
		var boost = null; var grav = null; // there are pointers to named forces in fv. they can be modified without affecting the real ships values
		
		// fv is a deep copy of the ship's set of forces at any given moment.
		// While iterating to make a copy, it also identifys the boost force and the gravity force if present
		for (var p = 0; p < this.forceVectors.length; p++){
			var f = this.forceVectors[p];
			
			if (f.name == "Boost")  { boost = f }
			if (f.name == "Gravity"){ grav = f }

			fv.push( new ForceVector( f.name, f.magnitude, f.dir ) );
		
		}
	
		for (var q = 0; q < 10; q++){
			
			futurePointsX.push(cx); futurePointsY.push(cy);
			
			boost.dir = cdir;
			
			var magnitudeSum = 0;
			for (var force of fv){
				magnitudeSum += Math.abs(force.magnitude);
			}
			
			var forcesXSum = 0; var forcesYSum = 0;
			for (var i = 0; i < fv.length; i++){
				var force  = fv[i];
				var magratio = (force.magnitude / magnitudeSum);
				
				var forcex = Math.cos(force.dir); var forcey = Math.sin(force.dir);
				forcesXSum += forcex * magratio; forcesYSum += forcey * magratio;
				
				//this.velocity += 0.001 * force.magnitude;
				cx += force.magnitude * Math.cos(force.dir);
				cy += force.magnitude * Math.sin(force.dir);
			}
			//forcesXSum /= this.forceVectors.length; forcesYSum /= this.forceVectors.length;
			avgDirection = Math.atan2(forcesYSum, forcesXSum);
			if (avgDirection && !this.grounded){
				cdir = avgDirection;
			}
			
			
			
/* 			x += this.boostForce.magnitude * Math.cos(this.boostForce.dir);
			y += this.boostForce.magnitude * Math.sin(this.boostForce.dir); */
		}
		
		return [futurePointsX, futurePointsY];
	}
	
	// This function accepts any set of points and draws it as coming out of the ship's body. The color can be set before calling
	drawPointsTrailFromEntity(points){
		if (!this.isDead()){
			var fx = this.x; var fy = this.y;
			var futurePointsX = points[0]; var futurePointsY = points[1];
			
			noFill();
			beginShape();
			for (var i = 0; i < futurePointsX.length; i+=1){
				
				fx = futurePointsX[i]; fy = futurePointsY[i];
				
				vertex(tra_rot_x(fx,fy),tra_rot_y(fx,fy));
				
			}
			endShape();
		}
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
				if (body.canEntitiesCollide && !(body instanceof BodyOcean)){
					nearestdist = dede;
					nearestplanet = body;
					//if (this.ticksExisted < 5){console.log(nearestplanet.name);};
				}
			}
		}
		return nearestplanet;
	}
}