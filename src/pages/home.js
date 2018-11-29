import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {setLiveCamera} from '../shared/config';
import {showPage} from '../shared/helpers';
import AnnotatePage from './annotate';
import SelectImagePage from './selectImage';

const PAGE_NAME = PAGES.HOME;
//const PAGE_NAME = PAGES.SELECTIMAGE;

let cameraCanvas = document.getElementById('canvas-camera');
let startBtn = document.getElementById('btn-start-app');

function initCanvas() {
  cameraCanvas.width = window.innerWidth;
  cameraCanvas.height = window.innerHeight * (75/100);
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
