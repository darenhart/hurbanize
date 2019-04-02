import * as hellojs from 'hellojs';
import {HEADER_HEIGHT} from '../shared/constants';
import AnnotatePage from './annotate';
import {PAGES} from '../shared/constants';
import {show, showPrompt} from '../shared/helpers';

const hello = hellojs.default;
const PAGE_NAME = PAGES.SNAPSHOT;
const MAX_IMAGE_HEIGHT = 1000;

let backBtn = document.getElementById('btn-back-snapshot');
let tweetButton = document.getElementById('btn-share-twitter');
let drawingCanvas = document.getElementById('canvas-draw');
let emojiCanvas = document.getElementById('canvas-emoji');
let saveCanvas = document.getElementById('canvas-save');
let saveCanvasBefore = document.getElementById('canvas-save-before');
let saveImage = document.getElementById('image-save');
let imageBefore = document.getElementById('image-before');
let saveCtx = saveCanvas.getContext('2d');
let saveBeforeCtx = saveCanvasBefore.getContext('2d');
let cameraCanvas;
let maxWidth;
let maxHeight;

function initSave() {

  // May have been swapped out after initial app load
  cameraCanvas = document.getElementById('canvas-camera');

  if (MAX_IMAGE_HEIGHT > cameraCanvas.height) {
    maxWidth  = cameraCanvas.width;
    maxHeight = cameraCanvas.height;
  } else {
    maxWidth = (MAX_IMAGE_HEIGHT / cameraCanvas.height) * cameraCanvas.width;
    maxHeight = MAX_IMAGE_HEIGHT;
  }

  saveImage.width  = maxWidth;
  saveImage.height = maxHeight;
  saveCanvas.width  = maxWidth;
  saveCanvas.height = maxHeight;
  saveCanvas.style.width = maxWidth;
  saveCanvas.style.height = maxHeight;

  imageBefore.width  = maxWidth;
  imageBefore.height = maxHeight;
  saveCanvasBefore.width = maxWidth;
  saveCanvasBefore.height = maxHeight;
  saveCanvasBefore.style.width = maxWidth;
  saveCanvasBefore.style.height = maxHeight;

  saveCtx.font = '13px sans-serif';
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
    saveCtx.fillText('hurbanize.com', saveCanvas.width - 95, saveCanvas.height - 10);

    saveImage.src = saveCanvas.toDataURL('image/png');
    saveCanvas.style.display = 'none';
    saveImage.style.display = 'block';

    // save image before - without draw
    saveBeforeCtx.drawImage(cameraCanvas, 0, 0, saveCanvasBefore.width, saveCanvasBefore.height);
    imageBefore.src = saveCanvasBefore.toDataURL('image/png');

  }

};
