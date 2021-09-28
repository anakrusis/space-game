class MissionSettlement extends Mission {
	constructor(sourceCityUUID, item, body){
		super(sourceCityUUID);
		this.destination = new Place(body);
		this.item = item;
		this.objectives = [ [ new ObjectivePlaceBuilding( this.item, this.destination ) ] ];
		
		this.displaytext  = "Settlement of " + this.destination.name + "\n";
		this.displaytext += "\n$" + this.reward;
	}
	
	onCancel(){
		server.world.getPlayer().inventory.shrink(this.item, 1);
	}
	
	onFail(){
		super.onFail();
		
		server.world.getPlayer().inventory.shrink(this.item, 1);
	}
	
	onStart(){
		super.onStart();
		
		server.world.getPlayer().inventory.add( new ItemStack( this.item, 1 ) );
	}
}