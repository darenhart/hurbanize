import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {show,hide,showPrompt} from '../shared/helpers';
import HomePage from './home';
import SelectImagePage from './selectImage';

let sendEmailBtn = document.getElementById('btn-send-email');
let finishBtn = document.getElementById('btn-finish');
let sendEmailInput = document.getElementById('input-email');
let imageSave = document.getElementById('image-save');
let newUserRef;
let database;
let usersRef;

function initFirebaseUserRef() {
  var config = {
    apiKey: "AIzaSyDucetj0pW58ZidLSZDJIcH8dPWbEAPf0E",
    //authDomain: "pwa-draw-dev-72035729357.firebaseapp.com",
    databaseURL: "https://pwa-draw-dev-72035729357.firebaseio.com",
    projectId: "pwa-draw-dev-72035729357",
    storageBucket: "pwa-draw-dev-72035729357.appspot.com",
    //messagingSenderId: "1097628844134"
  };
  firebase.initializeApp(config);
  database = firebase.database();
  usersRef = database.ref('users');
}
initFirebaseUserRef();

function restartApp() {
  //showPrompt('image-saved');
  window.location.reload();
}

function initControls() {

  sendEmailBtn.addEventListener('click', function () {
    saveEmail();
  });

  finishBtn.addEventListener('click', function () {
    restartApp();
  });

}

function saveImage() {
  newUserRef = usersRef.push();
  return newUserRef.set({
    'email': '',
    'img': imageSave.src,
    'scenario': SelectImagePage.getSelectedScenario(),
    'timestamp': new Date().toString(),
    'checked': '',
  });
}

function saveEmail() {
  newUserRef.update({
    'email': sendEmailInput.value
  });
  hide('page-share');
  show('page-success');
  setTimeout(() => {
    restartApp();
  }, 3000);
}

export default {
  init: function() {
    saveImage();
    initControls();
  },
};
