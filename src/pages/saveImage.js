import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {show,hide,showPrompt} from '../shared/helpers';
import HomePage from './home';

let sendEmailBtn = document.getElementById('btn-send-email');
let finishBtn = document.getElementById('btn-send-email');
let sendEmailInput = document.getElementById('input-email');
let imageSave = document.getElementById('image-save');

function initFirebase() {
  var config = {
    apiKey: "AIzaSyDucetj0pW58ZidLSZDJIcH8dPWbEAPf0E",
    //authDomain: "pwa-draw-dev-72035729357.firebaseapp.com",
    databaseURL: "https://pwa-draw-dev-72035729357.firebaseio.com",
    projectId: "pwa-draw-dev-72035729357",
    storageBucket: "pwa-draw-dev-72035729357.appspot.com",
    //messagingSenderId: "1097628844134"
  };
  firebase.initializeApp(config);
}

function restartApp() {
  showPrompt('image-saved');
  hide('page-email');
  //HomePage.init();
  //HomePage.show();
}

function initControls() {

  var database = firebase.database();
  var usersRef = database.ref('users');

  sendEmailBtn.addEventListener('click', function () {
    var newUserRef = usersRef.push();
    newUserRef.set({
      'email': sendEmailInput.value,
      'img': imageSave.src
    });
    var path = newUserRef.toString();
    if (path) {
      restartApp();
    }
  });

  finishBtn.addEventListener('click', function () {
    hide('page-email');
  });

}

export default {

  init: function() {
    initFirebase();
    initControls();
  },
};
