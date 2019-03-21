import emojiImages from '\0emoji-images';
import {HEADER_HEIGHT} from '../../shared/constants';
import {isLiveCamera} from '../../shared/config';
import {show, hide, mobileLog} from '../../shared/helpers';
import SnapshotPage from '../snapshot';
import SaveImagePage from '../saveImage';

//const DEFAULT_COLOUR = '#FF2626';
//const DEFAULT_EMOJI_SIZE = 60;
//const DEFAULT_EMOJI_FONT = 'arial';
const DEFAULT_LINE_WIDTH = 12.5;
const RENDERING_STROKE_TIME = 13;

const TOOL_PENCIL = 0;
const TOOL_BRUSH = 1;
const TOOL_EMOJI = 2;
const TOOL_ERASE = 3;

let currentColor = '#FF2626';

let colors = {
  'white': '#FFFFFF',
  'blue': '#4390CB',
  'green': '#55C53E',
  'beige': '#EBBE8B',
  'grey': '#989898',
  'red': '#FF2626',
  'purple': '#B649D6'
};

let canvasDraw = document.getElementById('canvas-draw');
let canvasEmoji = document.getElementById('canvas-emoji');
let ctxDraw;
let ctxEmoji;

let chosenTool = '';//TOOL_PENCIL;
let toolsMenuButton = document.getElementById('btn-tools');
//let toolsModal = document.getElementById('modal-tools');
let pencilButton = document.getElementById('btn-pencil');
let undoButton = document.getElementById('btn-undo');
let eraseButton = document.getElementById('btn-erase');
//let brushButton = document.getElementById('btn-brush');
let emojiMenuButton = document.getElementById('btn-emoji');
let emojiModal = document.getElementById('modal-emoji');
let emojiList = document.getElementById('emoji-list');
let optionsMenuButton = document.getElementById('btn-options');
//let optionsModal = document.getElementById('modal-options');
let colourInputContainer = document.getElementById('input-colour-container');
let colourInput = document.getElementById('input-colour');
let sizeInput = document.getElementById('input-size');
let sizeOutput = document.getElementById('size-output');
let trashButton = document.getElementById('btn-trash');

let colorList = document.getElementById('colors');
let toolbarAnnotate = document.getElementById('toolbar-annotate');
let toolsHome = document.getElementById('tools-home');
let toolsDraw = document.getElementById('tools-draw');
let toolsShare = document.getElementById('tools-share');
let toolsDrawControl = document.getElementById('tools-draw-control');
let toolsOptions = document.getElementById('tools-options');
let toolsDrawBtn = document.getElementById('btn-tools-draw');
let figuresBtn = document.getElementById('btn-figures');
let colorBtns = document.getElementsByClassName('btn-color');
let shareBtn = document.getElementById('btn-share');
let shareConfirmBtn = document.getElementById('btn-share-confirm');
let shareConfirmBackBtn = document.getElementById('btn-share-confirm-back');

let toolsFigure = document.getElementById('tools-figure');
let figureFrontBtn = document.getElementById('btn-figure-front');
let figureBackBtn = document.getElementById('btn-figure-back');
let figureDeleteBtn = document.getElementById('btn-figure-delete');
let figureUndoBtn = document.getElementById('btn-figure-undo');
let figureFrontLabel = document.getElementById('count-front');
let figureBackLabel = document.getElementById('count-back');

let bubbleConfirmDraw = document.getElementById('bubble-confirm-draw');
let bubbleFigureFront = document.getElementById('bubble-figure-front');
let bubbleFigureBack = document.getElementById('bubble-figure-back');

let touchedEmojiIndex = -1;
let selectedEmojiIndex = -1;
let chosenEmoji = null;
let resizeTouchDelta = null;
let moveTouchDelta = null;
let isDrawing = false;
let isRedrawing = false;
let isUndoing = false;
let isResizing = false;
let isTouching = [];
let isFisrtDraw = true;
let isFirstBubbleBack = true;
let isFirstBubbleFront = true;

let lastStrokeTime = performance.now();

// for undo feature store all drawing 
let drawingCoords = [];

// Store emoji details so we can redraw them when moved/resized
let stampedEmojis = [];

// Store emojis history for undo feature
let historyEmojis = [];

function initVars() {
  drawingCoords = [];
  stampedEmojis = [];
  historyEmojis = [];
  ctxDraw = canvasDraw.getContext('2d');
  ctxEmoji = canvasEmoji.getContext('2d');
  isFisrtDraw = true;
  isFirstBubbleBack = true;
  isFirstBubbleFront = true;
}

function initCanvases() {

  clearCanvases();

  // Emoji canvas is on top so will receive the interaction events
  canvasEmoji.addEventListener('touchstart', onTouchStartOrMouseDown, false);
  canvasEmoji.addEventListener('touchmove', onTouchMoveOrMouseMove, false);
  canvasEmoji.addEventListener('touchend', onTouchEndOrMouseUp, false);

  canvasEmoji.addEventListener('mousedown', onTouchStartOrMouseDown, false);
  canvasEmoji.addEventListener('mousemove', onTouchMoveOrMouseMove, false);
  canvasEmoji.addEventListener('mouseup', onTouchEndOrMouseUp, false);

  ctxDraw.strokeStyle = currentColor;
  ctxDraw.lineWidth = DEFAULT_LINE_WIDTH;
}

/**
 * Returns index of touched emoji in the stampedEmojis, or -1 if none touched.
 */
function indexOfSelectedEmoji(coords) {

  // Go through in reverse order to select top-most if overlapping
  for (let i = stampedEmojis.length - 1; i >= 0; i--) {

    let emoji = stampedEmojis[i];

    if (coords.x >= emoji.x - (emoji.width / 2) &&
        coords.x <= emoji.x + (emoji.width / 2) &&
        coords.y >= emoji.y - (emoji.height / 2) &&
        coords.y <= emoji.y + (emoji.height / 2)) {
      return i;
    }

  }

  return -1;

}

function addEmojiHistory() {
  for (let i=0; i < stampedEmojis.length; i++) {
    stampedEmojis[i]['selected'] = false;
  }
  if (stampedEmojis[selectedEmojiIndex]) {
    stampedEmojis[selectedEmojiIndex]['selected'] = true;
  }
  historyEmojis.push(JSON.parse(JSON.stringify(stampedEmojis)));
}

function drawEmoji(emoji, coords, width, height, isSelected) {

  // Centre the image around tap/click coords
  const x = coords.x - width / 2;
  const y = coords.y - height / 2;
  const emojiEl = document.getElementById(emoji);

  ctxEmoji.drawImage(emojiEl, x, y, width, height);

  if (isSelected) {
    // Highlight with a border
    const prevStrokeStyle = ctxEmoji.strokeStyle;
    const prevLineWidth = ctxEmoji.lineWidth;
    ctxEmoji.strokeStyle = colors.purple;
    ctxEmoji.lineWidth = 2;
    ctxEmoji.setLineDash([5, 2]);
    ctxEmoji.strokeRect(x-2, y-2, width+4, height+4);
    ctxEmoji.strokeStyle = prevStrokeStyle;
    ctxEmoji.lineWidth = prevLineWidth;
    ctxEmoji.setLineDash([]);
  }

}

function onDrawingMouseDown(coords) {

  ctxDraw.beginPath();
  ctxDraw.moveTo(coords.x, coords.y);
  
  const color = (chosenTool === TOOL_ERASE) ? 'erase' : currentColor;

  drawingCoords.push([{
    x: coords.x,
    y: coords.y,
    color: color
  }]);

  isDrawing = true;
}

function closeModals() {
  //optionsModal.classList.remove('show');
  //toolsModal.classList.remove('show');
  emojiModal.classList.remove('show');
}

function getCoordsTouchOrMouse(touch, e) {
  return touch ? {
      x: touch.pageX - canvasEmoji.offsetLeft, y: touch.pageY - canvasEmoji.offsetTop - HEADER_HEIGHT
    } :
    {
      x: e.clientX - canvasEmoji.offsetLeft, y: e.clientY - canvasEmoji.offsetTop - HEADER_HEIGHT
    };
}

function onTouchStartOrMouseDown(e) {

  e.preventDefault();

  closeModals();

  isTouching.push(true);
  
  let touch = e.changedTouches && e.changedTouches.length ?
    e.changedTouches[0] : null;

  let coords = getCoordsTouchOrMouse(touch, e);

  touchedEmojiIndex = indexOfSelectedEmoji(coords);

  if (chosenTool === TOOL_EMOJI) {
    if (touchedEmojiIndex > -1) {
      if (isTouching.length <= 1) {
        selectedEmojiIndex = touchedEmojiIndex;
      }
      updateFigureToolsButtons();
      redrawEmojisOnNextFrame();
    } else {
    }
  } else if (chosenTool === TOOL_PENCIL || chosenTool === TOOL_ERASE) {
    chosenEmoji = null;
    redrawEmojisOnNextFrame();
    onDrawingMouseDown(coords);
  }

}

function onTouchMoveOrMouseMove(e) {

  e.preventDefault();

  let touches = e.changedTouches || [];
  let touch1 = touches.length ? touches[0] : null;
  let touch2 = touches.length > 1 ? touches[1] : null;

  let coords1 = getCoordsTouchOrMouse(touch1, e);

  if (chosenTool === TOOL_EMOJI) {

    let emoji = stampedEmojis[selectedEmojiIndex];

    if (touch2) {

      // Resize emoji
      isResizing = true;

      let coords2 = {
        x: touch2.pageX - canvasEmoji.offsetLeft, y: touch2.pageY - canvasEmoji.offsetTop - HEADER_HEIGHT
      };
      let newResizeTouchDelta = {
        x: Math.abs(coords2.x - coords1.x),
        y: Math.abs(coords2.y - coords1.y)
      };

      if (resizeTouchDelta) {

        // keep proportion
        let newSize = ((newResizeTouchDelta.x - resizeTouchDelta.x) + (newResizeTouchDelta.y - resizeTouchDelta.y))/ 2;

        if (newSize > 0 || emoji.height + newSize > 20) {
          emoji.width += newSize * (emoji.width/emoji.height);       
          emoji.height += newSize;
        }
        
        // dont keep proportion
        //emoji.width += newResizeTouchDelta.x - resizeTouchDelta.x
        //emoji.height += newResizeTouchDelta.y - resizeTouchDelta.y;

        redrawEmojisOnNextFrame();

      }

      resizeTouchDelta = newResizeTouchDelta;

    } else if (selectedEmojiIndex == -1) {
      //selectedEmojiIndex = -1;
      //touchedEmojiIndex = -1;
      //toolsFigure.classList.remove('show');
      //redrawEmojisOnNextFrame();
    } else if (!isResizing && touchedEmojiIndex >= 0) {

      if (moveTouchDelta) {

        // Single touch - moving the emoji - update its position
        emoji.x = coords1.x - moveTouchDelta.x;
        emoji.y = coords1.y - moveTouchDelta.y;

        redrawEmojisOnNextFrame();

      } else {

        moveTouchDelta = {x: coords1.x - emoji.x, y: coords1.y - emoji.y};

      }

    }

  } else if (isDrawing && (chosenTool === TOOL_PENCIL || chosenTool === TOOL_ERASE)) {

    if (performance.now() - lastStrokeTime > RENDERING_STROKE_TIME) {
      ctxDraw.lineTo(coords1.x, coords1.y);
      ctxDraw.stroke();
      drawingCoords[drawingCoords.length - 1].push({
        x: coords1.x,
        y: coords1.y,
      });
      lastStrokeTime = performance.now();
      shareBtn.classList.remove('disabled')
    }
  }
}

function removeBubbles() {
  bubbleConfirmDraw.classList.remove('show');
  bubbleFigureFront.classList.remove('show');
  bubbleFigureBack.classList.remove('show');
}

function onTouchEndOrMouseUp(e) {
  if (historyEmojis.length && JSON.stringify(historyEmojis[historyEmojis.length - 1]) != JSON.stringify(stampedEmojis)) {
    addEmojiHistory();
  }

  if (isDrawing && isFisrtDraw) {
    isFisrtDraw = false;
    bubbleConfirmDraw.classList.add('show');
    setTimeout(() => {
      bubbleConfirmDraw.classList.remove('show');
    }, 5000);
  }

  isTouching.pop();
  isDrawing = false;
  isResizing = false;
  touchedEmojiIndex = -1;
  resizeTouchDelta = null;
  moveTouchDelta = null;
}

function updateFigureToolsButtons() {
  figureBackBtn.style.display = 'none';
  figureFrontBtn.style.display = 'none';
  figureBackLabel.style.display = 'none';
  figureFrontLabel.style.display = 'none';
  figureDeleteBtn.style.display = 'none';

  if (selectedEmojiIndex > -1 && stampedEmojis.length >= 1) {
    figureDeleteBtn.style.display = 'block';
    if (stampedEmojis.length > 1) {
      figureBackBtn.style.display = 'block';
      figureFrontBtn.style.display = 'block';
      figureBackLabel.style.display = 'block';
      figureFrontLabel.style.display = 'block';
    }
  }
  if (historyEmojis.length) {
    figureUndoBtn.style.display = 'block'; 
  } else {
    figureUndoBtn.style.display = 'none'; 
  }
  let numFront = stampedEmojis.length -1 - selectedEmojiIndex;
  let numBack = selectedEmojiIndex;
  figureFrontLabel.innerHTML = numFront;
  figureBackLabel.innerHTML = numBack;
  if (numFront == 0) {
    figureFrontBtn.disabled = true;
  } else {
    figureFrontBtn.removeAttribute('disabled');
  }
  if (numBack == 0) {
    figureBackBtn.disabled = true;
  } else {
    figureBackBtn.removeAttribute('disabled');
  }
}

function highlightSelectedTool(selectedButton) {
  var toolButtons = toolsDrawControl.getElementsByTagName('button');
  for (var i=0; i < toolButtons.length; i++) {
    var button = toolButtons[i];
    if (button === selectedButton) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  }
}

function highlightSelectedColor(selectedColor) {
  for (var i=0; i < colorBtns.length; i++) {
    var button = colorBtns[i];
    if (button === selectedColor) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  } 
}

function onNewEmojiClick(event) {

  selectedEmojiIndex = -1;
  emojiModal.classList.remove('show');
  window.location.hash = '#annotate';

  chosenTool = TOOL_EMOJI;
  
  chosenEmoji = event.currentTarget;

  if (chosenEmoji) {

    const width = chosenEmoji.width * 0.7;
    const height = chosenEmoji.height * 0.7;

    stampedEmojis.push({
      image: chosenEmoji.id,
      x: canvasEmoji.width/2,
      y: canvasEmoji.height/2,
      width: width,
      height: height
    });

  }

  selectedEmojiIndex = stampedEmojis.length -1;
  addEmojiHistory();
  updateFigureToolsButtons();
  shareBtn.classList.remove('disabled')
  redrawEmojisOnNextFrame();

  if (isFirstBubbleBack && stampedEmojis.length >= 2) {
    isFirstBubbleBack = false;
    bubbleFigureBack.classList.add('show');
    setTimeout(() => {
      bubbleFigureBack.classList.remove('show');
    }, 9000);
  }

}

function deleteEmoji() {
  stampedEmojis.splice(selectedEmojiIndex, 1);
  redrawEmojisOnNextFrame();
  selectedEmojiIndex = -1;
}
function translateEmojiZ(z) {
  if (stampedEmojis[selectedEmojiIndex + z]) {
    let tmp = stampedEmojis[selectedEmojiIndex + z];
    stampedEmojis[selectedEmojiIndex + z] = stampedEmojis[selectedEmojiIndex];
    stampedEmojis[selectedEmojiIndex] = tmp;
    selectedEmojiIndex = selectedEmojiIndex + z;
  }
  redrawEmojisOnNextFrame();
}

function redrawEmojisOnNextFrame() {
  if (!isRedrawing) {
    isRedrawing = true;
    requestAnimationFrame(redrawEmojis);
  }
}

function redrawEmojis() {

  //console.log('start redraw', performance.now());

  ctxEmoji.clearRect(0, 0, canvasEmoji.width, canvasEmoji.height);

  for (let i=0; i < stampedEmojis.length; i++) {
    let emoji = stampedEmojis[i];
    drawEmoji(emoji.image, {x: emoji.x, y: emoji.y}, emoji.width, emoji.height, i === selectedEmojiIndex);
  }

  //console.log('finish redraw', performance.now());

  isRedrawing = false;

}

function redrawDrawing() {
  
  let beforeGCompOpe = ctxDraw.globalCompositeOperation;
  let beforeStrokeStyle = ctxDraw.strokeStyle;
  for (let line=0; line < drawingCoords.length; line++) {

    if (drawingCoords[line][0].color === 'erase') {
      ctxDraw.globalCompositeOperation = "destination-out";
    } else {
      ctxDraw.globalCompositeOperation = "source-over";
      ctxDraw.strokeStyle = drawingCoords[line][0].color;
    }
    ctxDraw.beginPath();
    ctxDraw.moveTo(drawingCoords[line][0].x, drawingCoords[line][0].y);

    //let startTime = performance.now();
    for (let coords=1; coords < drawingCoords[line].length; coords++) {
      ctxDraw.lineTo(drawingCoords[line][coords].x, drawingCoords[line][coords].y);
      ctxDraw.stroke();
    }
    //console.log('redraw line '+ drawingCoords[line].length+' points', performance.now() - startTime);
  }
  ctxDraw.globalCompositeOperation = beforeGCompOpe;
  ctxDraw.strokeStyle = beforeStrokeStyle;
  isUndoing = false;

}

function clearDrawing() {
  ctxDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
}

function clearEmojis() {
  stampedEmojis = [];
  redrawEmojis();
}

function clearCanvases() {
  clearDrawing();
  clearEmojis();
}

function onColourClickOrChange() {
  updateCanvasDrawContext();
  //colourInputContainer.classList.add('selected');
  //emojiMenuButton.classList.remove('selected');
}

function updateCanvasDrawContext() {
  ctxDraw.strokeStyle = currentColor;
  //ctxDraw.lineWidth = sizeInput.value;
  //ctxDraw.lineWidth = DEFAULT_LINE_WIDTH;
  //ctxDraw.shadowBlur = chosenTool === TOOL_BRUSH ? 2 : 0;
  //ctxDraw.shadowColor = colourInput.value;
}

function initEmojis() {

  let html = '';
  let categories = [
    'Sinalização',
    'Vegetação',
    'Barreiras',
    'Descanso',
    'Serviço público',
    'Pessoas'
  ];
  let countCategories = 0;

  for (let i=0; i < emojiImages.length; i++) {
    const path = emojiImages[i];
    const filename = path.replace(/^.*[\\\/]/, '');
    if (filename.match(/1.svg/)) {
      html += `<div class="emoji-category">${categories[countCategories++]}</div>`;
    }
    html += `<img src="${path}" alt="Emoji" id="${filename}"/>`;
  }

  emojiList.innerHTML = html;

}

function initColors() {
  let html = '';
  for(let color in colors) {
    html += `
      <div class="col">
        <button class="btn btn-color ${currentColor == colors[color] ? 'selected': ''}" id="btn-${color}" >
          <div style="background-color: ${colors[color]}"></div>
        </button>
      </div>`;
  }
  colorList.innerHTML = html;
}

function restartApp() {
  window.location.reload();
}

function initControls() {

  window.addEventListener("hashchange", () => {
    let hash = window.location.hash;
    let routes = {
      '#home': restartApp,
      '#draw': drawAction,
      '#annotate': annotateAction,
      '#figures': figuresAction,
      '#share': shareAction,
      '#share-confirm': shareConfirmAction,
    };
    if (routes[hash]) {
      routes[hash]();
    }
  }, false);

  let drawAction = () => {
    selectPencil();
    selectedEmojiIndex = -1;
    redrawEmojis();
    //figuresBtn.classList.remove('selected');
    //toolsDrawBtn.classList.add('selected');

    toolsDraw.classList.add('show');
    toolsHome.classList.remove('show');
    emojiModal.classList.remove('show');
    toolsFigure.classList.remove('show');
  };
  let annotateAction = () => {
    chosenTool = TOOL_EMOJI;
    toolsHome.classList.add('show');
    toolsDraw.classList.remove('show');
    emojiModal.classList.remove('show');
    hide('page-share');
    toolsFigure.classList.add('show');
    updateFigureToolsButtons();
  };
  let figuresAction = () => {
    emojiModal.classList.add('show');
    toolsFigure.classList.add('show');
    updateFigureToolsButtons();
  };

  let selectPencil = () => {
    if (ctxDraw.strokeStyle == '#000000') {
      ctxDraw.strokeStyle = currentColor;
    }
    ctxDraw.lineJoin = 'bevel'; // round, bevel, miter
    //ctxDraw.lineCap = 'round'; // butt, round, square

    ctxDraw.globalCompositeOperation="source-over";
    ctxDraw.lineWidth = DEFAULT_LINE_WIDTH;

    chosenTool = TOOL_PENCIL;
    updateCanvasDrawContext();
    //toolsModal.classList.remove('show');
    highlightSelectedTool(pencilButton);
  };

  let shareAction = () => {
    chosenTool = '';
    selectedEmojiIndex = -1;
    touchedEmojiIndex = -1;
    redrawEmojis();
    toolsShare.classList.add('show');
    toolsHome.classList.remove('show');
    emojiModal.classList.remove('show');
    toolsFigure.classList.remove('show');
    hide('page-share');
  };

  let shareConfirmAction = () => {
    shareConfirmBtn.classList.add('loading');
    let oldShareConfirm = shareConfirmBtn.innerHTML;
    shareConfirmBtn.innerHTML = 'Compartilhando';
    shareConfirmBackBtn.style.display = 'none';
    setTimeout(() => {
      redrawEmojis();
      SnapshotPage.show();
      //hide('page-annotate');
      toolsShare.classList.remove('show');
      show('page-share');
      SaveImagePage.init();
      shareConfirmBtn.classList.remove('loading');
      shareConfirmBtn.innerHTML = oldShareConfirm;
      shareConfirmBackBtn.style.display = 'block';
    }, 300);
    
  };

  pencilButton.addEventListener('click', selectPencil);

  for (let i=0; i < colorBtns.length; i++) {
    colorBtns[i].addEventListener('click', () => {
      currentColor = colorBtns[i].childNodes[1].style.backgroundColor;
      onColourClickOrChange();
      highlightSelectedColor(colorBtns[i]);
      selectPencil();
    });
  }
  undoButton.addEventListener('click', () => {
    if (!isUndoing) {
      isUndoing = true;
      //undoButton.classList.add('loading');
      drawingCoords.pop();
      clearDrawing();
      requestAnimationFrame(redrawDrawing);
      //undoButton.classList.remove('loading');
    }
  });
    
  eraseButton.addEventListener('click', () => {
    ctxDraw.globalCompositeOperation = "destination-out";
    chosenTool = TOOL_ERASE;
    highlightSelectedTool(eraseButton);
  });

  // Add click handlers to emojis so you can select one
  let availableEmojis = document.querySelectorAll('#modal-emoji img');
  for (let i=0; i < availableEmojis.length; i++) {
    let emoji = availableEmojis[i];
    emoji.addEventListener('click', onNewEmojiClick);
  }

  figureDeleteBtn.addEventListener('click', () => {
    deleteEmoji();
    addEmojiHistory();
    updateFigureToolsButtons();
  });
  figureUndoBtn.addEventListener('click', () => {
    historyEmojis.pop();
    let lastState = historyEmojis[historyEmojis.length - 1];
    stampedEmojis = lastState ? JSON.parse(JSON.stringify(lastState)) : [];
    for (let i=0; i < stampedEmojis.length; i++) {
      if (stampedEmojis[i]['selected']) {
        selectedEmojiIndex = i;
      }
    }

    updateFigureToolsButtons();
    redrawEmojis();
  });

  figureFrontBtn.addEventListener('click', () => {
    translateEmojiZ(1);
    addEmojiHistory();
    updateFigureToolsButtons();
  });
  figureBackBtn.addEventListener('click', () => {
    translateEmojiZ(-1);
    addEmojiHistory();
    updateFigureToolsButtons();

    if (isFirstBubbleFront) {
      isFirstBubbleFront = false;
      bubbleFigureFront.classList.add('show');
      setTimeout(() => {
        bubbleFigureFront.classList.remove('show');
      }, 9000);
    }

  });

  document.addEventListener('touchstart', removeBubbles, false);
  document.addEventListener('mousedown', removeBubbles, false);

  shareBtn.classList.add('disabled');
}

export default {

  init: function() {

    initVars();
    initCanvases();
    initColors();
    initEmojis();
    initControls();
  },

  show: function() {


    
    if (isLiveCamera()) {
      // For live camera view, default to taking up the full space available
      canvasDraw.width = window.innerWidth;
      canvasDraw.height = window.innerHeight - HEADER_HEIGHT;
      canvasEmoji.width = canvasDraw.width;
      canvasEmoji.height = canvasDraw.height;
    }

    /*
    // Hacky fix for some browsers no longer observing the centred position with position: absolute
    canvasDraw.setAttribute('style', `left: calc(50% - ${canvasDraw.width / 2}px); top: calc(50% - ${canvasDraw.height / 2}px)`);
    canvasEmoji.setAttribute('style', `left: calc(50% - ${canvasEmoji.width / 2}px); top: calc(50% - ${canvasEmoji.height / 2}px)`);
    */

  }

};
