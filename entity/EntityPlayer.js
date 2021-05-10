class EntityPlayer extends Entity {
	constructor(x, y, dir){
		super(x,y,dir);
		
		// Core Properties
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
		this.inventory = new Inventory(9);
		this.money = 0;
		
		// Physical properties
		this.boostForce = new ForceVector(0,0); // this is a buffer which pushes onto the forces array a boost value per tick
		this.lastBoostForce = new ForceVector(0,0); // last tick's, for reference
	
		// Referential properties
		this.nationUUID = null;
		this.currentMission = null;
	}
	
	getNation(){
		return server.world.nations[this.nationUUID];
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
	
	update(){
		if (this.nationUUID){
			this.color = this.getNation().color;
		}
		
		this.lastx = this.x; this.lasty = this.y; this.lastdir = this.dir;
		this.lastvel = this.velocity;
		this.lastangvel = this.angvel;
		this.lastangacc = this.angacc;
		
		
/* 		this.lastxvel = this.xvel; this.lastyvel = this.yvel;
		this.lastxacc = this.xacc; this.lastyacc = this.yacc; */
		//this.forceVectors.push(this.boostForce);
		this.boostForce.dir = this.dir;
		super.update();
		
		this.angvel = this.dir - this.lastdir;
		
		this.acc = this.velocity - this.lastvel;
		this.angacc = this.angvel - this.lastangvel;
		this.angjer = this.angacc - this.lastangacc;
		//this.xvel = this.x - this.lastx; this.yvel = this.y - this.lasty;
/* 		this.xacc = this.xvel - this.lastxvel; this.yacc = this.yvel - this.lastyvel;
		this.xjer = this.xacc - this.lastxacc; this.yjer = this.yacc - this.lastyacc; */
		
		cam_x = this.x; cam_y = this.y;
		
		if (this.grounded && this.getGroundedBody() != null) {
			
			var gb = this.getGroundedBody();
			if (gb instanceof BodyPlanet){
				
				var tile = CollisionUtil.tileFromEntityAngle(this, gb);
				if (tile){
					if (tile.hasRoad){
						this.boostForce.magnitude /= 1.01;
					}else{
						this.boostForce.magnitude /= 1.025;
					}
				}
			}
		}
		
		this.forceVectors.push(this.boostForce);
		
		if (this.boostForce.magnitude > 0.01 && this.ticksExisted % 10 == 0){
            var dir = (this.dir - Math.PI + (random() * 0.5));
            var smoke = new ParticleSmoke(this.x, this.y, dir);
            server.world.spawnEntity(smoke);
        }
		
		if (cam_zoom < 1.5){
			this.filled = framecount % 60 > 30;
		}else{
			this.filled = true;
		}
		
		if (this.currentMission){
			this.currentMission.update();
			
			if (this.currentMission.timeRemaining <= 0){
				
				this.currentMission.onFail();
				
			}
		}
	}
	
	onCrash(){
		this.dead = true;
		this.ticksExisted = 0; 
		this.velocity = 0;
		this.explode();
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