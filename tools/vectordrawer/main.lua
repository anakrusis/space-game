require "camera"

function love.load()

	playerx = -3; playery = 0
	playerpoints = { -0.5, 0.4, 0.8, 0, -0.5, -0.4 }
	
	NaN = "NaN";
	
	-- can temporarily modify this to have stuff when reopening a buildings points
	buildingpoints = {NaN,NaN,2.75,2,3.25,1,3.25,-1,2.75,0,2.75,2,NaN,NaN,-1,-2,-1,2,-2.5,2,-2.5,-2,-1,-2,NaN,NaN,-1,-2,2.75,-2,3.25,-1,2.75,0,-1,0,NaN,NaN,2.75,0,2.75,2,-1,2,-1,0,2.75,0};
	
	templatepoints = {1.5,-1,1.5,1,-1,1,-1,-1}
	
	editpoint = #buildingpoints + 1;
	
	SNAPSIZE = 4;
end

function love.update()
	
end

function love.keypressed( key, scancode, isrepeat )

	if key == "space" then
	
		table.insert(buildingpoints,"NaN"); table.insert(buildingpoints,"NaN");
	
	end
	
	-- removes last two elements -> last point
	if key == "z" then
		
		table.remove(buildingpoints); table.remove(buildingpoints);
		editpoint = editpoint - 2;
		editpoint = math.max(1,editpoint)
	end
	
	if key == "kp4" then
		editpoint = editpoint - 2;
		editpoint = math.max(1,editpoint)
		print(editpoint);
	end
	
	if key == "x" then
	
		file = io.open("test.lua", "w")
		
		output = "getRelRenderPoints(){\n	return ["
		
		for i = 1, (#buildingpoints) do
		
			output = output .. buildingpoints[i] .. ","
		
		end
		output = output .. "]};"
		
		file:write(output)
		file:close()
	end
	
	if key == "up" then
		for i = 1, #buildingpoints, 2 do
			if (buildingpoints[i] ~= NaN) then
				buildingpoints[i] = buildingpoints[i] + (1/SNAPSIZE);
			end
		end
	end
	if key == "down" then
		for i = 1, #buildingpoints, 2 do
			if (buildingpoints[i] ~= NaN) then
				buildingpoints[i] = buildingpoints[i] - (1/SNAPSIZE);
			end
		end
	end
	
	if key == "left" then
		for i = 2, #buildingpoints, 2 do
			if (buildingpoints[i] ~= NaN) then
				buildingpoints[i] = buildingpoints[i] - (1/SNAPSIZE);
			end
		end
	end
	if key == "right" then
		for i = 2, #buildingpoints, 2 do
			if (buildingpoints[i] ~= NaN) then
				buildingpoints[i] = buildingpoints[i] + (1/SNAPSIZE);
			end
		end
	end
end

function love.mousepressed( x, y, button, istouch, presses )

	abx = untra_x(x); aby = untra_y(y);
	angle = math.pi/2;
	nx = abx*math.cos(angle) - aby*math.sin(angle)
	ny = abx*math.sin(angle) + aby*math.cos(angle)
	nx = math.floor((nx*SNAPSIZE)+0.5)/SNAPSIZE; ny = math.floor((ny*SNAPSIZE)+0.5)/SNAPSIZE
	--print(nx .. " " .. ny);
	
	print(editpoint);
	--table.insert(buildingpoints, nx); table.insert(buildingpoints,ny);
	buildingpoints[editpoint] = nx; buildingpoints[editpoint+1] = ny;
	editpoint = editpoint + 2;
	print(editpoint);
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
		
		if (array[pxind] ~= "NaN") and (array[nxind] ~= "NaN") then
		
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
	
	if #buildingpoints > 0 and editpoint > 1 then
		-- lastpointx = buildingpoints[#buildingpoints-1]; lastpointy = buildingpoints[#buildingpoints];
		-- if lastpointx ~= "NaN" then
			-- love.graphics.circle( "line", tra_x(lastpointx), tra_y(lastpointy), 5 )
		-- end
		
		epx = buildingpoints[editpoint-2]; epy = buildingpoints[editpoint-1];
		if epx ~= "NaN" then
			love.graphics.circle( "line", tra_x(epx), tra_y(epy), 5 )
		end
	end
	
	abx = untra_x(love.mouse.getX()); aby = untra_y(love.mouse.getY());
	angle = math.pi/2;
	nx = abx*math.cos(angle) - aby*math.sin(angle)
	ny = abx*math.sin(angle) + aby*math.cos(angle)
	nx = math.floor((nx*SNAPSIZE)+0.5)/SNAPSIZE; ny = math.floor((ny*SNAPSIZE)+0.5)/SNAPSIZE
	love.graphics.circle( "fill", tra_x(nx), tra_y(ny), 5 )
	
	love.graphics.pop()
	
	love.graphics.print("Press X to save, Z to undo")
end