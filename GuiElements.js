// HOTBAR: Shows the cargo hold of items (nine in total for now)

var GROUP_HOTBAR = new GuiElement(0,0,500,500);
GROUP_HOTBAR.autosize = true; GROUP_HOTBAR.autopos = "left"; GROUP_HOTBAR.autocenterX = true;
GROUP_HOTBAR.onUpdate = function(){
	this.y = height/GUI_SCALE - this.height;
}

for (var i = 0; i < 9; i++){
	
	var he = new GuiElement( 0, 0, 64, 64, GROUP_HOTBAR ); he.index = i;
	
	he.onRender = function(){
		
		if (!client.world.getPlayer()){ return; }
		
		var plyr = client.world.getPlayer(); var itemstk = client.world.getPlayer().inventory.get(this.index);
		if (itemstk){
			
			
			var scale = 18;
			var pts = itemstk.getItem().getRelRenderPoints();
			noFill()
			stroke(itemstk.getItem().color[0], itemstk.getItem().color[1], itemstk.getItem().color[2]);
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

// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiElement(0,0,0,0); GROUP_INFOBAR.autosize = true;
var tittle = new GuiElement(0,0,300,40,GROUP_INFOBAR); tittle.text = TITLE_VERSION + "\n2021-06-10"
tittle.onClick = function(){
	GuiHandler.openWindow(GROUP_WELCOME);
}

var BUTTON_MENU = new GuiElement(0,0,150,40); BUTTON_MENU.text = "Options..."
BUTTON_MENU.onUpdate = function(){
	//var mid = width/2;
	this.y = height/GUI_SCALE - this.height;

}
BUTTON_MENU.onClick = function(){
	GuiHandler.openWindow(GROUP_MAINMENU);
}

var playerstatus = new GuiElement(0,0,300,40,GROUP_INFOBAR); 
playerstatus.onUpdate = function(){
	if (!client.world.getPlayer()){ return; }
	var infostring = "$" + client.world.getPlayer().money;
	this.text = infostring;
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
			var starname = e.getStar().name; infostring += "Planet of the " + starname + " system\n\n";
			
			var daylen = 2 * Math.PI / e.rotSpeed / 60 / 60;
			//infostring += "• Day length: " + Math.round(daylen) + " Earth min.\n"
			var yearlen = e.orbitPeriod / 60 / 60;
			//infostring += "• Year length: " + Math.round(yearlen) + " Earth min"
			
			var temp = e.temperature - 273.15;
			temp = Math.round(100 * temp)/100;
			infostring += "• Temperature: " + temp + "°C\n"
			
			var hum = Math.round(e.humidity * 100);
			infostring += "• Humidity: " + hum + "%\n"
			
		}else if (e instanceof EntityBuilding){
			
			infostring += e.productionProgress + "/" + e.productionTime + "\n";
			
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

GROUP_INFOBAR.BTN_MISSION = new GuiElement(0,0,150,40,GROUP_INFOBAR); GROUP_INFOBAR.BTN_MISSION.text = "Missions...";
GROUP_INFOBAR.BTN_MISSION.hide();
GROUP_INFOBAR.BTN_MISSION.onUpdate = function(){
	
	this.hide();
	if (MissionHandler.inPlaceForMission && MissionHandler.spaceportSelected){
		
		if (selectedEntity){
			if ( selectedEntity.isIndexInBuilding( server.world.getPlayer().terrainIndex ) ){
				
				this.show();
			}
		}
	}
	
}
GROUP_INFOBAR.BTN_MISSION.onClick = function(){
	GuiHandler.openWindow( GROUP_MISSION_SELECT )
}

// WELCOME: When you first open up the game

var GROUP_WELCOME = new GuiElement(0,0,500,500); GROUP_WELCOME.autosize = true; GROUP_WELCOME.autopos = "top"; GROUP_WELCOME.show(); GROUP_WELCOME.autocenterX = true; GROUP_WELCOME.autocenterY = true;

var hdr = new GuiElement(0,0,700,40,GROUP_WELCOME); hdr.text = "Welcome to " + TITLE_VERSION;
var bdy = new GuiElement(0,0,700,40,GROUP_WELCOME); bdy.text = "This is a little game about piloting a multi-purpose spaceplane. You  can do delivery missions, or just explore freely if you want. \n\nThere isn't much to see right now, but you can always come back later and see how things have changed!\n\nControls:\n\n W/S - accelerate/decelerate\n A/D - turn\n Mouse wheel - zoom in/out\n F - toggle fullscreen\n P - toggle path drawing\n Space - toggle planet camera rotation"

var butoncontainer = new GuiElement(0,0,700,64, GROUP_WELCOME); butoncontainer.autosize = true;  butoncontainer.autopos = "left";

var startbuton = new GuiElement(0,0,160,40,butoncontainer); startbuton.text = "Begin flying!";
startbuton.onClick = function(){
	GROUP_WELCOME.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}
var sorcebuton = new GuiElement(0,0,210,40,butoncontainer); sorcebuton.text = "View code (Github)";
sorcebuton.onClick = function(){
	window.open("https://github.com/anakrusis/space-game", "_blank");;

}

// main menu

var GROUP_MAINMENU = new GuiElement(0,0,300,500); GROUP_MAINMENU.autosize = true; GROUP_MAINMENU.autopos = "top"; 
GROUP_MAINMENU.hide(); GROUP_MAINMENU.autocenterX = true; GROUP_MAINMENU.autocenterY = true;

//var menu_title = new GuiElement(0,0,300,40,GROUP_MAINMENU); menu_title.text = "Space Game";

var menu_resume = new GuiElement(0,0,300,40,GROUP_MAINMENU); menu_resume.text = "Resume Game";
menu_resume.onClick = function(){
	GROUP_MAINMENU.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}
var menu_slcntr = new GuiElement(0,0,300,40,GROUP_MAINMENU); menu_slcntr.autosize = true; menu_slcntr.autopos = "left";
var menu_save = new GuiElement(0,0,147.5,40,menu_slcntr); menu_save.text = "Save Game";
menu_save.onClick = function(){
	
	storeItem("world", server.world);
	//GROUP_MAINMENU.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}
var menu_load = new GuiElement(0,0,147.5,40,menu_slcntr); menu_load.text = "Load Game";
menu_load.onClick = function(){
	//GROUP_MAINMENU.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
	//drawEnabled = false;
	//var jsonworld = localStorage.world; //
	var jsonworld = getItem("world");
	
/* 	function apply(o, c){
    if(o && c && typeof c == 'object'){
        for(var p in c){
            if (c.hasOwnProperty(p)){
                o[p] = c[p];
            }
        }
    }
    return o;
	};
	
	var world = apply({}, jsonworld); */
	var w = WorldLoader.loadWorld(jsonworld);
/* 	server.world = 
	client.onUpdate(server.world,"world"); selectedEntity = null; hoverEntity = null; */
	//server.world = world;
	
	GROUP_LOAD.BTN_WORLD.world = w; GROUP_LOAD.BTN_WORLD.text = "$" + w.getPlayer().money;
	
	GROUP_MAINMENU.hide(); GuiHandler.openWindow(GROUP_LOAD);
}
var menu_option = new GuiElement(0,0,300,40,GROUP_MAINMENU); menu_option.text = "Settings...";
menu_option.onClick = function(){
	GROUP_MAINMENU.hide(); GuiHandler.openWindow(GROUP_OPTIONS);
}

// World loading menu

var GROUP_LOAD = new GuiElement(0,0,300,500); GROUP_LOAD.autosize = true; GROUP_LOAD.autopos = "top"; GROUP_LOAD.hide(); GROUP_LOAD.autocenterX = true; GROUP_LOAD.autocenterY = true;
GROUP_LOAD.ELM_TITLE = new GuiElement(0,0,300,40,GROUP_LOAD); GROUP_LOAD.ELM_TITLE.text = "Load World";
GROUP_LOAD.BTN_WORLD = new GuiElement(0,0,300,40,GROUP_LOAD);

GROUP_LOAD.BTN_BACK = new GuiElement(0,0,100,40,GROUP_LOAD); GROUP_LOAD.BTN_BACK.text = "Back";
GROUP_LOAD.BTN_BACK.onClick = function(){
	GROUP_LOAD.hide(); GuiHandler.openWindow(GROUP_MAINMENU);
}

// Settings menu

var GROUP_OPTIONS = new GuiElement(0,0,500,500); GROUP_OPTIONS.autosize = true; GROUP_OPTIONS.autopos = "top"; GROUP_OPTIONS.hide(); GROUP_OPTIONS.autocenterX = true; GROUP_OPTIONS.autocenterY = true;

var options_title = new GuiElement(0,0,500,40,GROUP_OPTIONS); options_title.text = "Settings";

var options_guiscale = new GuiSlider(0,0,320,40,GROUP_OPTIONS,["GUI_SCALE","SQUIDWARD"], 0.5, 2); options_guiscale.text = "Gui scale: ";
options_guiscale.onUpdate = function(){
	this.text = "Gui scale: " + Math.round(this.setting * 100)/100;
}

var options_mouse = new GuiSlider(0,0,320,40,GROUP_OPTIONS,["MOUSE_SENSITIVITY","SQUIDWARD"], 0.5, 2); options_mouse.text = "Gui scale: ";
options_mouse.onUpdate = function(){
	this.text = "Mouse wheel sensitivity: " + Math.round(this.setting * 100)/100;
}

var options_btncntr = new GuiElement(0,0,700,64, GROUP_OPTIONS); options_btncntr.autosize = true;  options_btncntr.autopos = "left";

var options_back = new GuiElement(0,0,100,40,options_btncntr); options_back.text = "Back";
options_back.onClick = function(){
	GROUP_OPTIONS.hide(); GuiHandler.openWindow(GROUP_MAINMENU);
}
var options_apply = new GuiElement(0,0,100,40,options_btncntr); options_apply.text = "Apply";
options_apply.onClick = function(){

	for (var key in options_buffer){
		//console.log(key);
		
		var keyfirst = key.substring(0, key.indexOf(','));
		
		window[ keyfirst ] = options_buffer[key] ;
		
		storeItem(keyfirst, options_buffer[key]);
		
	}
}
var options_default = new GuiElement(0,0,190,40,options_btncntr); options_default.text = "Restore Defaults";
options_default.onClick = function(){

	options_buffer[ "GUI_SCALE,SQUIDWARD" ] = 1.5;
	options_buffer[ "MOUSE_SENSITIVITY,SQUIDWARD" ] = 1;
	
	options_apply.onClick();
	
	GuiHandler.openWindow(GROUP_OPTIONS);
}

// MISSION SUCCESS: When you succeed a mission

var GROUP_MISSION_SUCCESS = new GuiElement(0,0,500,500);
GROUP_MISSION_SUCCESS.autosize = true; GROUP_MISSION_SUCCESS.autopos = "top"; GROUP_MISSION_SUCCESS.hide();
GROUP_MISSION_SUCCESS.autocenterX = true; GROUP_MISSION_SUCCESS.autocenterY = true;

var success_title = new GuiElement(0,0,300,40,GROUP_MISSION_SUCCESS); success_title.text = "Mission Success!"

var toto = new GuiElement(0,0,300,40,GROUP_MISSION_SUCCESS);

var bobbobo = new GuiElement(0,0,150,40,GROUP_MISSION_SUCCESS); bobbobo.text = "Ok";
bobbobo.onClick = function(){
	GROUP_MISSION_SUCCESS.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}

// MISSION FAIL: When you fail a mission...

var GROUP_MISSION_FAIL = new GuiElement(0,0,500,500);
GROUP_MISSION_FAIL.autosize = true; GROUP_MISSION_FAIL.autopos = "top"; GROUP_MISSION_FAIL.hide();
GROUP_MISSION_FAIL.autocenterX = true; GROUP_MISSION_FAIL.autocenterY = true;

var fail_title = new GuiElement(0,0,300,40,GROUP_MISSION_FAIL); fail_title.text = "Mission Failed"

var tete = new GuiElement(0,0,300,40,GROUP_MISSION_FAIL);

var bb = new GuiElement(0,0,150,40,GROUP_MISSION_FAIL); bb.text = "Ok";
bb.onClick = function(){
	GROUP_MISSION_FAIL.hide(); GuiHandler.openWindow(GROUP_INFOBAR);
}

// MISSION CONFIRM: Menu giving mission details and asking you if your sure or not

var GROUP_MISSION_CONFIRM = new GuiElement(0,0,0,0); GROUP_MISSION_CONFIRM.hide(); GROUP_MISSION_CONFIRM.autosize = true;
GROUP_MISSION_CONFIRM.autocenterX = true; GROUP_MISSION_CONFIRM.autocenterY = true;
GROUP_MISSION_CONFIRM.onShow = function(){
	
	this.children = []; // For dynamic button arrangements, it has to reset each time or else they will just KEEP STACKING LOL
	
	var tittle = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); tittle.text = "Mission Confirmation";
	
	var missioninfo = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); missioninfo.text = selectedMission.displaytext;
	missioninfo.onRender = function(){
		
		var scale = 18;
		var pts = selectedMission.getIcon();
		noFill()
		stroke(selectedMission.iconColor[0], selectedMission.iconColor[1], selectedMission.iconColor[2]);
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			var px = (pts[i+1]) * scale + this.dispx - this.padding*8 + this.width; 
			var py = (-pts[i])  * scale + this.dispy - this.padding*2 + this.height + 4;
			vertex(px,py);
		}
		endShape(CLOSE);
	}
	
	var t2 = new GuiElement(0,0,300,40,GROUP_MISSION_CONFIRM); t2.text = "Are you sure you want to begin this mission?\n";

	var mission_sure_cntr = new GuiElement(0,0,700,64, GROUP_MISSION_CONFIRM); mission_sure_cntr.autosize = true;  mission_sure_cntr.autopos = "left";

	var yesbtn = new GuiElement(0,0,148,40,mission_sure_cntr); yesbtn.text = "Yea";
	yesbtn.onClick = function(){
		GROUP_MISSION_CONFIRM.hide(); 
		
		if (server.world.getPlayer().currentMission){
			
			GuiHandler.openWindow(GROUP_MISSION_CANCEL_CURRENT);
			
		} else {
			
			GuiHandler.openWindow(GROUP_INFOBAR);
			selectedMission.onStart();
			
		}
	}
	
	var backbtn = new GuiElement(0,0,148,40,mission_sure_cntr); backbtn.text = "Nah";
	backbtn.onClick = function(){
		GROUP_MISSION_CONFIRM.hide(); GuiHandler.openWindow(GROUP_MISSION_SELECT);
	}
	
}

// MISSION CANCEL EXISTING: Menu for when you already are in a mission and going to cancel it.

var GROUP_MISSION_CANCEL_CURRENT = new GuiElement(0,0,0,0); GROUP_MISSION_CANCEL_CURRENT.hide(); GROUP_MISSION_CANCEL_CURRENT.autosize = true;
GROUP_MISSION_CANCEL_CURRENT.autocenterX = true; GROUP_MISSION_CANCEL_CURRENT.autocenterY = true;

var mission_cancel_title = new GuiElement(0,0,300,40,GROUP_MISSION_CANCEL_CURRENT); mission_cancel_title.text = "Cancel current mission?"

var mission_cancel_cntr = new GuiElement(0,0,700,64, GROUP_MISSION_CANCEL_CURRENT); mission_cancel_cntr.autosize = true;  mission_cancel_cntr.autopos = "left";

var mission_cancel_yes = new GuiElement(0,0,100,40,mission_cancel_cntr); mission_cancel_yes.text = "Yes";
mission_cancel_yes.onClick = function(){
	
	server.world.getPlayer().currentMission.onCancel();
	server.world.getPlayer().currentMission = null;
	
	GROUP_MISSION_CANCEL_CURRENT.hide();
	GuiHandler.openWindow(GROUP_INFOBAR);
	selectedMission.onStart();
	
}


var mission_cancel_no = new GuiElement(0,0,100,40,mission_cancel_cntr); mission_cancel_no.text = "No";
mission_cancel_no.onClick = function(){
	GROUP_MISSION_CANCEL_CURRENT.hide(); GuiHandler.openWindow(GROUP_MISSION_CONFIRM);
}

// MISSION SELECT: Menu with the list of missions available

var GROUP_MISSION_SELECT = new GuiElement(0, 0, 0, 0); GROUP_MISSION_SELECT.hide(); GROUP_MISSION_SELECT.autosize = true;

GROUP_MISSION_SELECT.autocenterX = true; GROUP_MISSION_SELECT.autocenterY = true;

GROUP_MISSION_SELECT.onShow = function(){
	
	if (!(selectedEntity instanceof BuildingSpaceport)){ return; }
	
	this.children = [];
	
	var tittle = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); tittle.text = "Missions";
	
	var selectedCity = selectedEntity.getCity();
	var missions = selectedCity.getAvailableMissions();
	
	if (missions.length == 0){
		var errtext = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); errtext.text = "Sorry, no missions available! You can check back some time soon.";
	}
	
	for (mission of missions){		
		
		var button = new GuiElement(0,0,300,40,GROUP_MISSION_SELECT); button.text = mission.displaytext; button.mission = mission;
		button.onClick = function(){
			selectedMission = this.mission;
			GROUP_MISSION_SELECT.hide(); GuiHandler.openWindow(GROUP_MISSION_CONFIRM);
		}
		button.onRender = function(){
			
			var scale = 18;
			var pts = this.mission.getIcon();
			noFill()
			stroke(this.mission.iconColor[0], this.mission.iconColor[1], this.mission.iconColor[2]);
			beginShape();
			for (i = 0; i < pts.length; i += 2){
				var px = (pts[i+1]) * scale + this.dispx - this.padding*8 + this.width; 
				var py = (-pts[i])  * scale + this.dispy - this.padding*2 + this.height + 4;
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

GROUP_INFOBAR.hide(); BUTTON_MENU.hide(); GROUP_HOTBAR.hide();

GuiHandler.openWindow( GROUP_WELCOME );