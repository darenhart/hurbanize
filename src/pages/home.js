import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {setLiveCamera} from '../shared/config';
import {show,hide} from '../shared/helpers';
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
    hide('page-home');
  })

}

export default {

  init: function() {
    window.location.hash = '';
    initCanvas();
    initControls();
  },

  show: function() {
    show('page-home');
    show('page-select-image');
    hide('page-annotate');
    hide('page-snapshot');
    hide('page-share');
    hide('page-email');
    SelectImagePage.init();
  }

};
