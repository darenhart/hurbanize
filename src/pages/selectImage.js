import {PAGES} from '../shared/constants';
import {onPhotoInputChange} from '../shared/onPhotoInputChange';
import {show,hide} from '../shared/helpers';
//import HomePage from './home';
import scenariosImages from '\0scenarios';
import AnnotatePage from './annotate';

const PAGE_NAME = PAGES.SELECTIMAGE;

let scenarioList = document.getElementById('scenario-list');

let selectedScenario = '';

let address = [
  ['Porto Alegre', 'Praça Raul Pilla'],
  ['São Paulo', 'R. Nestor Pestana'],
  ['Porto Alegre', 'R. Sarmento Leite'],
  ['São Paulo', 'R. Com. Assad Abdalla'],
  ['Porto Alegre', 'Escadaria 24 de Maio'],
  ['São Paulo', 'R. São Bento'],
  ['Porto Alegre', 'Cais Mauá'],
  ['São Paulo', 'R. XV de Novembro'],
  ['Porto Alegre', 'Av. Borges de Medeiros'],
  ['São Paulo', 'R. Sen. Queirós'],
];


function initControls() {
  let cards = document.getElementsByClassName('card');

  for (let i=0; i < cards.length; i++) {
    cards[i].addEventListener('click', function() {
      selectedScenario = scenariosImages[i];
      onPhotoInputChange(scenariosImages[i]);
      AnnotatePage.show();
      hide('page-select-image');
      window.location.hash = 'annotate';
    });
  }
}

function initScenarios() {

  let html = '';
  for (let i=0; i < scenariosImages.length; i++) {
    const path = scenariosImages[i];
    html += `
        <div class="card">
          <img src="${path}" alt="scenario"/>
          <div class="card-desc">
            <p class="text-purple mb-0 mt-1">${address[i][0]}</p>
            <p class="text-grey small mt-0">${address[i][1]}</p>
          </div>
        </div>`;
  }

  scenarioList.innerHTML = html;

}

export default {

  init: function () {
    initScenarios();
    initControls();    
  },

  getSelectedScenario: function() {
    return selectedScenario;
  }

};
