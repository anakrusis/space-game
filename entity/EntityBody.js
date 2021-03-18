class EntityBody extends Entity {
	constructor(x, y, dir, radius){
		super(x,y,dir);
		this.name = "Body";
		this.color = [255, 255, 255];
		this.radius = radius;
		this.terrain = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.canEntitiesCollide = false;
	}
	
	update(){
		this.dir += this.rotSpeed;
		this.ticksExisted++;
	}
	
	getAbsolutePoints(){

        var absPoints = [];

        for (var i = 0; i < this.terrain.length; i++){
            var angle = this.dir + (i * (2 * Math.PI) / this.terrain.length);

            var pointx = rot_x(angle, this.radius + this.terrain[i], 0.0) + this.x;
            var pointy = rot_y(angle, this.radius + this.terrain[i], 0.0) + this.y;
			
			//console.log(pointx + "," + pointy);
			
			absPoints.push(pointx); absPoints.push(pointy);
            //absPoints[2 * i] = pointx;
            //absPoints[(2 * i) + 1] = pointy;
        }

        return absPoints;
    }
}