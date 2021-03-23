class BodyPlanet extends EntityBody {
	constructor(x,y,dir,orbitDistance,starUUID){
		super(x, y, dir, RandomUtil.fromRangeF(32,64));
		
		this.starUUID = starUUID;
		
		this.orbitDistance = orbitDistance;
        this.orbitPeriod = RandomUtil.fromRangeI(200000, 500000);
        this.rotSpeed = 0.0005;
		
		this.color = [RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255)];
		
        this.canEntitiesCollide = true;

        this.terrainSize = (this.radius * (40/16));
        this.terrain = [];
        for (var i = 0; i < this.terrainSize; i++){
            this.terrain.push ( RandomUtil.fromRangeF(-0.5,1.6) );
        }
		
		this.orbitStart =  RandomUtil.fromRangeF(0, Math.PI * 2);
        this.orbitAngle = this.orbitStart;
		
		this.name = "Planet";
	}
	
	update(){
		super.update();
		
		this.orbitAngle += (Math.PI * 2) / this.orbitPeriod;
        this.x = rot_x(this.orbitAngle, this.orbitDistance,0) + this.getStar().getX();
        this.y = rot_y(this.orbitAngle, this.orbitDistance, 0) + this.getStar().getY();
	}
	
	getStar(){
		return this.getChunk().bodies[this.starUUID];
	}
	
	getOrbitAngle(){ return this.orbitAngle; }
	
	getOrbitPeriod(){ return this.orbitPeriod; }
	
	getOrbitDistance(){ return this.orbitDistance; }
}