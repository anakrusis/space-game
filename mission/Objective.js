class Objective {
	
	// empty container object for objectives
	
	constructor(){
		this.text = "Objective";
		this.complete = false;
		
		this.type = this.constructor.name;
	}
	
}

class ObjectiveBringItemToPlace extends Objective {
	
	constructor( itemid, quantity, place ){
		
		super();
		
		//var dest = server.world.cities[ destinationUUID ];
		var pn;
		if (place.type == "building"){
			pn = place.name + " in " + place.get().getCity().name;
		}
		
		var itemobj = Items.items[itemid];
		this.text = "Bring " + quantity + " " + itemobj.name + " to " + pn;
		
		this.item = itemid;
		this.quantity = quantity;
		this.place = place;
		//this.destinationUUID = destinationUUID;
		
	}

}

class ObjectiveGoToPlace extends Objective {
	
	constructor(place){
		super();
		
		if (place.type == "building"){
			
			this.text = "Go to " + place.name + " in " + place.get().getCity().name;
			
		}else
		if (place.type == "planet"){
			
			this.text = "Land on planet " + place.name;
			
		}
		this.place = place;
	}
}