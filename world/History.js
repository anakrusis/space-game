// A history is a generic container class for Events

class History {
	constructor(){
		this.events = [];
		this.type = this.constructor.name;
	}
}

class HistoryEvent {
	
	constructor(date){
		// real life datestamp of when event occured
		this.date = date;
		this.type = this.constructor.name;	
	}
	
	getDateText(){
		var month = (1 + this.date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = this.date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		
		var out = this.date.getFullYear() + "-" + month + "-" + day;
		
		var hour = this.date.getHours().toString();
		hour = hour.length > 1 ? hour : '0' + hour;
		var minute = this.date.getMinutes().toString();
		minute = minute.length > 1 ? minute : '0' + minute;
		
		out += " " + hour + ":" + minute + "\n";
		return out;
	}
	
	getInfoText(){
		return this.getDateText() + "\nNo info text found for this event!";
	}	
}

class EventMissionFail extends HistoryEvent {
	constructor( date, mission ){
		super(date);
		this.mission = mission;
	}
	
	getInfoText(){
		return "Mission Failed\nDate: " + this.getDateText() + "\n" + this.mission.displaytext; 
	}
}

class EventMissionSuccess extends HistoryEvent {
	constructor( date, mission ){
		super(date);
		this.mission = mission;
	}
	getInfoText(){
		return "Mission Completed\nDate: " + this.getDateText() + "\n" + this.mission.displaytext; 
	}
}