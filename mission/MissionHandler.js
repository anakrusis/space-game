// The mission handler routes certain in-game physical events to the corresponding objectives in the missions, if neccessary.
// if a player goes to a certain building, or a certain planet, etc., the mission handler will look for objectives
// that match these circumstances and check them off accordingly

class MissionHandler {
	
	static inPlaceForDelivery = false; static spaceportSelected = false;
	static inPlaceForMission  = false;
	
	static onMissionEnd(){
		this.inPlaceForDelivery = false;
	}

	static onPlayerGround( player, planet ){
	
		var mission = player.currentMission;
		//console.log("player grounded");
		if (mission){
		
			for (var i = 0; i < mission.objectives[mission.currentStage].length; i++){
			
				var cobj = mission.objectives[mission.currentStage][i]; // current objective
				
				if (cobj instanceof ObjectiveGoToPlace){
				
					if (cobj.place.uuid == planet.uuid){
						
						cobj.complete = true;
						
					}
				
				}
			}
		}
	}
	
	static onPlayerSelectEntity( player, entity ){
		
		this.spaceportSelected = false;
		if ( entity instanceof BuildingSpaceport ){
			
			//if ( entity.isIndexInBuilding( player.terrainIndex ) ) {
			
				this.spaceportSelected = true;
			
			//}
		
		}
	}
	
	static onPlayerPlaceBuilding( player, planet, item ){
		var mission = player.currentMission;
		if (mission){	
			for (var i = 0; i < mission.objectives[mission.currentStage].length; i++){
				var cobj = mission.objectives[mission.currentStage][i]; // current objective
				if (cobj instanceof ObjectivePlaceBuilding){
					if (cobj.item == item && planet.uuid == cobj.place.uuid){
						cobj.complete = true;
					}
				}
			}
		}
	}
	
	static onPlayerMoveToIndex( player, planet, index ){
		this.inPlaceForDelivery = false;
		var mission = player.currentMission;
		if (mission){
			
			for (var i = 0; i < mission.objectives[mission.currentStage].length; i++){
				var cobj = mission.objectives[mission.currentStage][i]; // current objective
				
				if (cobj instanceof ObjectiveBringItemToPlace){
				
					if (cobj.place.placetype == "building"){
			
						var building = cobj.place.get();
						
						if (building.isIndexInBuilding(index)){
							
							if ( building.getPlanet() == player.getGroundedBody() ){
								this.inPlaceForDelivery = true;
							}
						}
					}
				}
				
				if (cobj instanceof ObjectiveGoToPlace){
					
					if (cobj.place.placetype == "building"){
			
						var building = cobj.place.get();
						
						if (building.isIndexInBuilding(index)){
							
							if ( building.getPlanet() == player.getGroundedBody() ){
								cobj.complete = true;
							}
						}
					}
					
				}
			}
		}
		
		this.inPlaceForMission = false;
		
		var tiles = planet.tiles;
		if (tiles){
			var building = planet.tiles[ index ].getBuilding();
			
			if (building instanceof BuildingSpaceport){
				
				if ( building.getPlanet() == player.getGroundedBody() ){
					this.inPlaceForMission = true;
				}
			}
		}
		
/* 		if (selectedEntity instanceof BuildingSpaceport){
		
			if (selectedEntity.isIndexInBuilding(index)){
				
				this.inPlaceForMission = true;
			}
		} */
	}
}