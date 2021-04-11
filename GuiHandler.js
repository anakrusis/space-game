var mainelement = document.getElementById("main");

class GuiHandler {	
	static elements = []; // outermost parent elements here, child elements contained within..
	
	static update(){
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.update();
			}
		}
	}
	
	static openWindow( element ){
		
		// sets the previous outermost element to inactive
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.active = false;
			}
		}
		
		element.active = true;
		element.show();
		
	}
	
	static onClick(){
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.click();
			}
		}
	}
	
	static render(){
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			e.render();
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
			
			// This part here decides whether the text is facing up or down and adjusts the angle accordingly
			if (angle > Math.PI / 2 && angle < (3 * Math.PI)/2){
				angle -= Math.PI ;
				angle = loopyMod( angle, Math.PI*2 );
				textAlign(RIGHT);
				citystring = city.name + "🠖 ";
			}else{
				textAlign(LEFT);
				citystring = "🠔 " + city.name;
			}
			
			rotate(angle);
			
			textSize(24);
			text(citystring, 0, 0);
			
			pop();
			textAlign(LEFT);
		}
	}
}

// HOTBAR: Shows the cargo hold of items (nine in total for now)

var GROUP_HOTBAR = new GuiElement(0,0,500,500);
GROUP_HOTBAR.autosize = true; GROUP_HOTBAR.autopos = "left";

GROUP_HOTBAR.onUpdate = function(){
	var mid = width/2;
	this.y = height - this.height;
	this.x = mid + (-0.5) * this.width;
}

for (var i = 0; i < 9; i++){
	
	var he = new GuiElement( 0, 0, 64, 64, GROUP_HOTBAR ); he.index = i;
	
	he.onRender = function(){
		
		var plyr = client.world.player; var itemstk = client.world.player.inventory.get(this.index);
		if (itemstk){
			
			
			var scale = 18;
			var pts = itemstk.item.getRelRenderPoints();
			noFill()
			beginShape();
			for (i = 0; i < pts.length; i += 2){
				var px = (-pts[i+1]) * scale + this.dispx - this.padding + this.width/2; 
				var py = pts[i]   * scale + this.dispy - this.padding + this.height/2 - 4;
				vertex(px,py);
			}
			endShape(CLOSE);
			
			//this.text = itemstk.item.name;
			
		}else{
		}
	}
}

// MISSION INFO: Screen giving info on the particular mission selected

/* var GROUP_MISSION_INFO = new GuiGroup(0,0,"Mission Info"); GROUP_MISSION_INFO.hide(); GROUP_MISSION_INFO.panel.setWidth(500);

GROUP_MISSION_INFO.show = function(){
		
	this.panel.show();
	this.visible = true;
	this.panel.setPosition(width/2, height/2);	
	this.clearAllElements();
	
	var infostring = mission.getSourceCity().name + " to " + mission.getDestinationCity().name + "<br><br>";
	infostring += "$" + mission.reward;
	this.addHTML("text"); this.panel.setValue("text", infostring);	
	
	this.addButton("Accept", function(){
			
		//selectedMission = mission;
		GROUP_MISSION_INFO.hide(); GuiHandler.activeGroup = GROUP_INFOBAR;
		server.world.getPlayer().currentMission = selectedMission;
			
	});
	this.addButton("Back", function(){
			
		//selectedMission = mission;
		//GROUP_MISSIONS.hide(); GROUP_MISSION_INFO.show();
		GROUP_MISSIONS.show(); GROUP_MISSION_INFO.hide(); GuiHandler.activeGroup = GROUP_MISSIONS;
	});
} */

// MISSIONS: Menu with the list of missions available

var GROUP_MISSION_SELECT = new GuiElement(0, 0, 0, 0); GROUP_MISSION_SELECT.hide(); GROUP_MISSION_SELECT.autosize = true;

GROUP_MISSION_SELECT.onUpdate = function(){
	this.x = width/2; this.y = height/2;
}

GROUP_MISSION_SELECT.onShow = function(){
	
	if (!(selectedEntity instanceof BuildingSpaceport)){ return; }
	
	this.children = [];
	
	var selectedCity = selectedEntity.getCity();
	var missions = selectedCity.getAvailableMissions();
	
	for (mission of missions){
		
		var missionname = mission.getSourceCity().name + " ➔ " + mission.getDestinationCity().name;
		missionname += "\n$" + mission.reward;
		
		var button = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); button.text = missionname; button.mission = mission;
		button.onClick = function(){
			selectedMission = this.mission;
		}
	}
	
	var backbtn = new GuiElement(0,0,150,40,GROUP_MISSION_SELECT); backbtn.text = "Back";
	backbtn.onClick = function(){
		GROUP_MISSION_SELECT.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
	}
}

/* var GROUP_MISSIONS = new GuiGroup(0,0,"Missions"); GROUP_MISSIONS.hide(); GROUP_MISSIONS.panel.setWidth(500);
GROUP_MISSIONS.update = function(){
	//this.panel.setPosition(width/2 - , height/2);
}
GROUP_MISSIONS.show = function(){
	this.panel.show();
	this.visible = true;
	
	if (!(selectedEntity instanceof BuildingSpaceport)){ return; }
	
	this.clearAllElements();
	this.panel.setPosition(width/2, height/2);
	
	var selectedCity = selectedEntity.getCity();
	var missions = selectedCity.getAvailableMissions();
	
	for (mission of missions){
		
		var missionname = mission.getSourceCity().name + " to " + mission.getDestinationCity().name + "...";
		
		this.addButton(missionname, function(){
			
			selectedMission = mission;
			GROUP_MISSIONS.hide(); GROUP_MISSION_INFO.show(); GuiHandler.activeGroup = GROUP_MISSION_INFO;
			
		});
	}		
	this.addButton("Back", function(){ GROUP_MISSIONS.hide(); GuiHandler.activeGroup = GROUP_INFOBAR; });
} */

// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiElement(0,0,0,0); GROUP_INFOBAR.autosize = true;
var tittle = new GuiElement(0,0,300,40,GROUP_INFOBAR); tittle.text = "Space Game 0.0.1 2021-04-11"

var entityinfo = new GuiElement(0,0,300,40,GROUP_INFOBAR);
entityinfo.onUpdate = function(){
	var e = null;
	if (selectedEntity){
		e = selectedEntity;
	}else if (hoverEntity){
		e = hoverEntity;
	}
	
	if (e){
		// All entitys have names!!
		var infostring = "" + e.name + "\n";
		
		if (e instanceof BodyPlanet){
			var starname = e.getStar().name; infostring += "Planet of the " + starname + " system\n\n";
			
			var daylen = 2 * Math.PI / e.rotSpeed / 60 / 60;
			infostring += "• Day length: " + Math.round(daylen) + " Earth min.\n"
			var yearlen = e.orbitPeriod / 60 / 60;
			infostring += "• Year length: " + Math.round(yearlen) + " Earth min\n"
			
		}else if (e instanceof EntityBuilding){
			
			infostring += e.productionProgress + "/" + e.productionTime + "\n";
			
		}
		
		this.text = infostring;	
		this.show();
	}else{
		this.hide();
	}
}

//var info2 = new GuiElement(0,0,300,40,GROUP_INFOBAR);
var p = function(){
	if (selectedEntity instanceof EntityBuilding){
		var city = selectedEntity.getCity();
		var infostring = city.name + "\nCity of the " + city.getNation().name + " nation";
		
		this.text = infostring;
		this.show();
	}else{
		this.hide();
	}
}

var missionbutton = new GuiElement(0,0,150,40,GROUP_INFOBAR); missionbutton.text = "Missions...";
missionbutton.onUpdate = function(){

	if (selectedEntity instanceof BuildingSpaceport){
		this.show();
	}else{
		this.hide();
	}
	
}
missionbutton.onClick = function(){
	GuiHandler.openWindow( GROUP_MISSION_SELECT )
}