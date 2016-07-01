'use strict';

import densities from './densities';
import _ from 'lodash';

//generates random elements if no config elements are given

class celestialObj{
   constructor(spec){
     this.radius = spec.kmRadius ? spec.kmRadius : this.generateRadius();
     this.drawRad = Math.cbrt((this.radius / 2));
     this.volume = ((4 * Math.PI) * Math.pow(this.radius, 3))/3;
     this.density = this.randomComposition(this.volume);
     this.mass = this.density.total * this.volume;
     this.gravMass = this.mass * .000000000000000001
     this.color = spec.color ? spec.color : '#' + Math.floor(Math.random()*16777215).toString(16);
     this.width = this.radius * 2;
     this.height = this.width;
     this.velocity = spec.v ? spec.v : 0;
     this.y = spec.y;
     this.x = spec.x;
     this.absorb = this.mergePlanet;
     this.draw = this.drawPlanet;
   }
   generateRadius(){
     let prob = Math.random() * 10;
     let radius = prob < 6.6 ? Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 2000);
     return radius;
   }
   randomComposition(volume, customElements){
     if(customElements){
       return this.percentageComp(100.00, customElements, volume);
     }
     let randomNum = Math.floor(Math.random() * 96);
     let randomCollection = _.shuffle(densities);
     let randomChunk = _.chunk(randomCollection, randomNum);
     return this.percentageComp(100.00, randomChunk[1], volume)
   }
   percentageComp(percentage, elements, volume){
     let density = {
       total: 0,
     };
     elements.forEach((elem, i) => {
       if(percentage > 0){
         let random = _.random(1, percentage);
         percentage = percentage - random;
         density[elem.name] = {
           symbol: elem.symbol,
           density: elem.density,
           percentage: `%${(random)}`
         }
         let percentageOfVolume = ((random / 100) * volume);
         density.total += percentageOfVolume * elem.density.split(" ")[0];
       }
     });
     return density;
   }
   mergePlanet(p){
     console.log("before merge: ", this.x, this.y, p.x, p.y);
     console.log("before merge: ", this.gravMass, p.gravMass);
     if(this.mass < p.mass){
       this.color = p.color;
     }
     this.velocity.x = ((this.velocity.x * this.gravMass) + (p.velocity.x * p.gravMass)) / (this.gravMass + p.gravMass);
     this.velocity.y = ((this.velocity.y * this.gravMass) + (p.velocity.y * p.gravMass)) / (this.gravMass + p.gravMass);
     this.x = (this.x * this.gravMass + p.x * p.gravMass) / (this.gravMass + p.gravMass);
   	 this.y = (this.y * this.gravMass + p.y * p.gravMass) / (this.gravMass + p.gravMass);
     this.mass += p.mass;
     this.radius += p.radius;
     this.volume += p.volume;
     this.gravMass += p.gravMass;
     this.width = p.radius * 2;
     this.height = p.width;
     if(this.drawRad < 50){
       this.drawRad += p.drawRad;
     }
     console.log("after merge: ", this.gravMass);
   }
   drawPlanet(screen){
     var ctx = $('#canvas')[0].getContext("2d");
     ctx.beginPath();
     ctx.arc(this.x * screen.zoomScale + screen.xOffset, this.y * screen.zoomScale + screen.yOffset, this.drawRad * screen.zoomScale, 0 , 2 * Math.PI, false);
     ctx.fillStyle = this.color.toString();
     ctx.fill();
   }
};


export default celestialObj;
