import Planet from '../../models/celestialObj';

let steps = 0,
    startTime,
    endTime,
    fps,
    shiftPressed,
    planets = new Array(),
    gravityConstant = 1,
    xOffset = 0,
    yOffset = 0,
    initXOffset = 0,
    initYOffset = 0,
    zoomScale = 1,
    mouseInitX = 0,
    mouseInitY = 0,
    currentMouseX = 0,
    currentMouseY = 0,
    dragging = false,
    tracking = false,
    running = true,
    stopCreation = false,
    ctx;

function newPlanet(spec){
  let p = new Planet(spec);
  renderPlanetInfo(p);
  planets.push(p);
}

function renderPlanetInfo(planet){

  $('#info-table').empty();

  let tableContent = `
    <table>
      <caption>Planet Info</caption>
      <tbody>
        <tr>
          <td>Radius</td>
          <td>${planet.radius.toLocaleString('en-US', {minimumFractionDigits: 2})} km</td>
        </tr>
        <tr>
          <td>Volume</td>
          <td>${planet.volume.toLocaleString('en-US', {minimumFractionDigits: 2})} km<sup>3</sup></td>
        </tr>
        <tr>
          <td>Mass</td>
          <td>${planet.mass.toExponential()} g/cm<sup>3</sup></td>
        </tr>
        <tr>
          <table id="planet-composition">
            <caption>Composition</caption>
            <tr>
              <td>Name</td>
              <td>Symbol</td>
              <td>Percentage</td>
            </tr>
          </table>
        </tr>
      </tbody>
    </table>
  `;

  $('#info-table').append(tableContent);

  let elements = _.sortBy(planet.density, 'percentageVal').reverse();
  console.log("elements: ", elements);

  elements.forEach(elem => {
    let compositionString = `
      <tr>
        <td>${elem.name}</td>
        <td>${elem.symbol}</td>
        <td>${elem.percentage}</td>
      </tr>
    `;
    $('#planet-composition').append(compositionString)

  });
}

function Vector(x, y){
  this.x = x;
  this.y = y;
}

function spawnCluster(){
  let focal = new Vector(mouseInitX, mouseInitY),
      radius = 50;
  for(var i = 0; i < 100; i++){
    let randomTheta = 2 * Math.PI * Math.random(),
        u = (Math.random() * 100) + (Math.random() * 100),
        r = u > 100 ? 200 - u : u,
        location = new Vector((r * Math.cos(randomTheta)) + focal.x, r * Math.sin(randomTheta) + focal.y);
    planets.push(newPlanet({null, x: location.x / zoomScale, y: location.y / zoomScale }))
  }
}

function drawPlanets(p){
  for(let i = 0; i < p.length; i++){
    p[i].drawPlanet({zoomScale, xOffset, yOffset});
  }
}


function gravityCalc(p) {
	for (var i = 0; i < p.length; i++) {
		let forceSum = new Vector(0, 0);
		for (var j = 0; j < p.length; j++) {
			if (j != i) {
				var xDist = p[i].x - p[j].x;
				var yDist = p[i].y - p[j].y;
				var distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
				if (distance < p[i].drawRad + p[j].drawRad) {
					p[i].mergePlanet(p[j]);
					p.splice(j, 1);
				} else {
          var forceMag = gravityConstant * (p[i].gravMass * p[j].gravMass) / Math.pow(distance, 2);
					var nextStep = forceMag / p[i].gravMass + forceMag / p[j].gravMass;
					if (distance < nextStep) {
					  p[i].mergePlanet(p[j]);
					  p.splice(j, 1);
					} else {
  					forceSum.x -= Math.abs(forceMag * (xDist / distance)) * Math.sign(xDist);
  					forceSum.y -= Math.abs(forceMag * (yDist / distance)) * Math.sign(yDist);
					}
				}
			}
		}
		p[i].velocity.x += forceSum.x / p[i].gravMass;
		p[i].velocity.y += forceSum.y / p[i].gravMass;
	}
	for (var i = 0; i < p.length; i++) {
		// 60 / fps to take bigger steps when the simulation is running slower (60 is normal fps)
		p[i].x += p[i].velocity.x / 10 * (60 / fps);
		p[i].y += p[i].velocity.y / 10 * (60 / fps);
	}
}

$(document).ready((e) => {
  xOffset = $(window).width() / 2;
  yOffset = $(window).height() / 2;
  mouseInitX = e.clientX;
  mouseInitY = e.clientY;
  ctx = $('#canvas')[0].getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  $("#hide-info-button").click((e) => {
    $("#info-table").toggle();
  })

  $("#canvas").mousedown((e) => {
    stopCreation = false;
    if (e.which == 2 || shiftPressed) {
      stopCreation = true;
      e.preventDefault();
      planets.forEach(planet => {
        if(planet.isPointInside(mouseInitX,mouseInitX)){
          renderPlanetInfo(planet);
        }
      });
    }

		mouseInitX = e.clientX;
		mouseInitY = e.clientY;
		dragging = true;
	});

  $('#canvas').mouseup((e) => {
    if(!stopCreation){
      let vx = (e.clientX - mouseInitX) / 10;
      let vy = (e.clientY - mouseInitY) / 10;
      newPlanet({v: new Vector(vx, vy), x: (mouseInitX - xOffset) / zoomScale, y: (mouseInitY - yOffset) / zoomScale });
      drawPlanets(planets);
    }
  })

  $("#canvas").mousemove((e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
  });

  $('body').keydown(e => {
    if(e.which === 16){
      shiftPressed = true;
    }
    if(e.which === 32){
      spawnCluster();
    }
  });

  $('body').keyup(e => {
    if(e.which === 16){
      shiftPressed = false;
    }
  });



  let startTime = new Date;
  setInterval(() => {
    endTime = new Date;
    fps = 1000 / (endTime - startTime);
    startTime = endTime;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawPlanets(planets);
    if(running){
      gravityCalc(planets);
      steps++;
    }
    if(tracking){

    }
  }, 15)
})

require("../../style.scss");
