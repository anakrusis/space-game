class Objective {
	
	// empty container object for objectives
	
	constructor(){
		this.text = "Objective";
		this.complete = false;
	}
	
}

class ObjectiveBringItemToPlace extends Objective {
	
	constructor( item, quantity, place ){
		
		super();
		
		//var dest = server.world.cities[ destinationUUID ];
		var pn;
		if (place.type == "building"){
			pn = place.name + " in " + place.get().getCity().name;
		}
		
		this.text = "Bring " + quantity + " " + item.name + " to " + pn;
		
		this.item = item;
		this.quantity = quantity;
		this.place = place;
		//this.destinationUUID = destinationUUID;
		
	}

}

class ObjectiveGoToPlace extends Objective {
	
	constructor(place){
		super();
		
		if (place.type == "building"){
			
		}else
		if (place.type == "planet"){
			
			this.text = "Land on planet " + place.name;
			
		}
		this.place = place;
	}
}