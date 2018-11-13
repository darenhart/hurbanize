import {PAGES} from '../shared/constants';
import {showPage} from '../shared/helpers';
import HomePage from './home';

const PAGE_NAME = PAGES.SELECTIMAGE;

function initControls() {
  //homeLink.addEventListener('click', function() {
  //  HomePage.show();
  //});
}

function initScenarios() {

  let html = '';

  for (let i=0; i < emojiImages.length; i++) {
    const path = emojiImages[i];
    html += `<img src="${path}" alt="Emoji"/>`;
  }

  emojiModal.innerHTML = html;

}

export default {

  init: function() {
    initControls();
  },

  show: function() {
    showPage(PAGE_NAME);
  }

};
