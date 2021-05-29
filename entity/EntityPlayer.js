class EntityPlayer extends EntityShip {
	constructor(x, y, dir){
		super(x,y,dir);
		
		// Core Properties
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
		this.renderPriority = 5;
		this.inventory = new Inventory(9);
		this.money = 0;
		
		// Physical properties
		this.boostForce = new ForceVector(0,0); // this is a buffer which pushes onto the forces array a boost value per tick
		this.lastBoostForce = new ForceVector(0,0); // last tick's, for reference
	
		this.currentMission = null;
	}
	
	render(){
		
		updateTrajectory(this);

		stroke(this.color[0] / 2, this.color[1] / 2, this.color[2] / 2);
		
		drawPointsTrailFromEntity(this, predictFuturePoints(this));
		
		if (touches.length == 1){
		
			stroke(255);
			
			for ( var i = 0; i < 4; i++ ){
				
				var angle = HALF_PI * i;
				
				if (PLANET_CAM){
					angle -= cam_rot;
				}
				 
				var rotx = rot_x( angle + client.world.player.dir, 300, 300 ) + width/2;
				var roty = rot_y( angle + client.world.player.dir, 300, 300 ) + height/2;
				
				line( width/2, height/2, rotx, roty );
				
			}
			
		}
		
		super.render();
		
	}
	
	update(){
		if (this.nationUUID){
			this.color = this.getNation().color;
		}
		
		this.lastx = this.x; this.lasty = this.y; this.lastdir = this.dir;
		this.lastvel = this.velocity;
		this.lastangvel = this.angvel;
		this.lastangacc = this.angacc;
		
		this.lastTerrainIndex = this.terrainIndex;//CollisionUtil.indexFromEntityAngle(this, this.getNearestBody());
		
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
		cam_rot = Math.atan2( this.y - this.getNearestBody().y, this.x - this.getNearestBody().x );
		
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
		}
		
		this.terrainIndex = CollisionUtil.indexFromEntityAngle(this, this.getNearestBody());
		
		if (this.terrainIndex != this.lastTerrainIndex){
			
			MissionHandler.onPlayerMoveToIndex(this, this.getNearestBody(), this.terrainIndex);
		}
	}
	
	onCrash(){
		this.dead = true;
		this.ticksExisted = 0; 
		this.velocity = 0;
		this.explode();
	}
}