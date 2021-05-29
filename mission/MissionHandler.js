// The mission handler routes certain in-game physical events to the corresponding objectives in the missions, if neccessary.
// if a player goes to a certain building, or a certain planet, etc., the mission handler will look for objectives
// that match these circumstances and check them off accordingly

class MissionHandler {
	
	static inPlaceForDelivery = false;

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
	
	
	static onPlayerMoveToIndex( player, planet, index ){
		
		console.log("player moved to " + index);
		
		var mission = player.currentMission;
		
		//GROUP_INFOBAR.BTN_DELIVER.hide();
		if (mission){
			
			for (var i = 0; i < mission.objectives[mission.currentStage].length; i++){
			
				var cobj = mission.objectives[mission.currentStage][i]; // current objective
				
				if (cobj instanceof ObjectiveBringItemToPlace){
				
					if (cobj.place.type == "building"){
			
						var building = cobj.place.get();
						
						if (building.isIndexInBuilding(index)){
							
							//GROUP_INFOBAR.BTN_DELIVER.show();
							
						}
					}
				}
			}
		}
	}
}