class EntityPlayer extends Entity {
	constructor(x, y, dir){
		super(x,y,dir);
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
		this.boostForce = new ForceVector(0,0); // this is a buffer which pushes onto the forces array a boost value per tick
		this.futurePointsX = [];
		this.futurePointsY = [];
		
		this.nationUUID = null;
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
			this.color = server.world.nations[this.nationUUID].color;
		}
		
		this.lastx = this.x; this.lasty = this.y; this.lastdir = this.dir;
		this.boostForce.dir = this.dir;
		super.update();
		cam_x = this.x; cam_y = this.y;
		
		if (this.grounded && this.getGroundedBody() != null) {
			this.boostForce.magnitude /= 1.01;
		}
		
		this.forceVectors.push(this.boostForce);
		
		if (this.velocity > 0.1 && this.ticksExisted % 10 == 0){
            var dir = (this.dir - Math.PI + (Math.random() * 0.5));
            var smoke = new ParticleSmoke(this.x, this.y, dir);
            server.world.spawnEntity(smoke);
        }
		
		if (cam_zoom < 1.5){
			this.filled = framecount % 60 > 30;
		}else{
			this.filled = true;
		}
	}
	
	onCrash(){
		this.explode();
	}
}