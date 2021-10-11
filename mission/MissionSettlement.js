class MissionSettlement extends Mission {
	constructor(sourceCityUUID, item, body){
		super(sourceCityUUID);
		this.destination = new Place(body);
		this.item = item;
		this.objectives = [ [ new ObjectivePlaceBuilding( this.item, this.destination ) ] ];
		
		this.displaytext  = "Settlement of " + this.destination.name + "\n";
		this.displaytext += "\n$" + this.reward;
		
		if (body){
			this.iconColor = body.color;
		}
	}
	
	onCancel(){
		super.onCancel();
		server.world.getPlayer().inventory.shrink(this.item, 1);
		server.world.getPlayer().inventory.shrink("passengers", 16);
	}
	
	onFail(){
		super.onFail();
		server.world.getPlayer().inventory.shrink("passengers", 16);
		server.world.getPlayer().inventory.shrink(this.item, 1);
	}
	
	onStart(){
		super.onStart();
		server.world.getPlayer().inventory.add( new ItemStack( "passengers", 16 ) );
		server.world.getPlayer().inventory.add( new ItemStack( this.item, 1 ) );
	}
	onSuccess(){
		super.onSuccess();
		server.world.getPlayer().inventory.shrink( "passengers", 16 );
	}
	
	getIcon(){
		
		var points = [];
		var pointscount = 10;

        for (var i = 0; i < pointscount; i++){
            var angle = frameCount/100 + (i * (2 * Math.PI) / pointscount);

            var pointx = rot_x(angle, 1, 0.0);
            var pointy = rot_y(angle, 1, 0.0);
			
			points.push(pointx); points.push(pointy);
        }

        return points;
	}
}