class EntityParticle extends Entity {
	
	constructor(x,y,dir){
		super(x,y,dir);
		this.filled = false;
	}
	
	isDead() {
        return this.ticksExisted > 75;
    }
	
	update() {
        this.x += this.velocity * Math.cos(this.dir);
        this.y += this.velocity * Math.sin(this.dir);
        this.ticksExisted++;
    }
}

class ParticleSmoke extends EntityParticle {

    constructor(x, y, dir) {
        super(x, y, dir);
        this.velocity = 0.05;
        this.size = 0.02 + Math.random() * 0.2;
		this.color = [128, 128, 128];
    }

	getAbsolutePoints() {
        var point1x = rot_x(this.dir,-this.size,this.size) + this.x;
        var point1y = rot_y(this.dir,-this.size,this.size) + this.y;

        var point2x = rot_x(this.dir,this.size,0) + this.x;
        var point2y = rot_y(this.dir,this.size,0) + this.y;

        var point3x = rot_x(this.dir,-this.size,-this.size) + this.x;
        var point3y = rot_y(this.dir,-this.size,-this.size) + this.y;

        return [ point1x, point1y, point2x, point2y, point3x, point3y ];
    }
}