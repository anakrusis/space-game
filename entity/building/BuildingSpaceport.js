class BuildingSpaceport extends EntityBuilding {

	constructor(x,y,planetuuid, cityuuid, startindex, terresize){
		super(x,y,planetuuid, cityuuid, startindex, terresize, 5);
		this.name = "Spaceport Hangar";
		this.size = 5;
		this.densityaddamt = 1;
	}
	
	render(){
		super.render();
	}

getRelRenderPoints(){
	return [-1,-5.75,-1,5.75,-4.5,5.75,-4.5,-5.75,-1,-5.75,NaN,NaN,-1,-5.75,2.5,-5.75,2.5,5.75,-1,5.75,-1,-5.75,NaN,NaN,2.5,-5.75,3.25,-3,3.5,-1,3.5,1,3.25,3,2.5,5.75,2.5,-5.75,NaN,NaN,]};
}