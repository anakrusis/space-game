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
		var bgr = nearbody.getGravityBody()
		
		var cx = this.x; var cy = this.y; var cdir = this.dir;
		var fv = [];
		// there are pointers to named forces in fv. they can be modified without affecting the real ships values
		var boost = null; var grav = null; var buoy = null;
		
		// fv is a deep copy of the ship's set of forces at any given moment.
		// While iterating to make a copy, it also identifys the boost force and the gravity force if present
		for (var p = 0; p < this.forceVectors.length; p++){
			var f = this.forceVectors[p];
			var nf = new ForceVector( f.name, f.magnitude, f.dir );
			
			if (f.name == "Boost")  { boost = nf }
			if (f.name == "Gravity") { grav = nf }
			if (f.name == "Buoyancy"){ buoy = nf }

			fv.push( nf );
		}
		
		//console.log(boost);
	
		for (var q = 0; q < 1000; q++){
			
			futurePointsX.push(cx); futurePointsY.push(cy);
			
			if (boost){ boost.dir = cdir; }
			
			// force handler
			
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
				
				cx += force.magnitude * Math.cos(force.dir);
				cy += force.magnitude * Math.sin(force.dir);
			}
			var avgDirection = Math.atan2(forcesYSum, forcesXSum);
			if (avgDirection && !this.grounded){
				cdir = avgDirection;
			}
			
			var distance = CollisionUtil.euclideanDistance(cx, cy, bgr.getX(), bgr.getY());
			
			// Gravity simulation
			if (grav){
				var annulusPosition = (-1 / (bgr.getRadius() - nearbody.getRadius())) * ( distance - nearbody.getRadius() ) + 1;
				var forceMagnitude;
				if (nearbody instanceof BodyStar){
					forceMagnitude = 0.05 * annulusPosition;
				}else{
					forceMagnitude = 0.05 * annulusPosition;
				}
				var angleFromCenter = Math.atan2(cy - bgr.getY(), cx - bgr.getX());
				grav.magnitude = 0 - forceMagnitude; grav.dir = angleFromCenter;
			}
			
			// Below the surface of the planet? no more predicting
			var ind = CollisionUtil.indexFromPosition( cx, cy, nearbody );
			if (distance < nearbody.radius + nearbody.terrain[ind] ){
				break;
			}
			
			// Enacting the buoyancy force
			if ( nearbody.oceanUUID != null && distance < nearbody.radius ){
				var forceMagnitude = 0.07;
				var angleFromCenter = Math.atan2(cy - nearbody.getY(), cx - nearbody.getX());
				if (!buoy){
					buoy = new ForceVector("Buoyancy", forceMagnitude, angleFromCenter);
					fv.push(buoy);
				}
				buoy.magnitude = forceMagnitude; buoy.dir = angleFromCenter;
			// Stopping the buoyancy force
			}else{
				if (buoy){
					buoy.magnitude = 0;
				}
			}
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
			for (var i = 0; i < futurePointsX.length; i+=10){
				
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