import {HEADER_HEIGHT} from '../../shared/constants';
import {showPrompt} from '../../shared/helpers';

let video;

function initCamera() {

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showPrompt('webrtc-unsupported');
    return;
  }

  var constraints = { 
    video: {
      facingMode: "environment",
      width: window.innerWidth,
      height: window.innerHeight
    } 
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    // Older browsers may not have srcObject
    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      video.src = window.URL.createObjectURL(stream);
    }
  }).catch((err) => {
    console.error('getUserMedia error', err);
    showPrompt('custom1', err);
  });;

}

export default {
  init: function(videoEl) {
    video = videoEl;
    initCamera();
  },

  stop: function() {
    if (video.srcObject && video.srcObject.getTracks()[0]) {
      video.srcObject.getTracks()[0].stop();    
    }
  }
}
