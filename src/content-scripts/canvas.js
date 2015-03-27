'use strict';
  var canvas;


  var canvasFabric;
  var toggle = {switch: 'off', color:"black", "width":1, brush: "Pencil"}

  var settings = {
    tabUrl:  CryptoJS.SHA1(document.URL).toString(),
    currentCanvasId: ""
  };


var makeUniqueid = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 15; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var initializePage = function() {
  //set up chrome to listen to site data
  chrome.runtime.sendMessage({action: 'startSiteData', site: settings.tabUrl});

  $(window).unload(function (){
    chrome.runtime.sendMessage({action: 'stopSiteData', site: settings.tabUrl});
  });
  var newId = makeUniqueid();
  settings.currentCanvasId = newId;
  //create canvas and append to page
 
  //make fabric obj, attach canvas to frabric and associate with currentUser
  getCurrentUser(function(user){

    canvas = $('<canvas></canvas>')
      .css({position: 'absolute', top: 0, left: 0, 'z-index':1000})
      .attr('width', document.body.scrollWidth)
      .attr('height', document.body.scrollHeight)
      .addClass(user)
      .attr('id', newId);

    canvas.appendTo('body');

    canvasFabric = new fabric.Canvas(newId, {
      isDrawingMode: false
    });

    canvasFabric.setHeight(document.body.scrollHeight);
    canvasFabric.setWidth(document.body.scrollWidth);
  
    // settings.ctx = canvasFabric.getContext('2d');
  }); 

};

 var getCurrentUser = function(callback){
  chrome.runtime.sendMessage({action: 'getUser'}, function(response) {
    // console.log('response', response);
    callback(response.user);
  });
};

  var enableDrawingMode = function() { //maybe change z-index
    canvasFabric.isDrawingMode = true; 
  };

  var disableDrawingMode = function() { //maybe change z-index
    canvasFabric.isDrawingMode = false; //look at draggable
  };

  var toggleOff = function(){
    toggle.switch = 'off';
    disableDrawingMode();
  }

  var toggleOn = function(){
    toggle.switch = 'on';
    enableDrawingMode();
  }

  var saveUserCanvas = function(){
    console.log(canvasFabric);
    var data = canvasFabric.toDataURL();
    // console.log('save user canvas: json canvas data', data);
    chrome.runtime.sendMessage(
      {action: 'saveCanvas', site: settings.tabUrl, data: data, id: settings.currentCanvasId}, 
      function(response) {
        if (response.saveStatus) {
          console.log('saving user canvas');
        } else {
          console.log('failed to save canvas');
      }
    });
    //remove canvas fabric from DOM
    
  };

var appendOtherUsersCanvasToDOM = function(name) {
  $('<canvas></canvas>')
    .css({position: 'absolute', top: 0, left: 0, 'pointer-events': 'none', 'z-index':1000})
    .attr('width', document.body.scrollWidth)
    .attr('height', document.body.scrollHeight)
    .addClass(name)
    .appendTo('body'); 
};

var drawOtherUsersCanvasElement = function(context, data){
  var imageObj = new Image();
  imageObj.src = data;
  imageObj.onload = function(){
    context.drawImage(this, 0, 0);
  };
};

 var onCanvasData = function(site, user, data) {
  // console.log('getting new canvas data', user, document.getElementsByClassName(user)[0] );
  // if the user does not already have a canvas
  if ( settings.tabUrl === site ) {
    // console.log('in the right tab');
    if ( !document.getElementsByClassName(user)[0] ) {
      appendOtherUsersCanvasToDOM(user);
    }
    var context = document.getElementsByClassName(user)[0].getContext('2d');  
    drawOtherUsersCanvasElement(context, data);
  }
};

var drawingOptions = {
  changeColor: function(color) {
    canvasFabric.freeDrawingBrush.color = color;
    toggle.color = color;
  },
  changeLineWidth: function(width) {
    canvasFabric.freeDrawingBrush.width = width;
    toggle.width = width;
  },
  changeBrushType: function(brush) {
    canvasFabric.freeDrawingBrush = new fabric[brush + 'Brush'](canvasFabric);
    toggle.brush = brush; 
    canvasFabric.freeDrawingBrush.width = toggle.width;
    canvasFabric.freeDrawingBrush.color = toggle.color;
  }
};

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse){
      if ( request.toggle === 'off' ){
          toggleOff();
          saveUserCanvas();
          // disableDrawingMode();
          sendResponse({confirm:'canvas turned off'});
      } else if ( request.toggle === 'on' ){
          toggleOn();
          sendResponse({confirm:'canvas turned on'});
      } else if ( request.getStatus === true ){
        sendResponse({status:toggle});
      } else if (request.canvasData) { // new Canvas data
        onCanvasData(request.site, request.user, request.data);
      } else if (request.erase){
        eraseUserCanvas();
      } else if (request.brushSelect){
        drawingOptions.changeBrushType(request.brushSelect);
      } else if (request.changeColor){
        drawingOptions.changeColor(request.changeColor)
      } else if (request.changeWidth){
        drawingOptions.changeLineWidth(request.changeWidth)
      } else if (request.image){
        getCurrentUser(function(user){
          var userCanvas = $('.'+ user);
          addOneTimeClickEvent(userCanvas, addImage, request.image);
        });
      }
    }
  );

  initializePage();



