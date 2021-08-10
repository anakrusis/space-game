class BuildingHouse extends EntityBuilding {
	
	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,planetuuid, cityuuid, startindex, endindex);
		this.name = "House";
	}
	
	getRelRenderPoints(){
		return [1.5,-1,-1,-1,-1,1,1.5,1,1.5,-1,NaN,NaN,1,-0.5,1,0.5,-0.5,0.5,-0.5,-0.5,1,-0.5,NaN,NaN,0.75,-0.25,0.75,0.25,-0.25,0.25,-0.25,-0.25,0.75,-0.25,NaN,NaN,]};
	
	//getRelRenderPoints(){
//return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,0.5,1,0.5,-1,0.5,-1,0.25,-0.75,1,0,0.25,0.75,0.5,1,1.5,0,0.5,-1,-1,-1,-1,-0.75,0.25,-0.75,-1,-0.75,-1,-0.25,-0.25,-0.25,-0.25,0.25,-1,0.25,-1,0.75,0.25,0.75,1,0,0.25,-0.75,0.5,-1,0.25,-0.75,0.25,0.75,0.25,-0.75,0.5,-1,]};
}