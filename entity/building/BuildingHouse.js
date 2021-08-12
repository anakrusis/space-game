class BuildingHouse extends EntityBuilding {
	
	constructor(x,y,planetuuid, cityuuid, startindex, terrsize, template){
		super(x,y,planetuuid, cityuuid, startindex, terrsize);
		this.name = "House";
		this.size = 1;
		this.template = template;
	}
	
	getRelRenderPoints(){
		
		if (!this.template){
		
			//return [-1,-1,0.75,-1,0.75,1,-1,1,-1,-1,NaN,NaN,0.75,-1,2.5,-1,2.5,1,0.75,1,NaN,NaN,2.25,-1.25,3,-0.5,3.25,0,3,0.5,2.25,1.25,3,0.5,3.25,0,3,-0.5,NaN,NaN,2.75,-0.25,3,0,2.75,0.25,3,0,2.75,-0.25,NaN,NaN,2.25,-0.75,1.75,-0.75,1.75,-0.75,1.75,-0.5,2.25,-0.5,2.25,-0.75,NaN,NaN,2.25,0.5,1.75,0.5,1.75,0.5,1.75,0.75,2.25,0.75,2.25,0.5,NaN,NaN,2.25,-0.25,1.75,-0.25,1.75,0.25,2.25,0.25,2.25,-0.25,NaN,NaN,1.5,-0.75,1,-0.75,1,-0.5,1.5,-0.5,1.5,-0.75,NaN,NaN,1.5,-0.25,1,-0.25,1,0.25,1.5,0.25,1.5,-0.25,NaN,NaN,1.5,0.5,1,0.5,1,0.5,1,0.75,1.5,0.75,1.5,0.5,NaN,NaN,0.5,-0.75,0,-0.75,-0,-0.5,0.5,-0.5,0.5,-0.75,NaN,NaN,0.5,-0.25,-0,-0.25,-0,0.25,0.5,0.25,0.5,-0.25,NaN,NaN,0.5,0.5,-0,0.5,-0,0.5,-0,0.75,0.5,0.75,0.5,0.5,NaN,NaN,-1,-0.25,-0.5,-0.25,-0.5,0.25,-1,0.25,NaN,NaN,-0.25,0.5,-0.75,0.5,-0.75,0.75,-0.25,0.75,-0.25,0.5,NaN,NaN,-0.25,-0.75,-0.75,-0.75,-0.75,-0.5,-0.25,-0.5,-0.25,-0.75,NaN,NaN,]};
	
	//getRelRenderPoints(){
			return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,NaN,NaN,-0.5,-0.75,-0,-0.75,-0,-0.5,-0.5,-0.5,-0.5,-0.75,NaN,NaN,-0,0.5,-0,0.5,-0,0.75,-0.5,0.75,-0.5,0.5,-0,0.5,NaN,NaN,0.5,-1,0.5,1,NaN,NaN,1.25,0.25,1.5,0.25,1.5,0.75,0.75,0.75,NaN,NaN,];
		} else {
			return Buildings.buildings[this.template].getRelRenderPoints();
		}
	}
	
	//getRelRenderPoints(){
//return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,0.5,1,0.5,-1,0.5,-1,0.25,-0.75,1,0,0.25,0.75,0.5,1,1.5,0,0.5,-1,-1,-1,-1,-0.75,0.25,-0.75,-1,-0.75,-1,-0.25,-0.25,-0.25,-0.25,0.25,-1,0.25,-1,0.75,0.25,0.75,1,0,0.25,-0.75,0.5,-1,0.25,-0.75,0.25,0.75,0.25,-0.75,0.5,-1,]};
}