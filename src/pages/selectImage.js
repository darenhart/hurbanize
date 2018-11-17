import {PAGES} from '../shared/constants';
import {showPage} from '../shared/helpers';
//import HomePage from './home';
import scenariosImages from '\0scenarios';
import AnnotatePage from './annotate';

const PAGE_NAME = PAGES.SELECTIMAGE;

let scenarioList = document.getElementById('scenario-list');
let cameraCanvas = document.getElementById('canvas-camera');
let drawCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji'); 

function onSelectPhoto(path) {

  let ctx = cameraCanvas.getContext('2d');
  let img = new Image();

  img.onload = function () {
      ctx.drawImage(img, 0, 0);
  };

  img.src = path;

  const newWidth = cameraCanvas.style.width ? parseInt(cameraCanvas.style.width) : cameraCanvas.width;
  const newHeight = cameraCanvas.style.height ? parseInt(cameraCanvas.style.height) : cameraCanvas.height;

  // Make drawing canvas the same size
  drawCanvas.width = newWidth;
  drawCanvas.height = newHeight;
  emojiCanvas.width = newWidth;
  emojiCanvas.height = newHeight;

}


function initControls() {
  let cards = document.getElementsByClassName('card');

  for (let i=0; i < cards.length; i++) {
    cards[i].addEventListener('click', function() {
      onSelectPhoto(scenariosImages[i]);
      AnnotatePage.show();
    });
  }
}

function initScenarios() {

  let html = '';

  for (let i=0; i < scenariosImages.length; i++) {
    const path = scenariosImages[i];
    html += `
        <div class="card">
          <img src="${path}" alt="scenario"/>
          <p>Porto Alegre, RS</p>
          <p>Avenida João Pessoa</p>
        </div>`;
  }

  scenarioList.innerHTML = html;

}

export default {

  init: function () {
    initScenarios();
    initControls();    
  },

  show: function() {
    showPage(PAGE_NAME);
  }

};
