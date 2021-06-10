class BuildingFarm extends EntityBuilding {

	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,planetuuid, cityuuid, startindex, endindex);
		this.name = "Farm";
		this.productionItem = "food";
	}

	getRelRenderPoints(){
		var points = [-4.25,-2,-0.5,-2,4,-2,3.5,-2,3.75,-1.75,3.5,-2,3.75,-2.25,3.5,-2,-4.25,-2,-4.25,2,3,2,2.75,2,2.5,2,2.75,2.25,2.5,2,2.75,1.75,2.5,2,-4.25,2,-4.25,1,1.25,1,0.75,1,1,1.25,0.75,1,1,0.75,0.75,1,-4.5,1,-4.25,-1.5,3,-1.5,2.5,-1.5,2.75,-1.25,2.5,-1.5,2.75,-1.75,2.5,-1.5,-4.25,-1.5,-4.25,-0.25,2.25,-0.25,1.75,-0.25,1.5,-0.25,2,0,1.5,-0.25,2,-0.5,1.5,-0.25,-4.25,-0.25,-4.25,2,];
		
		return points;
	}
	
	getRenderPoints(){
		
		var relpoints = this.getRelRenderPoints();
		
		// This is a really silly three-liner that makes it so they appear to be "growing out of the ground" ahaha
		for (var i = 0; i < relpoints.length; i += 2){
			relpoints[i] += (-5) + (5* this.productionProgress / this.productionTime);
		}
		
		var abspoints = [];
		for (var i = 0; i < relpoints.length; i += 2){
			abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
			abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
		}
	
		// This part over here is making the fake "fence" of the farm which is really just a line parallel to the surface of the planet moved up a unit
		var planetslice = this.getPlanet().getAbsPointsSlice(this.startindex, this.endindex, 1);
		
		abspoints.push(planetslice[0], planetslice[1]);
		abspoints.push(planetslice[2], planetslice[3]);
		abspoints.push(planetslice[4], planetslice[5]);
		
		abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ relpoints.length - 2 ]) + this.x);
		abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ relpoints.length - 1 ]) + this.y);
		
		return abspoints;
	}
}