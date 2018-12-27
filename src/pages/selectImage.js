import LoadImage from 'blueimp-load-image';
import {PAGES} from '../shared/constants';
import {show,hide} from '../shared/helpers';
//import HomePage from './home';
import scenariosImages from '\0scenarios';
import AnnotatePage from './annotate';


const PAGE_NAME = PAGES.SELECTIMAGE;

let scenarioList = document.getElementById('scenario-list');
let cameraCanvas = document.getElementById('canvas-camera');
let drawCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji'); 
let annotateCameraContainer = document.getElementById('annotate-camera-container');

let selectedScenario = '';

let address = [
  ['Porto Alegre', 'Praça Raul Pilla'],
  ['São Paulo', 'R. Nestor Pestana'],
  ['Porto Alegre', 'R. Sarmento Leite'],
  ['São Paulo', 'R. Com. Assad Abdalla'],
  ['Porto Alegre', 'Escadaria 24 de Maio'],
  ['São Paulo', 'São Bento'],
  ['Porto Alegre', 'Cais Mauá'],
  ['São Paulo', 'R. XV de Novembro'],
  ['Porto Alegre', 'Av. Borges de Medeiros'],
  ['São Paulo', 'R. Sen. Queirós'],
];

function onPhotoInputChange(path) {

  const options = {
    maxWidth: cameraCanvas.width,
    contain: true,
    orientation: true,
    canvas: true,
    pixelRatio: devicePixelRatio
  };

  function onImageLoad(result) {
    if (result.type === 'error') {
      console.error('Error loading image', result);
    } else {

      console.log('Generated canvas width and height', result.width, result.height);

      // Replace our default canvas (for video) with the generated one
      result.id = 'canvas-camera';

      annotateCameraContainer.removeChild(cameraCanvas);
      annotateCameraContainer.appendChild(result);

      cameraCanvas = result;

      const newWidth = cameraCanvas.style.width ? parseInt(cameraCanvas.style.width) : cameraCanvas.width;
      const newHeight = cameraCanvas.style.height ? parseInt(cameraCanvas.style.height) : cameraCanvas.height;

      // Make drawing canvas the same size
      drawCanvas.width = newWidth;
      drawCanvas.height = newHeight;
      emojiCanvas.width = newWidth;
      emojiCanvas.height = newHeight;

    }
  }

  // A little library which handles rotating the image appropriately depending
  // on the image's orientation (determined from the exif data) & scaling to fit
  LoadImage(path, onImageLoad, options);

}

function initControls() {
  let cards = document.getElementsByClassName('card');

  for (let i=0; i < cards.length; i++) {
    cards[i].addEventListener('click', function() {
      selectedScenario = scenariosImages[i];
      onPhotoInputChange(scenariosImages[i]);
      AnnotatePage.show();
      hide('page-select-image');
      window.location.hash = 'annotate';
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
          <div class="card-desc">
            <p class="text-purple mb-0 mt-1">${address[i][0]}</p>
            <p class="text-grey small mt-0">${address[i][1]}</p>
          </div>
        </div>`;
  }

  scenarioList.innerHTML = html;

}

export default {

  init: function () {
    initScenarios();
    initControls();    
  },

  getSelectedScenario: function() {
    return selectedScenario;
  }

};
