TITLE_VERSION = "Space Game pre alpha 0.1.2a";
BUILD_DATE = "2021-08-07"

var mainelement = document.getElementById("main");
document.title = TITLE_VERSION;

GUI_SCALE = 1.5;
MOUSE_SENSITIVITY = 1;
PLANET_CAM = true; cam_rot = 0;
FANCY_TEXT = false; LORES_MODE = false; TOUCH_MODE = false;
DPAD_DIST = 145; DPAD_SIZE = 150;

lasttouches = [];
options_buffer = {}; // This is used to buffer changes in the options menu
// Each key is an array containing a set of strings referring to the path of the variable
// and the value associated is the value assigned to said variable

shiftDown = false;
backspaceTimer = 0;
BACKSPACE_TIMER_AMT = 20;

selectedTextEntry = null;
buildingToPlace   = null;
cityName          = "";

class GuiHandler {	
	static elements    = []; // outermost parent elements here, child elements contained within..
	static allElements = [];
	
	static init(){
		
		if (getItem("GUI_SCALE")){
			GUI_SCALE = getItem("GUI_SCALE");
		}
		
		if (getItem("MOUSE_SENSITIVITY")){
			MOUSE_SENSITIVITY = getItem("MOUSE_SENSITIVITY");
		}
		
	}
	
	static update(){
		
		shiftDown = false;
		if (keyIsDown(16)){
			shiftDown = true;
		}
		if (keyIsDown(8) && selectedTextEntry){
			backspaceTimer--;
			if (backspaceTimer <= 0){
				
				if (framecount % 4 == 0){
					
					selectedTextEntry.setting = selectedTextEntry.setting.slice(0, -1);
					// = BACKSPACE_TIMER_AMT;
				}
			}
		}
		
		// Zoom keys
		if (keyIsDown(187)) { // plus
			cam_zoom += (cam_zoom / 25);
			
		}else if (keyIsDown(189)) { // minus
			cam_zoom -= (cam_zoom / 25);
		}
		
		if ( mouseIsPressed && touches.length == 0 ){
			
			for (var i = this.elements.length - 1; i >= 0; i--){
				var e = this.elements[i];
				if ((e.active || e.bypassActiveForClicks) && !e.parent && e.holdclick){
					e.click(mouseX, mouseY);
				}
			}
			bypassGameClick = false;
		}
		
		for (var i = 0; i < this.allElements.length; i++){
			var e = this.allElements[i];
			if (e.active){
				e.update();
			}
		}
		if (LORES_MODE && FANCY_TEXT){ GUI_SCALE = 2; }
		
		if (this.lastLoresMode != LORES_MODE){
			pixelDensity( LORES_MODE ? 0.5 : 1 );
		}
		this.lastLoresMode = LORES_MODE;
	}
	
	static openWindow( element ){
		
		// sets the previous outermost element to inactive
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.active = false;
			}
		}
		
		// Special case where these elements are inseperable, TODO maybe put these into a bigger super-group
		if (element == GROUP_INFOBAR){
			GROUP_HOTBAR.active = true;  GROUP_HOTBAR.show();
			BUTTON_MENU.active = true;   BUTTON_MENU.show();
			BTN_ZOOM_UP.active = true;   BTN_ZOOM_UP.show();
			BTN_ZOOM_DOWN.active = true; BTN_ZOOM_DOWN.show();
			// dpad
			BTN_DPAD_FWRD.active = true; BTN_DPAD_FWRD.show();
			BTN_DPAD_BWRD.active = true; BTN_DPAD_BWRD.show();
			BTN_DPAD_LEFT.active = true; BTN_DPAD_LEFT.show();
			BTN_DPAD_RGHT.active = true; BTN_DPAD_RGHT.show();
		}
		
		element.active = true;
		
		element.show();
		
	}
	
	static onClick(x,y){
		
		selectedTextEntry = null;
		
		for (var i = this.elements.length - 1; i >= 0; i--){
			var e = this.elements[i];
			if ((e.active || e.bypassActiveForClicks) && !e.parent){
				e.click(x,y);
			}
		}
	}
	
	static render(){
		
		scale(GUI_SCALE);
		fill(0);
		stroke(255);
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			e.render();
		}
		
		resetMatrix()
	}
	
	// The theoretical "building to place" if possible, given the players cursor position, nearest planet, etc... Returns null if not valid placement
	static getBuildingGhost(){
		//if (hoverEntity){ return null; }
		var p = client.world.getPlayer(); if (!p){ return null; }
		var nearbody = p.getNearestBody();
		var is = p.inventory.stacks[ p.inventory.selection ]; if (!is){ return null; }
		var it = Items.items[is.item];
		if (!(it instanceof ItemBuilding)){ return null; }
		var b = it.getBuilding();
		
		// Where the hypothetical building would be placed
		var cursorind = CollisionUtil.indexFromPosition( cursorAbsX, cursorAbsY, nearbody );
		var start = loopyMod(cursorind - Math.round( b.size / 2 ), nearbody.terrainSize);
		var end   = loopyMod(start + b.size, nearbody.terrainSize);
		
		var ende = (start > end) ? end + nearbody.terrainSize : end;
		
		// Iterates through each tile within the hypothetical buildings place
		for ( var i = start; i <= ende; i++ ){
			
			var tile = nearbody.tiles[ loopyMod(i, nearbody.terrainSize) ];
			if (tile.buildingUUID){ return null; }
			if (tile.height < 0){ return null; }
		}
		
		//b.cityUUID = new City(null,nearbody.getChunk().x,nearbody.getChunk().y,nearbody.uuid).uuid;
		b.getChunk = function(){
			return nearbody.getChunk();
		}
		b.grounded = true;
		b.groundedBodyUUID = nearbody.uuid;
		b.moveToIndexOnPlanet(b.startindex, nearbody, 1);
		b.planetUUID = nearbody.uuid;
		b.startindex = start; b.endindex = loopyMod(start + b.size, nearbody.terrainSize);
		
		b.update();
		// If either the cursor or the player are too far away then the building will not be able to be placed
		if (CollisionUtil.euclideanDistance(p.x, p.y, b.x, b.y) > 100){ return null; }
		if (CollisionUtil.euclideanDistance(p.x, p.y, cursorAbsX, cursorAbsY) > 100){ return null; }
		
		return b;
	}
	
	static drawBuildingGhost(){
		var b = (buildingToPlace) ? buildingToPlace : this.getBuildingGhost();
		if (b){ 
			var a = 64 * (2 + Math.sin(framecount / 4));
			b.color = [a,a,a];
			b.render(); 
		}
	}
	
	static drawSpaceportTooltips(){
		if ((MissionHandler.inPlaceForDelivery || MissionHandler.inPlaceForMission)){
			var planet = client.world.getPlayer().getGroundedBody();
			if (!planet){ return; }
			var index = client.world.getPlayer().terrainIndex;
			var building = planet.tiles[ index ].getBuilding();
			if (!building.isOnScreen()){ return; }
			
			//var tx = width / 2 - 
			var tx = tra_rot_x(building.x, building.y)
			var ty = tra_rot_y(building.x, building.y) - ( 6 * cam_zoom );
			
			fill(building.color[0], building.color[1], building.color[2]); noStroke();
			textAlign(CENTER);
			textSize(32 + cam_zoom/2);
			if (MissionHandler.inPlaceForDelivery){
				text( "[E] Deliver", tx, ty );
				
			} else if (MissionHandler.inPlaceForMission){
				if ( ! ( client.world.getPlayer().currentMission ) ){
					text( "[E] Missions...", tx, ty );
				}
			}
			textAlign(LEFT);
			textSize(16);
		}
	}
	
	// Draws the names of the cities pointing toward their location. The text is angled radially to point towards the center of the planet. The text will always face upward if possible.
	static drawCityLabels(){
		for (key in client.world.cities){
			
			if (cam_zoom < MIN_CITY_TEXT_ZOOM){ break; };
			
			var city = client.world.cities[key]; var nation = city.getNation();
			var centerslice = city.getPlanet().getAbsPointsSlice( city.centerIndex, city.centerIndex );
			var centerx = centerslice[0]; var centery = centerslice[1];
			
			var angle = city.getPlanet().dir + ( 2 * Math.PI ) * ( city.centerIndex / city.getPlanet().terrainSize );
			angle = loopyMod( angle, Math.PI*2 );
			
			var radius = 20 + (16 * cam_zoom);
			centerx += ( radius * Math.cos(angle)); centery += ( radius * Math.sin(angle));
			
			stroke( nation.color[0], nation.color[1], nation.color[2] ); 
			fill  ( nation.color[0], nation.color[1], nation.color[2] );
			
			push();
			translate(tra_x(centerx), tra_y(centery));
			
			var citystring;
			
			if (PLANET_CAM){
				angle -= (cam_rot + HALF_PI);
				angle = loopyMod(angle, Math.PI*2);
			}
			
			// This part here decides whether the text is facing up or down and adjusts the angle accordingly
			if (angle > Math.PI / 2 && angle < (3 * Math.PI)/2){
				angle -= Math.PI ;
				angle = loopyMod( angle, Math.PI*2 );
				textAlign(RIGHT);
				
				citystring = city.name + " →";
				if (client.world.getPlayer().getNation().getCapitalCity() == city){
					citystring = "⌂ " + citystring;
				}
			}else{
				textAlign(LEFT);
				citystring = "← " + city.name;
				if (client.world.getPlayer().getNation().getCapitalCity() == city){
					citystring = citystring + " ⌂";
				}
			}
			
			if (PLANET_CAM){
				angle += (cam_rot + HALF_PI);
			}
			
			rotate(angle);
			
			textSize(24);
			text(citystring, 0, 0);
			
			pop();
			textAlign(LEFT);
		}
	}
	
	static handleTouches(){
		
		for (var q = 0; q < touches.length; q++){
			
			for (var i = this.elements.length - 1; i >= 0; i--){
				var e = this.elements[i];
				if ((e.active || e.bypassActiveForClicks) && !e.parent && e.holdclick){
					e.click(touches[q].x, touches[q].y);
					
				}
			}
			bypassGameClick = false;
			
		}
		
		if (touches.length == 2 && lasttouches.length == 2){

			var thistickdist = CollisionUtil.euclideanDistance( touches[0].x, touches[0].y, touches[1].x, touches[1].y);
			var lasttickdist = CollisionUtil.euclideanDistance( lasttouches[0].x, lasttouches[0].y, lasttouches[1].x, lasttouches[1].y);

			var diff = thistickdist - lasttickdist;
			//console.log(diff);
			cam_zoom += ((cam_zoom / 25) * MOUSE_SENSITIVITY * (diff / 11 ))
		}
		// deep copy of last tick's touch events
		lasttouches = [];
		for (var i = 0; i < touches.length; i++){
			lasttouches[i] = touches[i];
		}
	}
}