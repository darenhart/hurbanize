import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {setLiveCamera} from '../shared/config';
import {show,hide} from '../shared/helpers';
import AnnotatePage from './annotate';
import TakePhotoPage from './takePhoto';
import SelectImagePage from './selectImage';

const PAGE_NAME = PAGES.HOME;
//const PAGE_NAME = PAGES.SELECTIMAGE;

let cameraCanvas = document.getElementById('canvas-camera');
let startSelectImageBtn = document.getElementById('btn-start-select-image');
let startLivaCamBtn = document.getElementById('btn-start-live-cam');
let startTakePhotoBtn = document.getElementById('btn-start-take-photo');

function initCanvas() {
  cameraCanvas.width = window.innerWidth;
  cameraCanvas.height = window.innerHeight * (75/100);
}

function detectInactivity() {
  var idleTime = 0;
  var maxIdleTime = 5; // minutes

  //Increment the idle time counter every minute.
  var idleInterval = setInterval(timerIncrement, 60000); // 1 minute 60000

  //Zero the idle timer on mouse movement.
  document.addEventListener('touchmove', () => {idleTime = 0}, false);
  document.addEventListener('mousemove', () => {idleTime = 0}, false);

  function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime >= maxIdleTime) {
        window.location.reload();
    }
  }
}

function initControls() {

  startSelectImageBtn.addEventListener('click', function () {
     hide('page-home');
     show('page-select-image');
     detectInactivity();
  });

  startLivaCamBtn.addEventListener('click', function () {
    setLiveCamera(true);
    AnnotatePage.show();
    hide('page-home');
    window.location.hash = 'annotate';
    detectInactivity();
  });

  startTakePhotoBtn.addEventListener('click', function () {
    //setLiveCamera(true);
    hide('page-home');
    TakePhotoPage.show();
    window.location.hash = 'take-photo';
    detectInactivity();
  });

}

export default {

  init: function() {
    window.location.hash = '';
    initCanvas();
    initControls();
  },

  show: function() {
    show('page-home');
    hide('page-select-image');
    hide('page-annotate');
    hide('page-snapshot');
    hide('page-share');
  }

};
