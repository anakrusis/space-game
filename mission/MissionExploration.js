class MissionExploration extends Mission {
	constructor(chunkx, chunky, bodyUUID){
		super();
		
		this.timeRemaining = -1;
		
		this.chunkx = chunkx; this.chunky = chunky;
		this.bodyUUID = bodyUUID;
	}
}