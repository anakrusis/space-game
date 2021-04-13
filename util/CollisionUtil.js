class CollisionUtil{
	static isColliding(entity, body){
		var nearestDist = this.getNearestDistance(entity, body);
        var expectedDist = body.radius + this.heightFromEntityAngle(entity, body);
        return nearestDist < expectedDist;
    }
	
	static euclideanDistance (x1, y1, x2, y2){
        return Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) );
    }
	
	// returns the distance from the nearest point of the entity to the nearest point of the body
	static getNearestDistance(entity, body){
        var entityAbsPoints = entity.getAbsolutePoints();
        var nearestDist = 100000000;
        var cd;

        var nearestEntityX, nearestEntityY;
        var cx, cy;

		// Step 1: get the point on the entity nearest to the center of the body
		for (var i = 0; i < entityAbsPoints.length; i += 2){
			cx = entityAbsPoints[i];
			cy = entityAbsPoints[i + 1];
			cd = this.euclideanDistance(cx, cy, body.x, body.y);
			if (cd < nearestDist){
				nearestDist = cd;
				nearestEntityX = cx;
				nearestEntityY = cy;
			}
		}

        return nearestDist;
    }
	
	static messyIndexFromEntityAngle(entity,body){
		var terrsize = body.terrainSize;

        // If the player is halfway between terrainPoints 3 and 4, then it will be 3.5,
        // (for example)
        var messyIndex;
        var cleanIndex;
        var messyDifference;
        var currentHeight;
        var nextHeight;

        var interpolatedHeight;

        var angle = Math.atan2(entity.y - body.y, entity.x - body.x);
        var bodydir = body.dir;

        // This maps the value to between -pi and pi
        bodydir += Math.PI;
        bodydir %= 2 * Math.PI;
        bodydir -= Math.PI;

        angle -= bodydir;

        // I was just being safe here in fear of the dreaded IndexOutOfBoundsException
        angle += Math.PI;
        angle %= 2 * Math.PI;
        angle -= Math.PI;

        if (angle < 0){
            messyIndex = angle * ((0.5 * terrsize) / Math.PI) + terrsize;
        }else{
            messyIndex = angle * ((0.5 * terrsize) / Math.PI);
        }
        return messyIndex;
	}
	
	static indexFromEntityAngle(entity, body){
		return Math.floor( this.messyIndexFromEntityAngle(entity,body) );
	}
	
	// Todo make some of this redundant code into functions
	static tileFromEntityAngle(entity,body){
		
		return body.tiles[ this.indexFromEntityAngle(entity,body) ];
	}
	
	static heightFromEntityAngle(entity, body){
        var messyIndex = this.messyIndexFromEntityAngle(entity,body);
        var cleanIndex = this.indexFromEntityAngle(entity,body);

        var messyDifference = messyIndex - cleanIndex;

        var currentHeight = body.terrain[cleanIndex];
        var nextHeight = body.terrain[(cleanIndex + 1) % body.terrainSize];

        var interpolatedHeight = (nextHeight * messyDifference) + (currentHeight * (1 - messyDifference));
        return interpolatedHeight;
    }
	
	static resolveCollision(entity, body){
        var newx = entity.x, newy = entity.y;
        // Used if the entity is too far in (ie beneath the surface), so it gets teleported to the surface
        var angleFromCenter = Math.atan2(entity.y - body.y, entity.x - body.x);
        var nearestDist = this.euclideanDistance(entity.x, entity.y, body.x, body.y);
        var expectedDist = body.radius + this.heightFromEntityAngle(entity, body);
        var difference = (expectedDist - nearestDist);

        if (nearestDist < expectedDist) {
            newx = (Math.cos(angleFromCenter) * (expectedDist + (difference * 0)) ) + body.x;
            newy = (Math.sin(angleFromCenter) * (expectedDist + (difference * 0)) ) + body.y;
        }
        entity.x = newx; entity.y = newy;
    }
	
	static isEntityCollidingWithEntity(entity, body){
        var isColliding;

        var abspoints = body.getAbsolutePoints();
        var entityAbsPoints = entity.getAbsolutePoints();

        var bodyX, bodyY;
        var bodyXNext, bodyYNext;
        var entityX, entityY;

        var between;
        var intersecting;

        for (var j = 0; j < entityAbsPoints.length; j += 2){

            isColliding = false;

            entityX = entityAbsPoints[j];
            entityY = entityAbsPoints[j + 1];

            for (var i = 0; i < abspoints.length; i += 2){
                bodyX = abspoints[i];
                bodyY = abspoints[i+1];

                if ((i + 3) > abspoints.length){
                    bodyXNext = abspoints[0];
                    bodyYNext = abspoints[1];
                }else {
                    bodyXNext = abspoints[i + 2];
                    bodyYNext = abspoints[i + 3];
                }
                between = (bodyY > entityY) != (bodyYNext > entityY);
                intersecting = entityX < (bodyXNext - bodyX) * (entityY - bodyY) / (bodyYNext - bodyY) + bodyX;

                if (between && intersecting){
                    isColliding = !isColliding;
                }
            }

            // If any of the points on Entity are colliding, then yes it is colliding.
            if (isColliding){
                return isColliding;
            }
        }

        return false;
    }
}

class ForceVector {
	constructor(magnitude, dir){
		this.magnitude = magnitude;
		this.dir       = dir;
	}
}