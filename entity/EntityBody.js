class EntityBody extends Entity {
	constructor(x, y, dir, radius){
		super(x,y,dir);
		this.name = "Body";
		this.color = [255, 255, 255];
		this.renderPriority = 3;
		
		this.radius = radius;
		this.terrainSize = 16;
		this.terrain = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.canEntitiesCollide = false;
		
		this.explored = false;
	}
	
	render(){
		
		super.render();
		
		//if (cam_zoom > MAX_INTERPLANETARY_ZOOM){
			
			
		//}
		
	}
	
	update(){
		this.dir += this.rotSpeed;
		this.ticksExisted++;
	}
	
	// returns a "pizza slice" of points on the body, for optimization
	// (nowadays planets and other bodies are so big, that getAbsolutePoints() is really slow to iterate through, and can have up to thousands of elements)
	getAbsPointsSlice(startindex, endindex, radial_offset){
		
		if (!radial_offset){ var radial_offset = 0; }
		
		if (startindex < 0){
			startindex += this.terrainSize;
		}
		
		var ende = endindex;
		if (endindex < startindex){
			ende += this.terrainSize;
		}
		
		var points = [];
		for (var i = startindex; i <= (ende+1); i++){
			
			var index = loopyMod(i, this.terrainSize);
			
			var angle = this.dir + (index * (2 * Math.PI) / this.terrainSize)
            var pointx = rot_x(angle, this.radius + this.terrain[index] + radial_offset, 0.0) + this.x;
            var pointy = rot_y(angle, this.radius + this.terrain[index] + radial_offset, 0.0) + this.y;
			
			points.push(pointx); points.push(pointy);
		}
		return points;
	}
	
	getAbsolutePoints(){

        var absPoints = [];

        for (var i = 0; i < this.terrainSize; i++){
            var angle = this.dir + (i * (2 * Math.PI) / this.terrainSize);

            var pointx = rot_x(angle, this.radius + this.terrain[i], 0.0) + this.x;
            var pointy = rot_y(angle, this.radius + this.terrain[i], 0.0) + this.y;
			
			absPoints.push(pointx); absPoints.push(pointy);
        }

        return absPoints;
    }
	
	getRenderPoints(){
		
		var ap = this.getAbsolutePoints();
		
		return ap;
		
	}
	
	getRadius(){ return this.radius; }
}