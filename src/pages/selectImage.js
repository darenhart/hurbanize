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
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
  ['Estrela, RS', 'Coronel Floriano'],
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
  ['Porto Alegre, RS', 'Avenida João Pessoa'],
];

function onPhotoInputChange(path) {

  console.log('Min width and height', cameraCanvas.width, cameraCanvas.height);

  const options = {
    maxWidth: cameraCanvas.width,
    maxHeight: cameraCanvas.height,
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
          <p>${address[i][0]}</p>
          <p>${address[i][1]}</p>
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
