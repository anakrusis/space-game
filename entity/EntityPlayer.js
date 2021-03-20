class EntityPlayer extends Entity {
	constructor(x, y, dir){
		super(x,y,dir);
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
		
		this.boostForce = new ForceVector(0,0); // this is a buffer which pushes onto the forces array a boost value per tick
	}
	
	getAbsolutePoints() {
        var point1x = rot_x(this.dir,-0.5,0.4) + this.x;
        var point1y = rot_y(this.dir,-0.5,0.4) + this.y;

        var point2x = rot_x(this.dir,0.8,0.0) + this.x;
        var point2y = rot_y(this.dir,0.8,0.0) + this.y;

        var point3x = rot_x(this.dir,-0.5,-0.4) + this.x;
        var point3y = rot_y(this.dir,-0.5,-0.4) + this.y;

        return [ point1x, point1y, point2x, point2y, point3x, point3y ];
    }
	
	update(){
		this.boostForce.dir = this.dir;
		super.update();
		
		this.forceVectors.push(this.boostForce);
		
		if (this.velocity > 0.1 && this.ticksExisted % 10 == 0){
            var dir = (this.dir - Math.PI + (Math.random() * 0.5));
            var smoke = new ParticleSmoke(this.x, this.y, dir);
            server.world.spawnEntity(smoke);
        }
	}
}