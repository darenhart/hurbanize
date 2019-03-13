import LiveCamera from './liveCamera';
import Draw from './draw';
import {PAGES} from '../../shared/constants';
import {isLiveCamera} from '../../shared/config';
import {show, hide} from '../../shared/helpers';

export default {

  init: function() {
    Draw.init();
  },

  show: function() {

    show('page-annotate');

    if (isLiveCamera()) {
      LiveCamera();
    }

    Draw.show();

  }
};
