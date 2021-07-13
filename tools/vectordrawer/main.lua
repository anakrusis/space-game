require "camera"

function love.load()

	playerx = -3; playery = 0
	playerpoints = { -0.5, 0.4, 0.8, 0, -0.5, -0.4 }
	
	-- can temporarily modify this to have stuff when reopening a buildings points
	buildingpoints = {};
	
	templatepoints = {1.5,-1,1.5,1,-1,1,-1,-1}
	
	SNAPSIZE = 4;
end

function love.update()
	
end

function love.keypressed( key, scancode, isrepeat )

	if key == "space" then
	
		table.insert(buildingpoints,"x"); table.insert(buildingpoints,"x");
	
	end
	
	-- removes last two elements -> last point
	if key == "z" then
		
		table.remove(buildingpoints); table.remove(buildingpoints);
	
	end
	
	if key == "x" then
	
		file = io.open("test.lua", "w")
		
		output = "getRelRenderPoints(){\nreturn ["
		
		for i = 1, (#buildingpoints) do
		
			output = output .. buildingpoints[i] .. ","
		
		end
		
		output = output .. "]};"
		
		file:write(output)
		
		file:close()
	
	end
end

function love.mousepressed( x, y, button, istouch, presses )

	abx = untra_x(x); aby = untra_y(y);
	
	--abx = abx + originx; aby = aby + originy;
	--abx = abx * math.cos(-math.pi/2); aby = aby * math.sin(-math.pi/2);
	--abx = abx - originx; aby = aby - originy;
	
	angle = math.pi/2;
	
	nx = abx*math.cos(angle) - aby*math.sin(angle)
	
	ny = abx*math.sin(angle) + aby*math.cos(angle)
	
	nx = math.ceil(nx*SNAPSIZE)/SNAPSIZE; ny = math.floor(ny*SNAPSIZE)/SNAPSIZE
	
	print(nx .. " " .. ny);
	
	table.insert(buildingpoints,nx); table.insert(buildingpoints,ny);
end

function drawObject(array, offsetx, offsety)
	for i = 1, (#array/2) do
	
		ind = (i-1);
		pxind = 1+ind*2; pyind = 1+1+(ind*2);
		
		nxind = 1+(pxind+1)%#array;
		nyind = 1+(pxind+2)%#array;
	--pxin2 = 2*((i+1)%#playerpoints);
	--pyin2 = 1+2*((i+1)%#playerpoints);
	
		--print(pxind .. " " .. pyind .. " " .. nxind .. " " .. nyind);
	
		--love.graphics.print(pxind .. " " .. pyind .. " " .. nxind .. " " .. nyind, 0, 30*i);
		
		if (array[pxind] ~= "x") and (array[nxind] ~= "x") then
		
			playerpx = tra_x( offsetx + array[pxind] ); playerpy = tra_y( offsety + array[pyind] )
			playernx = tra_x( offsetx + array[nxind] ); playerny = tra_y( offsety + array[nyind] )
		
			love.graphics.line(playerpx, playerpy, playernx, playerny);
		end
	end
end

function love.draw()

	originx = love.graphics.getWidth() / 2;
	originy = love.graphics.getHeight() / 2;

	love.graphics.setColor(0.3,0.3,0.3)
	
	for i = -10, 10, 1/SNAPSIZE do
	
		love.graphics.line(0,tra_y(i),1000,tra_y(i))
	
	end
	
	for i = -10, 10, 1/SNAPSIZE do
	
		love.graphics.line(tra_x(i),0,tra_x(i),1000)
	
	end
	
	love.graphics.setColor(0.5,0.5,0.5)
	love.graphics.line(originx,0,originx,1000)
	love.graphics.line(0,originy,1000,originy)

	love.graphics.push()
	
	love.graphics.translate( originx, originy )
	love.graphics.rotate( -math.pi / 2 )
	love.graphics.translate( -originx, -originy )
	
	for i = -4, 4, 2 do
		
		drawObject(templatepoints, 0, i);
		drawObject(templatepoints, 0, i);
		drawObject(templatepoints, 0, i);
		
	end
	
	love.graphics.setColor(0,1,1)
	
	drawObject(playerpoints, playerx, playery);
	drawObject(buildingpoints, 0, 0);
	
	if #buildingpoints > 0 then
		lastpointx = buildingpoints[#buildingpoints-1]; lastpointy = buildingpoints[#buildingpoints];
		love.graphics.circle( "line", tra_x(lastpointx), tra_y(lastpointy), 5 )
	
	end
	
	love.graphics.pop()
	
	love.graphics.print("Press X to save, Z to undo")
end