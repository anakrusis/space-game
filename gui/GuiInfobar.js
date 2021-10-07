// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiElement(0,0,0,0); GROUP_INFOBAR.autosize = true;
var tittle = new GuiElement(0,0,300,40,GROUP_INFOBAR); tittle.text = TITLE_VERSION + "\n" + BUILD_DATE;
tittle.onClick = function(){
	GuiHandler.openWindow(GROUP_WELCOME);
}

GROUP_INFOBAR.BTN_BACK = new GuiElement(0,0,150,40); GROUP_INFOBAR.BTN_BACK.text = "Options..."
GROUP_INFOBAR.BTN_BACK.onUpdate = function(){
	//var mid = width/2;
	this.y = height/GUI_SCALE - this.height;

}
GROUP_INFOBAR.BTN_BACK.onClick = function(){
	GuiHandler.openWindow(GROUP_MAINMENU);
}

var playerstatus = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
playerstatus.onUpdate = function(){
	if (!client.world.getPlayer()){ return; }
	
	var infostring = "Speed: \n" //+ client.world.getPlayer().getBoostForce().magnitude + "\n"
	infostring += "$" + client.world.getPlayer().money;
	this.text = infostring;
}

playerstatus.onRender = function(){
	var offset = FANCY_TEXT ? 102 : 65;
	var x = this.dispx + offset;
	var y = this.dispy + this.padding + 3;
	var barwidth = FANCY_TEXT ? 175 : 220;
	var w = barwidth * client.world.getPlayer().getBoostForce().magnitude / 10;
	rect(x,y,w,10);
	
	blendMode(DIFFERENCE);
	fill(255); noStroke();
	for (var i = 0; i <= 10; i++){
		var dx = x + ( i / 10 * barwidth );
		var dy = y + 3;
		
		if (i == 5 || i == 0 || i == 10){ 
			rect(dx,dy-3,2,8);
		}else{
			rect(dx,dy,2,2);
		}
	}	
	
	blendMode(BLEND);
	//if (FANCY_TEXT){ fill(0); stroke(255); }
}

var missioninfo = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
missioninfo.onUpdate = function(){
	
	if (!client.world.getPlayer()){ this.hide(); return; }
	
	var mission = client.world.getPlayer().currentMission;
	if (mission){
		var infostring = mission.infobarblurb;
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

var objectiveinfo = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
objectiveinfo.onUpdate = function(){
	
	if (!client.world.getPlayer()){ this.hide(); return; }
	
	var mission = client.world.getPlayer().currentMission;
	if (mission){
		this.text = "";
		
/* 		var infostring = mission.infobarblurb;
		var missiontime_min = ~~((mission.timeRemaining /60) / 60) ;
		var missiontime_sec = ~~((mission.timeRemaining /60) % 60 );
		
		var outtime = ""
		outtime += "" + missiontime_min + ":" + (missiontime_sec < 10 ? "0" : "");
		outtime += "" + missiontime_sec;
		
		infostring += " (" + outtime + ")" + "\n\n";
		
		this.text += infostring; */
		
		for (var i = 0; i < mission.objectives.length; i++){
			
			this.text += (i + 1) + ".\n" 
			
			for (var j = 0; j < mission.objectives[i].length; j++){
			
				var m;
				if (mission.objectives[i][j].complete){
					m = "X";
				}else{
					m = " ";
				}
			
				this.text += "[" + m + "] " + mission.objectives[i][j].text + "\n"
			
			}
			
			if ( i != mission.objectives.length - 1 ) {
				this.text += "\n";
			}
			
		}
		this.show();
	}else{
		this.hide();
	}
}

GROUP_INFOBAR.ELM_ENTITYCNTR = new GuiElement(0,0,300,40,GROUP_INFOBAR); GROUP_INFOBAR.ELM_ENTITYCNTR.autosize = true;
GROUP_INFOBAR.ELM_ENTITYCNTR.onUpdate = function(){

	var e = null;
	if (selectedEntity){
		e = selectedEntity;
	}else if (hoverEntity){
		e = hoverEntity;
	}
	if (e){ this.show(); } else { this.hide(); }
}

GROUP_INFOBAR.TXT_ENTITYNAME = new GuiTextEntry(0,0,290,40,GROUP_INFOBAR.ELM_ENTITYCNTR,[]);
GROUP_INFOBAR.TXT_ENTITYNAME.onUpdate = function(){
	//var e = null;
	if (selectedEntity){
		//e = selectedEntity;
		this.patharray = ["selectedEntity","name"];
		
	}else if (hoverEntity){
		//e = hoverEntity;
		this.patharray = ["hoverEntity","name"];
	}
}

GROUP_INFOBAR.ELM_ENTITYINFO = new GuiElement(0,0,290,40,GROUP_INFOBAR.ELM_ENTITYCNTR);
GROUP_INFOBAR.ELM_ENTITYINFO.onUpdate = function(){
	var e = null;
	if (selectedEntity){
		e = selectedEntity;
	}else if (hoverEntity){
		e = hoverEntity;
	}
	
	if (e){
		// All entitys have names!!
		var infostring = "";
		
		if (e instanceof BodyPlanet){
			var starname = e.getStar().name; 
			infostring += e.descriptor + " of the " + e.getStar().descriptor + " " + starname + "\n\n";
			infostring = infostring.charAt(0).toUpperCase() + infostring.slice(1);
			
			var daylen = 2 * Math.PI / e.rotSpeed / 60 / 60;
			//infostring += "= Day length: " + Math.round(daylen) + " Earth min.\n"
			var yearlen = e.orbitPeriod / 60 / 60;
			//infostring += "= Year length: " + Math.round(yearlen) + " Earth min"
			
			var temp = e.temperature - 273.15;
			temp = Math.round(100 * temp)/100;
			infostring += "= Temp: " + temp + "°C\n"
			
			var hum = Math.round(e.humidity * 100);
			infostring += "= Humidity: " + hum + "%\n\n"
			
			var index = CollisionUtil.indexFromPosition(cursorAbsX,cursorAbsY,e)
			var dns = Math.round( e.densities[ index ] * 1000 ) / 1000;
			infostring += "= Index: " + index + "\n";
			infostring += "= Density: " + dns + "\n";
			
			var cty = e.tiles[index].getCity();
			if (cty){
				infostring += "= City: " + cty.name + "\n";
			}
			
		}else if (e instanceof EntityBuilding){
			
			infostring += e.productionProgress + "/" + e.productionTime + "\n";
			if (e.abandoned){
				infostring += "Abandoned\n";
			}
		}
		
		this.text = infostring;	
		this.show();
	}else{
		this.hide();
	}
}

GROUP_INFOBAR.BTN_DELIVER = new GuiElement(0,0,150,40,GROUP_INFOBAR); GROUP_INFOBAR.BTN_DELIVER.text = "Deliver";
GROUP_INFOBAR.BTN_DELIVER.hide();
GROUP_INFOBAR.BTN_DELIVER.onUpdate = function(){

	this.hide();
	if (MissionHandler.inPlaceForDelivery && MissionHandler.spaceportSelected){
		
		if (selectedEntity){
			if ( selectedEntity.isIndexInBuilding( server.world.getPlayer().terrainIndex ) ){
				
				this.show();
			}
		}
	}
}

GROUP_INFOBAR.BTN_DELIVER.onClick = function(){
	server.world.getPlayer().currentMission.onSuccess();
	this.hide();
}

GROUP_INFOBAR.ELM_CNTR1 = new GuiElement(0,0,400,64, GROUP_INFOBAR); GROUP_INFOBAR.ELM_CNTR1.autosize = true;  GROUP_INFOBAR.ELM_CNTR1.autopos = "left";

GROUP_INFOBAR.BTN_MISSION = new GuiElement(0,0,147,40,GROUP_INFOBAR.ELM_CNTR1); GROUP_INFOBAR.BTN_MISSION.text = "Missions...";
GROUP_INFOBAR.BTN_MISSION.hide();
GROUP_INFOBAR.BTN_MISSION.onUpdate = function(){
	
	this.parent.hide();
	if ((!MissionHandler.inPlaceForMission) || (!MissionHandler.spaceportSelected)){ return; }
	if (!selectedEntity){ return; }
	if (!selectedEntity.isIndexInBuilding( server.world.getPlayer().terrainIndex ) ){ return; }
				
	this.parent.show();
}
GROUP_INFOBAR.BTN_MISSION.onClick = function(){
	GuiHandler.openWindow( GROUP_MISSION_SELECT );
}

GROUP_INFOBAR.BTN_CITYINFO = new GuiElement(0,0,147,40,GROUP_INFOBAR.ELM_CNTR1); GROUP_INFOBAR.BTN_CITYINFO.text = "City Info...";
GROUP_INFOBAR.BTN_CITYINFO.hide();
GROUP_INFOBAR.BTN_CITYINFO.onUpdate = function(){
	
	this.hide();
	if ((!MissionHandler.inPlaceForMission) || (!MissionHandler.spaceportSelected)){ return; }
	if (!selectedEntity){ return; }
	if (!selectedEntity.isIndexInBuilding( server.world.getPlayer().terrainIndex ) ){ return; }
				
	this.show();
}
GROUP_INFOBAR.BTN_CITYINFO.onClick = function(){
	GuiHandler.openWindow( GROUP_CITY_INFO );
}