import LiveCamera from './annotate/liveCamera';
import {show, hide} from '../shared/helpers';

let video = document.querySelector('video');
let canvas = document.getElementById('canvas-take-photo');

export default {

  init: function() {
  },

  show: function() {

    show('page-take-photo');

    LiveCamera(video, canvas);

  }
};
