import LiveCamera from './liveCamera';
import Draw from './draw';
import SnapshotPage from '../snapshot';
import SaveImagePage from '../saveImage';
import {PAGES} from '../../shared/constants';
import {isLiveCamera} from '../../shared/config';
import {show, hide} from '../../shared/helpers';

const PAGE_NAME = PAGES.ANNOTATE;

let snapshotBtn = document.getElementById('btn-snapshot');

function initControls() {

  snapshotBtn.addEventListener('click', () => {
    Draw.snapshot();
    SnapshotPage.show();
    hide('page-annotate');
    show('page-email');
    SaveImagePage.init();
  });

}

export default {

  init: function() {
    Draw.init();
    initControls();
  },

  show: function() {

    show('page-annotate');

    /*
    if (isLiveCamera()) {
      LiveCamera();
    }
    */

    Draw.show();

  }

};
