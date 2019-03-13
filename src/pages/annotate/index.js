import LiveCamera from './liveCamera';
import Draw from './draw';
import {PAGES} from '../../shared/constants';
import {isLiveCamera} from '../../shared/config';
import {show, hide} from '../../shared/helpers';

let video = document.querySelector('video');
let canvas = document.getElementById('canvas-camera');

export default {

  init: function() {
    Draw.init();
  },

  show: function() {

    show('page-annotate');

    if (isLiveCamera()) {
      LiveCamera(video, canvas);
    }

    Draw.show();

  }
};
