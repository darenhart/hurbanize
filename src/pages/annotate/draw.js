import emojiImages from '\0emoji-images';
import {HEADER_HEIGHT} from '../../shared/constants';
import {isLiveCamera} from '../../shared/config';

//const DEFAULT_COLOUR = '#FF2626';
//const DEFAULT_EMOJI_SIZE = 60;
//const DEFAULT_EMOJI_FONT = 'arial';
const DEFAULT_LINE_WIDTH = 10;
const RENDERING_STROKE_TIME = 40;

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
let ctxDraw = canvasDraw.getContext('2d');
let ctxEmoji = canvasEmoji.getContext('2d');

let chosenTool = '';//TOOL_PENCIL;
let toolsMenuButton = document.getElementById('btn-tools');
//let toolsModal = document.getElementById('modal-tools');
let pencilButton = document.getElementById('btn-pencil');
let undoButton = document.getElementById('btn-undo');
let eraseButton = document.getElementById('btn-erase');
//let brushButton = document.getElementById('btn-brush');
let emojiMenuButton = document.getElementById('btn-emoji');
let emojiModal = document.getElementById('modal-emoji');
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
let toolsDrawControl = document.getElementById('tools-draw-control');
let toolsOptions = document.getElementById('tools-options');
let toolsDrawBtn = document.getElementById('btn-tools-draw');
let confirmBtn = document.getElementById('btn-confirm');
let figuresBtn = document.getElementById('btn-figures');
let colorBtns = document.getElementsByClassName('btn-color');

let toolsFigure = document.getElementById('tools-figure');
let figureFrontBtn = document.getElementById('btn-figure-front');
let figureBackBtn = document.getElementById('btn-figure-back');
let figureDeleteBtn = document.getElementById('btn-figure-delete');

let touchedEmojiIndex = -1;
let selectedEmojiIndex = -1;
let chosenEmoji = null;
let resizeTouchDelta = null;
let moveTouchDelta = null;
let isDrawing = false;
let isRedrawing = false;
let isUndoing = false;
let isResizing = false;

let lastStrokeTime = performance.now();

// for undo feature store all drawing 
let drawingCoords = [];

// Store emoji details so we can redraw them when moved/resized
let stampedEmojis = [];

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

function drawEmoji(emoji, coords, width, height, isSelected) {

  // Centre the image around tap/click coords
  const x = coords.x - width / 2;
  const y = coords.y - height / 2;

  ctxEmoji.drawImage(emoji, x, y, width, height);

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

function onTouchStartOrMouseDown(e) {

  e.preventDefault();

  closeModals();

  let touch = e.changedTouches && e.changedTouches.length ?
    e.changedTouches[0] : null;

  let coords = touch ? {x: touch.pageX - canvasEmoji.offsetLeft, y: touch.pageY - canvasEmoji.offsetTop - HEADER_HEIGHT} :
    {x: e.clientX - canvasEmoji.offsetLeft, y: e.clientY - canvasEmoji.offsetTop - HEADER_HEIGHT};

  touchedEmojiIndex = indexOfSelectedEmoji(coords);

  if (touchedEmojiIndex > -1) {
    selectedEmojiIndex = touchedEmojiIndex;
    // Selected an existing emoji - fall through
    redrawEmojisOnNextFrame();
    toolsFigure.classList.add('show');
    return;
  }

  if (chosenTool === TOOL_EMOJI) {
    // add emoji removed
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

  let coords1 = touch1 ? {x: touch1.pageX - canvasEmoji.offsetLeft, y: touch1.pageY - canvasEmoji.offsetTop - HEADER_HEIGHT} :
    {x: e.clientX - canvasEmoji.offsetLeft, y: e.clientY - canvasEmoji.offsetTop - HEADER_HEIGHT};

  if (touchedEmojiIndex >= 0) {

    let emoji = stampedEmojis[touchedEmojiIndex];

    if (touch2) {

      // Resize emoji
      isResizing = true;

      let coords2 = {x: touch2.pageX - canvasEmoji.offsetLeft, y: touch2.pageY - canvasEmoji.offsetTop - HEADER_HEIGHT};
      let newResizeTouchDelta = {x: Math.abs(coords2.x - coords1.x),
        y: Math.abs(coords2.y - coords1.y)};

      if (resizeTouchDelta) {

        // keep proportion
        let newSize = ((newResizeTouchDelta.x - resizeTouchDelta.x) + (newResizeTouchDelta.y - resizeTouchDelta.y))/ 2;
        emoji.width += newSize* (emoji.width/emoji.height);        
        emoji.height += newSize;
        
        // dont keep proportion
        //emoji.width += newResizeTouchDelta.x - resizeTouchDelta.x
        //emoji.height += newResizeTouchDelta.y - resizeTouchDelta.y;

        redrawEmojisOnNextFrame();

      }

      resizeTouchDelta = newResizeTouchDelta;

    } else if (!isResizing) {

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
    }
  }
}

function onTouchEndOrMouseUp(e) {
  isDrawing = false;
  isResizing = false;
  touchedEmojiIndex = -1;
  resizeTouchDelta = null;
  moveTouchDelta = null;
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

  figuresBtn.classList.add('selected');
  toolsDrawBtn.classList.remove('selected');

  chosenTool = TOOL_EMOJI;
  chosenEmoji = event.currentTarget;

  if (chosenEmoji) {

    const width = chosenEmoji.width * 0.7;
    const height = chosenEmoji.height * 0.7;

    stampedEmojis.push({
      image: chosenEmoji,
      x: canvasEmoji.width/2,
      y: canvasEmoji.height/2,
      width: width,
      height: height
    });

  }

  redrawEmojisOnNextFrame();
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

/*
function onSizeChange(event) {
  updateCanvasDrawContext();
  sizeOutput.innerHTML = event.target.value;
}
*/

function initCanvases() {

  // Emoji canvas is on top so will receive the interaction events
  canvasEmoji.addEventListener('touchstart', onTouchStartOrMouseDown, false);
  canvasEmoji.addEventListener('touchmove', onTouchMoveOrMouseMove, false);
  canvasEmoji.addEventListener('touchend', onTouchEndOrMouseUp, false);

  canvasEmoji.addEventListener('mousedown', onTouchStartOrMouseDown, false);
  canvasEmoji.addEventListener('mousemove', onTouchMoveOrMouseMove, false);
  canvasEmoji.addEventListener('mouseup', onTouchEndOrMouseUp, false);

  ctxDraw.strokeStyle = currentColor;
  ctxDraw.lineWidth = DEFAULT_LINE_WIDTH;
  ctxDraw.lineJoin = 'round';
  ctxDraw.lineCap = 'round';
  ctxDraw.shadowColor = currentColor;
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

  for (let i=0; i < emojiImages.length; i++) {
    const path = emojiImages[i];
    html += `<img src="${path}" alt="Emoji"/>`;
  }

  emojiModal.innerHTML = html;

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

function initControls() {

  toolsDrawBtn.addEventListener('click', () => {
    selectedEmojiIndex = -1;
    redrawEmojis();
    figuresBtn.classList.remove('selected');
    toolsDrawBtn.classList.add('selected');

    toolsDraw.classList.toggle('show');
    toolsHome.classList.remove('show');
    emojiModal.classList.remove('show');
    toolsFigure.classList.remove('show');
  });
  confirmBtn.addEventListener('click', () => {
    toolsHome.classList.toggle('show');
    toolsDraw.classList.remove('show');
    emojiModal.classList.remove('show');
    toolsFigure.classList.remove('show');
  });

  let selectPencil = () => {
    if (ctxDraw.strokeStyle == '#000000') {
      ctxDraw.strokeStyle = currentColor;
    }
    ctxDraw.globalCompositeOperation="source-over";
    ctxDraw.lineWidth = DEFAULT_LINE_WIDTH;

    chosenTool = TOOL_PENCIL;
    updateCanvasDrawContext();
    //toolsModal.classList.remove('show');
    highlightSelectedTool(pencilButton);
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

  figuresBtn.addEventListener('click', () => {
    toolsFigure.classList.remove('show');
    emojiModal.classList.toggle('show');
  });

  // Add click handlers to emojis so you can select one
  let availableEmojis = document.querySelectorAll('#modal-emoji img');
  for (let i=0; i < availableEmojis.length; i++) {
    let emoji = availableEmojis[i];
    emoji.addEventListener('click', onNewEmojiClick);
  }

  figureDeleteBtn.addEventListener('click', () => {
    toolsFigure.classList.remove('show');
    deleteEmoji();
  });

  figureFrontBtn.addEventListener('click', () => {
    translateEmojiZ(1);
  });
  figureBackBtn.addEventListener('click', () => {
    translateEmojiZ(-1);
  });

  /*
  brushButton.addEventListener('click', () => {
    chosenTool = TOOL_BRUSH;
    updateCanvasDrawContext();
    toolsModal.classList.remove('show');
    highlightSelectedTool(brushButton);
  });

  optionsMenuButton.addEventListener('click', () => {
    optionsModal.classList.toggle('show');
    toolsModal.classList.remove('show');
    emojiModal.classList.remove('show');
  });

  colourInput.addEventListener('input', onColourClickOrChange);
  colourInput.addEventListener('click', onColourClickOrChange);

  sizeInput.addEventListener('change', onSizeChange);
  sizeInput.value = DEFAULT_LINE_WIDTH;
  sizeOutput.innerHTML = DEFAULT_LINE_WIDTH;

  trashButton.addEventListener('click', () => {
    // TODO introduce confirmation prompt!
    clearCanvases();
  })
  */

}

export default {

  init: function() {
    initCanvases();
    initColors();
    initEmojis();
    initControls();
  },

  show: function() {

    toolsFigure.setAttribute('style', 'right:' + (window.innerWidth - canvasDraw.width-20)/2 + 'px');

    /*
    if (isLiveCamera()) {
      // For live camera view, default to taking up the full space available
      canvasDraw.width = window.innerWidth;
      canvasDraw.height = window.innerHeight - HEADER_HEIGHT;
      canvasEmoji.width = canvasDraw.width;
      canvasEmoji.height = canvasDraw.height;
    }

    // Hacky fix for some browsers no longer observing the centred position with position: absolute
    canvasDraw.setAttribute('style', `left: calc(50% - ${canvasDraw.width / 2}px); top: calc(50% - ${canvasDraw.height / 2}px)`);
    canvasEmoji.setAttribute('style', `left: calc(50% - ${canvasEmoji.width / 2}px); top: calc(50% - ${canvasEmoji.height / 2}px)`);
    */

  },

  snapshot: function() {
    // Remove highlights ready to snapshot the canvas
    selectedEmojiIndex = -1;
    touchedEmojiIndex = -1;
    redrawEmojis();
  }

};
