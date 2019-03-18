import LiveCamera from './annotate/liveCamera';
import {show, hide} from '../shared/helpers';
import AnnotatePage from './annotate';

let video = document.querySelector('video');
let drawCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji'); 
let canvasTakePhoto;
let cameraCanvas;


export default {

  init: function() {

    canvasTakePhoto = document.getElementById('canvas-take-photo');
    canvasTakePhoto.addEventListener('click', () => {

      cameraCanvas = document.getElementById('canvas-camera');
      canvasTakePhoto = document.getElementById('canvas-take-photo');
      let ctxCameraCanvas = cameraCanvas.getContext('2d');

      const newWidth = cameraCanvas.style.width ? parseInt(cameraCanvas.style.width) : cameraCanvas.width;
      const newHeight = cameraCanvas.style.height ? parseInt(cameraCanvas.style.height) : cameraCanvas.height;

      // Make drawing canvas the same size
      drawCanvas.width = newWidth;
      drawCanvas.height = newHeight;
      emojiCanvas.width = newWidth;
      emojiCanvas.height = newHeight;

      const xPhoto = (canvasTakePhoto.height - drawCanvas.height) / 2
      ctxCameraCanvas.drawImage(canvasTakePhoto, 0, xPhoto*-1, canvasTakePhoto.width, canvasTakePhoto.height);

      LiveCamera.stop();      
      AnnotatePage.show();
      hide('page-take-photo');
      window.location.hash = 'annotate';

    });

  },

  show: function() {


    show('page-take-photo');
    this.init();

    LiveCamera.init(video, canvasTakePhoto);

  }
};
