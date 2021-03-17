class EntityPlayer extends Entity {
	constructor(x, y, dir){
		super(x,y,dir);
		this.name = "Player";
		this.color = [ 0, 255, 255 ];
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
}