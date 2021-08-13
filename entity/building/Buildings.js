// Building template contains information regarding the structure of the building, the mid range of which a given tile density could most likely lead to its being built...
// These can be seen as like differing " species " of buildings, in the cases where the buildings have mostly the same behavior
class BuildingTemplate {
	constructor(){
		this.density = 50;
		this.size    = 1;
	}
}

// short 1 size house
class TemplateHouseSmall1 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 50;
		this.size = 1;
	}
	getRelRenderPoints(){
	return [-1,-1,0.5,-1,1.5,0,0.5,1,-1,1,-1,0.25,-0.25,0.25,-0.25,-0.25,-1,-0.25,-1,-1,0.5,-1,NaN,NaN,-0.5,-0.75,-0,-0.75,-0,-0.5,-0.5,-0.5,-0.5,-0.75,NaN,NaN,-0,0.5,-0,0.5,-0,0.75,-0.5,0.75,-0.5,0.5,-0,0.5,NaN,NaN,0.5,-1,0.5,1,NaN,NaN,1.25,0.25,1.5,0.25,1.5,0.75,0.75,0.75,NaN,NaN,]};
}

// tall 1 size house
class TemplateHouseSmall2 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 150;
		this.size = 1;
	}
	getRelRenderPoints(){
	return [-1,-1,0.75,-1,0.75,1,-1,1,-1,-1,NaN,NaN,0.75,-1,2.5,-1,2.5,1,0.75,1,NaN,NaN,2.25,-1.25,3,-0.5,3.25,0,3,0.5,2.25,1.25,3,0.5,3.25,0,3,-0.5,NaN,NaN,2.75,-0.25,3,0,2.75,0.25,3,0,2.75,-0.25,NaN,NaN,2.25,-0.75,1.75,-0.75,1.75,-0.75,1.75,-0.5,2.25,-0.5,2.25,-0.75,NaN,NaN,2.25,0.5,1.75,0.5,1.75,0.5,1.75,0.75,2.25,0.75,2.25,0.5,NaN,NaN,2.25,-0.25,1.75,-0.25,1.75,0.25,2.25,0.25,2.25,-0.25,NaN,NaN,1.5,-0.75,1,-0.75,1,-0.5,1.5,-0.5,1.5,-0.75,NaN,NaN,1.5,-0.25,1,-0.25,1,0.25,1.5,0.25,1.5,-0.25,NaN,NaN,1.5,0.5,1,0.5,1,0.5,1,0.75,1.5,0.75,1.5,0.5,NaN,NaN,0.5,-0.75,0,-0.75,-0,-0.5,0.5,-0.5,0.5,-0.75,NaN,NaN,0.5,-0.25,-0,-0.25,-0,0.25,0.5,0.25,0.5,-0.25,NaN,NaN,0.5,0.5,-0,0.5,-0,0.5,-0,0.75,0.5,0.75,0.5,0.5,NaN,NaN,-1,-0.25,-0.5,-0.25,-0.5,0.25,-1,0.25,NaN,NaN,-0.25,0.5,-0.75,0.5,-0.75,0.75,-0.25,0.75,-0.25,0.5,NaN,NaN,-0.25,-0.75,-0.75,-0.75,-0.75,-0.5,-0.25,-0.5,-0.25,-0.75,NaN,NaN,]};
}

class TemplateFarm2 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "farm";
		this.density = 10;
		this.size = 2;
	}
}

// Wrapper for the registry of all building templates
class Buildings {
	static buildings = {
		
		housesmall1: new TemplateHouseSmall1(),
		housesmall2: new TemplateHouseSmall2(),
		farm2:       new TemplateFarm2()
	};
}