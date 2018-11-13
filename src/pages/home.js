import LoadImage from 'blueimp-load-image';
import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {setLiveCamera} from '../shared/config';
import {showPage} from '../shared/helpers';
import AnnotatePage from './annotate';
import SelectImagePage from './selectImage';

const PAGE_NAME = PAGES.HOME;
//const PAGE_NAME = PAGES.SELECTIMAGE;

let inputPhoto = document.getElementById('input-photo');
let startCameraSection = document.getElementById('start-camera');
let startCameraBtn = document.getElementById('btn-start-camera');
let annotateCameraContainer = document.getElementById('annotate-camera-container');
let cameraCanvas = document.getElementById('canvas-camera');
let drawCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji'); 
let startBtn = document.getElementById('btn-start-app');

function onPhotoInputChange(e) {

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

      setLiveCamera(false);

      AnnotatePage.show();
    }
  }

  // A little library which handles rotating the image appropriately depending
  // on the image's orientation (determined from the exif data) & scaling to fit
  LoadImage(e.target.files[0], onImageLoad, options);

}

function initCanvas() {
  cameraCanvas.width = window.innerWidth;
  cameraCanvas.height = window.innerHeight - HEADER_HEIGHT;
}

function initControls() {

  startBtn.addEventListener('click', function () {
    SelectImagePage.show();
  })


}

export default {

  init: function() {
    initCanvas();
    initControls();
  },

  show: function() {
    showPage(PAGE_NAME);
  }

};
