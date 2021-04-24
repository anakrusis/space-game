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
		
		// Special case where these two are inseperable, TODO maybe put these into a bigger super-group
		if (element == GROUP_INFOBAR){
			GROUP_HOTBAR.active = true;
			GROUP_HOTBAR.show();
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
				
				citystring = city.name + " →";
				if (client.world.player.getNation().getCapitalCity() == city){
					citystring = "⌂ " + citystring;
				}
			}else{
				textAlign(LEFT);
				citystring = "← " + city.name;
				if (client.world.player.getNation().getCapitalCity() == city){
					citystring = citystring + " ⌂";
				}
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
			stroke(itemstk.item.color[0], itemstk.item.color[1], itemstk.item.color[2]);
			beginShape();
			for (i = 0; i < pts.length; i += 2){
				var px = (pts[i+1]) * scale + this.dispx - this.padding + this.width/2; 
				var py = (-pts[i])   * scale + this.dispy - this.padding + this.height/2 + 4;
				vertex(px,py);
			}
			endShape(CLOSE);
			
			stroke(255);
			textAlign(RIGHT);
			text(itemstk.amount, this.dispx + 48, this.dispy + 48 );
			textAlign(LEFT);
			
			//this.text = itemstk.item.name;
			
		}else{
		}
	}
}

// MISSION SUCCESS: When you succeed a mission

var GROUP_MISSION_SUCCESS = new GuiElement(0,0,500,500);
GROUP_MISSION_SUCCESS.autosize = true; GROUP_MISSION_SUCCESS.autopos = "top"; GROUP_MISSION_SUCCESS.hide();

GROUP_MISSION_SUCCESS.onUpdate = function(){
	this.x = width/2 - this.width/2; this.y = height/2 - this.height/2;
}

var toto = new GuiElement(0,0,300,40,GROUP_MISSION_SUCCESS);

var bobbobo = new GuiElement(0,0,150,40,GROUP_MISSION_SUCCESS); bobbobo.text = "Ok";
bobbobo.onClick = function(){
	GROUP_MISSION_SUCCESS.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}

// MISSION FAIL: When you fail a mission...

var GROUP_MISSION_FAIL = new GuiElement(0,0,500,500);
GROUP_MISSION_FAIL.autosize = true; GROUP_MISSION_FAIL.autopos = "top"; GROUP_MISSION_FAIL.hide();

GROUP_MISSION_FAIL.onUpdate = function(){
	this.x = width/2 - this.width/2; this.y = height/2 - this.height/2;
}

var tete = new GuiElement(0,0,300,40,GROUP_MISSION_FAIL);

var bb = new GuiElement(0,0,150,40,GROUP_MISSION_FAIL); bb.text = "Ok";
bb.onClick = function(){
	GROUP_MISSION_FAIL.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}

// MISSION CONFIRM: Menu giving mission details and asking you if your sure or not

var GROUP_MISSION_CONFIRM = new GuiElement(0,0,0,0); GROUP_MISSION_CONFIRM.hide(); GROUP_MISSION_CONFIRM.autosize = true;
GROUP_MISSION_CONFIRM.onUpdate = function(){
	this.x = width/2 - this.width/2; this.y = height/2 - this.height/2;
}
GROUP_MISSION_CONFIRM.onShow = function(){
	
	this.children = []; // For dynamic button arrangements, it has to reset each time or else they will just KEEP STACKING LOL
	
	var tittle = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); tittle.text = "Mission Confirmation";
	
	var missionname = selectedMission.item.name + " (" + selectedMission.quantity + ")\n" 
	missionname += selectedMission.getSourceCity().name + " ➔ " + selectedMission.getDestinationCity().name;
	missionname += "\n$" + selectedMission.reward;
	var missioninfo = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); missioninfo.text = missionname;
	missioninfo.onRender = function(){
		var scale = 18;
		var pts = selectedMission.item.getRelRenderPoints();
		noFill()
		stroke(selectedMission.item.color[0], selectedMission.item.color[1], selectedMission.item.color[2]);
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			var px = (pts[i+1]) * scale + this.dispx - this.padding*8 + this.width; 
			var py = (-pts[i])   * scale + this.dispy - this.padding*2 + this.height + 4;
			vertex(px,py);
		}
		endShape(CLOSE);
	}
	
	var t2 = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); t2.text = "Are you sure you want to\nbegin this mission?";

	var yesbtn = new GuiElement(0,0,150,40,GROUP_MISSION_CONFIRM); yesbtn.text = "Yea";
	yesbtn.onClick = function(){
		GROUP_MISSION_CONFIRM.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
		server.world.getPlayer().currentMission = selectedMission;
		
		var scm = selectedMission.getSourceCity().availableMissions;
		scm.splice( scm.indexOf( selectedMission ) );
		
		server.world.getPlayer().inventory.add( new ItemStack( selectedMission.item, selectedMission.quantity ) );
	}
	
	var backbtn = new GuiElement(0,0,150,40,GROUP_MISSION_CONFIRM); backbtn.text = "Nah";
	backbtn.onClick = function(){
		GROUP_MISSION_CONFIRM.hide(); GuiHandler.openWindow(GROUP_MISSION_SELECT);
	}
	
}

// MISSION SELECT: Menu with the list of missions available

var GROUP_MISSION_SELECT = new GuiElement(0, 0, 0, 0); GROUP_MISSION_SELECT.hide(); GROUP_MISSION_SELECT.autosize = true;

GROUP_MISSION_SELECT.onUpdate = function(){
	this.x = width/2 - this.width/2; this.y = height/2 - this.height/2;
}

GROUP_MISSION_SELECT.onShow = function(){
	
	if (!(selectedEntity instanceof BuildingSpaceport)){ return; }
	
	this.children = [];
	
	var selectedCity = selectedEntity.getCity();
	var missions = selectedCity.getAvailableMissions();
	
	if (missions.length == 0){
		var errtext = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); errtext.text = "Sorry, no missions available! You can check back some time soon.";
	}
	
	for (mission of missions){
		
		var missionname = mission.item.name + " (" + mission.quantity + ")\n" 
		missionname += mission.getSourceCity().name + " ➔ " + mission.getDestinationCity().name;
		missionname += "\n$" + mission.reward;
		
		var button = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); button.text = missionname; button.mission = mission;
		button.onClick = function(){
			selectedMission = this.mission;
			GROUP_MISSION_SELECT.hide(); GuiHandler.openWindow(GROUP_MISSION_CONFIRM);
		}
		button.onRender = function(){
			var scale = 18;
			var pts = this.mission.item.getRelRenderPoints();
			noFill()
			stroke(this.mission.item.color[0], this.mission.item.color[1], this.mission.item.color[2]);
			beginShape();
			for (i = 0; i < pts.length; i += 2){
				var px = (pts[i+1]) * scale + this.dispx - this.padding*8 + this.width; 
				var py = (-pts[i])   * scale + this.dispy - this.padding*2 + this.height + 4;
				vertex(px,py);
			}
			endShape(CLOSE);
		}
	}
	
	var backbtn = new GuiElement(0,0,150,40,GROUP_MISSION_SELECT); backbtn.text = "Back";
	backbtn.onClick = function(){
		GROUP_MISSION_SELECT.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
	}
}

// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiElement(0,0,0,0); GROUP_INFOBAR.autosize = true;
var tittle = new GuiElement(0,0,300,40,GROUP_INFOBAR); tittle.text = "Space Game pre alpha 0.1.1a\n2021-04-23"

var playerstatus = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
playerstatus.onUpdate = function(){
	var infostring = "$" + client.world.player.money;
	this.text = infostring;
}

var missioninfo = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
missioninfo.onUpdate = function(){
	var mission = client.world.player.currentMission;
	if (mission){
		var infostring = mission.getSourceCity().name + " to " + mission.getDestinationCity().name;
		var missiontime_min = ~~((mission.timeRemaining /60) / 60) ;
		var missiontime_sec = ~~((mission.timeRemaining /60) % 60 );
		
		var outtime = ""
		outtime += "" + missiontime_min + ":" + (missiontime_sec < 10 ? "0" : "");
		outtime += "" + missiontime_sec;
		
		infostring += " (" + outtime + ")" + "\n";
		
		infostring += "\n" + mission.desc;
		
		this.text = infostring;
		this.show();
	}else{
		this.hide();
	}
}

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
			infostring += "• Year length: " + Math.round(yearlen) + " Earth min"
			
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

var deliverbutton = new GuiElement(0,0,150,40,GROUP_INFOBAR); deliverbutton.text = "Deliver";
deliverbutton.onUpdate = function(){

	var mision = server.world.getPlayer().currentMission;
	this.hide();
	
	if (mision && selectedEntity instanceof EntityBuilding){
		
		if (mision.getDestinationCity() == selectedEntity.getCity()){
			
			var pindex = CollisionUtil.indexFromEntityAngle(server.world.getPlayer(), server.world.getPlayer().getNearestBody()); 
			if (selectedEntity.isIndexInBuilding(pindex)){
				this.show();
			}
		}
	}
	
}
deliverbutton.onClick = function(){
	server.world.getPlayer().currentMission.onSuccess();
}

var missionbutton = new GuiElement(0,0,150,40,GROUP_INFOBAR); missionbutton.text = "Missions...";
missionbutton.onUpdate = function(){

	this.hide();
	if (selectedEntity instanceof BuildingSpaceport){
		
		var pindex = CollisionUtil.indexFromEntityAngle(server.world.getPlayer(), server.world.getPlayer().getNearestBody()); 
		if (selectedEntity.isIndexInBuilding(pindex)){
			this.show();
		}
	}
	
}
missionbutton.onClick = function(){
	GuiHandler.openWindow( GROUP_MISSION_SELECT )
}