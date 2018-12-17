import * as hellojs from 'hellojs';
import {HEADER_HEIGHT} from '../shared/constants';
import AnnotatePage from './annotate';
import {PAGES} from '../shared/constants';
import {show, showPrompt} from '../shared/helpers';

const hello = hellojs.default;
const PAGE_NAME = PAGES.SNAPSHOT;

let backBtn = document.getElementById('btn-back-snapshot');
let tweetButton = document.getElementById('btn-share-twitter');
let drawingCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji');
let saveCanvas = document.getElementById('canvas-save');
let saveImage = document.getElementById('image-save');
let saveCtx = saveCanvas.getContext('2d');
let cameraCanvas;

function initSave() {

  // May have been swapped out after initial app load
  cameraCanvas = document.getElementById('canvas-camera');

  saveCanvas.width  = cameraCanvas.width;
  saveCanvas.height = cameraCanvas.height;

  saveCanvas.style.width = cameraCanvas.style.width;
  saveCanvas.style.height = cameraCanvas.style.height;

  //saveImage.width  = drawingCanvas.width;
  //saveImage.height = drawingCanvas.height;

  saveCtx.font = '16px Arial';
  saveCtx.fillStyle = '#fff';

}

function initControls() {

}

export default {

  init: function() {
  },

  show: function() {

    initSave();

    // Copy the other canvases onto a single canvas for saving
    saveCtx.drawImage(cameraCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
    saveCtx.drawImage(drawingCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
    saveCtx.drawImage(emojiCanvas, 0, 0, saveCanvas.width, saveCanvas.height);

    // Add the URL at the bottom
    saveCtx.fillText('hurbanize', saveCanvas.width - 72, saveCanvas.height - 10);

    saveImage.src = saveCanvas.toDataURL('image/png');
    saveCanvas.style.display = 'none';
    saveImage.style.display = 'block';

    //show('page-snapshot');

  }

};
