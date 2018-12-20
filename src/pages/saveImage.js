import {PAGES, HEADER_HEIGHT} from '../shared/constants';
import {show,hide,showPrompt} from '../shared/helpers';
import HomePage from './home';
import SelectImagePage from './selectImage';

let formEmail = document.getElementById('form-email');
let sendEmailInput = document.getElementById('input-email');
let imageSave = document.getElementById('image-save');
let newUserRef;
let database;
let usersRef;

function initFirebaseUserRef() {
  var config = {
    apiKey: "AIzaSyBbyExXHZCfbWT6O_4nq9ahMlG8bsMpnwc",
    authDomain: "hurbanize-expo.firebaseapp.com",
    databaseURL: "https://hurbanize-expo.firebaseio.com",
    projectId: "hurbanize-expo",
    storageBucket: "hurbanize-expo.appspot.com",
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

  formEmail.addEventListener("submit", function(e){
    e.preventDefault();
    saveEmail();
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
  }, 10000);
}

export default {
  init: function() {
    saveImage();
    initControls();
  },
};
