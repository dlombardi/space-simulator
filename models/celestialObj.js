'use strict';

import densities from './densities';
import _ from 'lodash';

//generates random elements if no config elements are given

class celestialObj{
   constructor(spec){
     this.radius = spec.kmRadius ? spec.kmRadius : this.generateRadius();
     this.drawRad = Math.cbrt((this.radius / 2));
     this.volume = ((4 * Math.PI) * Math.pow(this.radius, 3))/3;
     this.density = this.randomComposition(this.volume, spec.customElements);
     this.mass = this.massCalc(this.density);
     this.gravMass = this.mass * .00000001
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
     let radius = prob < 6.6 ? Math.floor(Math.random() * 500) : Math.floor(Math.random() * 1000);
     return radius;
   }
   randomComposition(volume, customElements){
     if(customElements){
       return this.formatCustomElements(customElements);
     }
     let randomNum = Math.floor(Math.random() * 96);
     let randomCollection = _.shuffle(densities);
     let randomChunk = _.chunk(randomCollection, randomNum);
     return this.percentageComp(100.00, randomChunk[1], volume)
   }
   percentageComp(percentage, elements, volume){
     let finalElements = [];
     elements.forEach((elem, i) => {
       if(percentage > 0){
         let random = _.random(1, percentage);
         percentage = percentage - random;
         let elementObj = {
           name: elem.name,
           symbol: elem.symbol,
           density: elem.density,
           percentage: `${(random)}%`,
           percentageVal: random
         }
         let portionOfVolume = ((random / 100) * volume);
         elementObj.portionOfMass = portionOfVolume * Number(elem.density.split(" ")[0]);
         finalElements.push(elementObj);
       }
     });
     return _.sortBy(finalElements, 'percentageVal').reverse();
   }

   massCalc(density){
     return density.reduce((acc, curr) => {
       return acc + curr.portionOfMass;
     }, 0);
   }

   compMerge(p1Elems, p2Elems){
     p2Elems.forEach(elem => {
       let p1Index = _.findIndex(p1Elems, { name: elem.name });
       if(p1Index === -1){
         p1Elems.push(elem);
       } else {
         p1Elems[p1Index].portionOfMass += elem.portionOfMass;
       }
     });

     let massSum = p1Elems.reduce((acc, curr) => {
       return acc + curr.portionOfMass;
     }, 0);

     let finalElements = p1Elems.map(elem => {
       let percentage = ((elem.portionOfMass / this.mass) * 100);

       return {
         name: elem.name,
         symbol: elem.symbol,
         density: elem.density,
         percentage: `${percentage.toFixed(3)}%`,
         percentageVal: percentage,
         portionOfMass: elem.portionOfMass,
       }
     });
     return _.sortBy(finalElements, 'percentageVal').reverse();
   }

   mergePlanet(p){

     if(this.radius < p.radius){
       this.color = p.color;
     }

     this.velocity.x = ((this.velocity.x * this.gravMass) + (p.velocity.x * p.gravMass)) / (this.gravMass + p.gravMass);
     this.velocity.y = ((this.velocity.y * this.gravMass) + (p.velocity.y * p.gravMass)) / (this.gravMass + p.gravMass);
     this.x = (this.x * this.gravMass + p.x * p.gravMass) / (this.gravMass + p.gravMass);
   	 this.y = (this.y * this.gravMass + p.y * p.gravMass) / (this.gravMass + p.gravMass);
     this.mass += p.mass;
     this.radius += p.radius;
     this.volume += p.volume;
     this.density = this.compMerge(_.values(this.density), _.values(p.density));
     this.gravMass += p.gravMass;
     this.width = p.radius * 2;
     this.height = p.width;
     if(this.drawRad < 100){
       this.drawRad += p.drawRad;
     }
   }

   drawPlanet(screen){
     var ctx = $('#canvas')[0].getContext("2d");
     ctx.beginPath();
     ctx.arc(this.x * screen.zoomScale + screen.xOffset, this.y * screen.zoomScale + screen.yOffset, this.drawRad * screen.zoomScale, 0 , 2 * Math.PI, false);
     ctx.fillStyle = this.color.toString();
     ctx.fill();
   }

   isPointInside(x,y){
     var dx = this.x - x;
     var dy = this.y - y;
     return( Math.pow(dx, 2) + Math.pow(dy, 2) <= Math.pow(this.radius, 2));
   }

   formatCustomElements(customElements){
      formatCustomElements
   }

};


export default celestialObj;
