var pts;

class EntityPlayer extends EntityShip {
	constructor(x, y, dir){
		super(x,y,dir);
		
		// Core Properties
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
		this.renderPriority = 5;
		this.inventory = new Inventory(9);
		this.inventory.add( new ItemStack ( "spaceport", 5 ) );
		this.money = 0;
		this.history = new History();
		
		// Physical properties
		this.boostForce = new ForceVector("Boost",0,0); // this is a buffer which pushes onto the forces array a boost value per tick
		this.maxBoost = 10;
	
		this.currentMission = null;
	}
	
	render(){

		stroke(this.color[0] / 2, this.color[1] / 2, this.color[2] / 2);
		//this.drawPointsTrailFromEntity(predictFuturePoints(this));
		
		//stroke(255);
		if (!this.grounded){
			pts = this.predictPoints2();
			this.drawPointsTrailFromEntity(pts);
		}
		
		super.render();
		
	}
	
	getBoostForce(){
		for (i = 0; i < this.forceVectors.length; i++){
			
			if (this.forceVectors[i].name == "Boost"){
				return this.forceVectors[i];
			}
		}
		if (this.boostForce){ return this.boostForce }
		return null;
		//return this.forceVectors[ this.boostForceIndex ];
	}
	
	update(){
		if (this.nationUUID){
			this.color = this.getNation().color;
		}
		
		this.lastx = this.x; this.lasty = this.y; this.lastdir = this.dir;
		this.lastvel = this.velocity;
		this.lastangvel = this.angvel;
		this.lastangacc = this.angacc;
		
		this.lastTerrainIndex = this.terrainIndex;
		
		this.getBoostForce().magnitude = Math.min( this.maxBoost, this.getBoostForce().magnitude );
		this.getBoostForce().magnitude = Math.max( 0, this.getBoostForce().magnitude );
		this.getBoostForce().dir = this.dir;
		
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