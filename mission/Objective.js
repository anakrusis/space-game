class Objective {
	
	// empty container object for objectives
	
	constructor(){
		this.text = "Objective";
		this.complete = false;
		
		this.type = this.constructor.name;
	}
	
}

class ObjectivePlaceBuilding extends Objective {
	constructor( itemid, place ){
		super();
		this.item = itemid;
		var itemobj = Items.items[itemid];
		this.place = place;
		this.text = "Place " + itemobj.name + " on " + place.get().descriptor + " " + place.name;
	}
}

class ObjectiveBringItemToPlace extends Objective {
	
	constructor( itemid, quantity, place ){
		
		super();
		
		//var dest = server.world.cities[ destinationUUID ];
		var pn;
		if (place){
			if (place.placetype == "building"){
				pn = place.name + " in " + place.get().getCity().name;
			}
		}
		
		var itemobj = Items.items[itemid];
		if (itemobj){
			this.text = "Bring " + quantity + " " + itemobj.name + " to " + pn;
		}
		
		this.item = itemid;
		this.quantity = quantity;
		this.place = place;
		//this.destinationUUID = destinationUUID;
		
	}

}

class ObjectiveGoToPlace extends Objective {
	
	constructor(place){
		super();
		
		if (!place){ return; }
		
		if (place.placetype == "building"){
			
			this.text = "Go to " + place.name + " in " + place.get().getCity().name;
			
		}else
		if (place.placetype == "planet"){
			
			this.text = "Land on " + place.get().descriptor + " " + place.name;
			
		}
		this.place = place;
	}
}