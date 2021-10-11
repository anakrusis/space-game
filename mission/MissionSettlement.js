class MissionSettlement extends Mission {
	constructor(sourceCityUUID, item, body){
		super(sourceCityUUID);
		this.destination = new Place(body);
		
		var sorcecity = server.world.cities[ this.sourceCityUUID ];
		if (!sorcecity){ return; }
		
		this.distance = CollisionUtil.euclideanDistance( sorcecity.getSpaceport().x, sorcecity.getSpaceport().y, body.x, body.y );
		this.reward = 50 * Math.round ( this.distance / 300 );
		
		this.item = item;
		this.objectives = [ [ new ObjectivePlaceBuilding( this.item, this.destination ) ] ];
		
		this.displaytext  = "Settlement of " + this.destination.name + "\n";
		this.displaytext += "\n$" + this.reward;
		
		this.desc = "Several families are prepared to construct a settlement on the " + body.descriptor + " " + this.destination.name + ".\nOur nation wishes them safety and health in this great voyage.";
		this.failtext = "The mission to " + this.destination.name + " was unsuccessful.\nThis is a terrible loss for our nation, and we will remember the families who gave their lives on this day.\n"
		this.successtext = "The settlement on " + body.descriptor + " " + this.destination.name + " was successfully founded!\nOur nation rejoices at the wonder of a new city on the faraway " + body.descriptor + ".\nThis day will be remembered in history!\n";
		
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