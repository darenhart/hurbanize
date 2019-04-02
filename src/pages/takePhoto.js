import LiveCamera from './annotate/liveCamera';
import {show, hide} from '../shared/helpers';
import AnnotatePage from './annotate';

let video = document.querySelector('video');
let drawCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji'); 
let cameraCanvas = document.getElementById('canvas-camera');
let innerAnnotate = document.getElementById('inner-annotate');
let takePhotoBtn = document.getElementById('btn-take-photo');


export default {

  init: function() {

    takePhotoBtn.addEventListener('click', () => {

      //LiveCamera.stop();      
      AnnotatePage.show();
      hide('page-take-photo');
      window.location.hash = 'annotate';

      cameraCanvas.height = innerAnnotate.offsetHeight;
      cameraCanvas.width = innerAnnotate.offsetWidth;

      let ctxCameraCanvas = cameraCanvas.getContext('2d');

      const newWidth = cameraCanvas.style.width ? parseInt(cameraCanvas.style.width) : cameraCanvas.width;
      const newHeight = cameraCanvas.style.height ? parseInt(cameraCanvas.style.height) : cameraCanvas.height;

      // Make drawing canvas the same size
      drawCanvas.width = newWidth;
      drawCanvas.height = newHeight;
      emojiCanvas.width = newWidth;
      emojiCanvas.height = newHeight;

      ctxCameraCanvas.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height, 0, 0,cameraCanvas.width, cameraCanvas.height );

    });

  },

  show: function() {
    show('page-take-photo');
    window.location.hash = '#take-photo';
    LiveCamera.init(video);
  }
};
