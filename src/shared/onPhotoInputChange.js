import LoadImage from 'blueimp-load-image';

export function onPhotoInputChange(path) {

  let cameraCanvas = document.getElementById('canvas-camera');
  let drawCanvas = document.getElementById('canvas-draw');
  let emojiCanvas = document.getElementById('canvas-emoji'); 
  let annotateCameraContainer = document.getElementById('annotate-camera-container');

  const options = {
    maxWidth: cameraCanvas.width,
    contain: true,
    orientation: true,
    canvas: true,
    pixelRatio: devicePixelRatio
  };

  function onImageLoad(result) {
    if (result.type === 'error') {
      console.error('Error loading image', result);
    } else {

      console.log('Generated canvas width and height', result.width, result.height);

      // Replace our default canvas (for video) with the generated one
      result.id = 'canvas-camera';

      annotateCameraContainer.removeChild(cameraCanvas);
      annotateCameraContainer.appendChild(result);

      cameraCanvas = result;

      const newWidth = cameraCanvas.style.width ? parseInt(cameraCanvas.style.width) : cameraCanvas.width;
      const newHeight = cameraCanvas.style.height ? parseInt(cameraCanvas.style.height) : cameraCanvas.height;

      // Make drawing canvas the same size
      drawCanvas.width = newWidth;
      drawCanvas.height = newHeight;
      emojiCanvas.width = newWidth;
      emojiCanvas.height = newHeight;

    }
  }

  // A little library which handles rotating the image appropriately depending
  // on the image's orientation (determined from the exif data) & scaling to fit
  LoadImage(path, onImageLoad, options);

};