class BuildingHouse extends EntityBuilding {
	
	constructor(x,y,planetuuid, cityuuid, startindex, terrsize, template){
		super(x,y,planetuuid, cityuuid, startindex, terrsize);
		this.name = "House";
		this.size = 1;
		this.densityaddamt = 0.1;
		this.template = template;
		if (this.template){
			this.size = Buildings.buildings[this.template].size;
		}
		this.endindex   = loopyMod(startindex + this.size - 1, terrsize);
	}
	
	getRelRenderPoints(){
		
		if (!this.template){
			return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,NaN,NaN,-0.5,-0.75,-0,-0.75,-0,-0.5,-0.5,-0.5,-0.5,-0.75,NaN,NaN,-0,0.5,-0,0.5,-0,0.75,-0.5,0.75,-0.5,0.5,-0,0.5,NaN,NaN,0.5,-1,0.5,1,NaN,NaN,1.25,0.25,1.5,0.25,1.5,0.75,0.75,0.75,NaN,NaN,];
		} else {
			var t = Buildings.buildings[this.template];
			var points = t.getRelRenderPoints();
			var deco   = t.getDecorPoints();
			//console.log(t.getDecorPoints());
			if (cam_zoom > 10){
				points.push( ...deco );
			}
			return points;
		}
	}
	
	//getRelRenderPoints(){
//return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,0.5,1,0.5,-1,0.5,-1,0.25,-0.75,1,0,0.25,0.75,0.5,1,1.5,0,0.5,-1,-1,-1,-1,-0.75,0.25,-0.75,-1,-0.75,-1,-0.25,-0.25,-0.25,-0.25,0.25,-1,0.25,-1,0.75,0.25,0.75,1,0,0.25,-0.75,0.5,-1,0.25,-0.75,0.25,0.75,0.25,-0.75,0.5,-1,]};
}