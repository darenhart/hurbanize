import SWRegister from './swRegister';

import Pages from './pages';
import HomePage from './pages/home';

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
HomePage.show();
