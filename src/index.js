import SWRegister from './swRegister';

import Pages from './pages';
import TakePhotoPage from './pages/takePhoto';

function initApp() {
  SWRegister();
}

function initPages(pages) {
  for (let page of pages) {
    page.init();
  }
}

initApp();
initPages(Pages);
TakePhotoPage.show();
