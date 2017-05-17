'use strict';

import fs from 'fs';
import Xray from 'x-ray';

const x = Xray();

x("http://environmentalchemistry.com/yogi/periodic/density.html", "table", ["td"])((err, elements) => {
  let densities = [];
  for(var i = 3; i < elements.length; i+=4){
    var elem = {};
    elem.density = elements[i - 3];
    elem.name = elements[i - 2];
    elem.symbol = elements[i - 1];
    densities.push(elem);
  }
  fs.writeFile('./elements.json', JSON.stringify(densities), (err) => {
    if(err) throw err;
    console.log('Elements are scraped and saved!')
  });
});
