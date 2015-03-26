'use strict';
  var canvas;
  var canvasFabric;

  var settings = {
    tabUrl:  CryptoJS.SHA1(document.URL).toString()
  };

  var initializePage = function() {
    //set up chrome to listen to site data
    chrome.runtime.sendMessage({action: 'startSiteData', site: settings.tabUrl});

    $(window).unload(function (){
      chrome.runtime.sendMessage({action: 'stopSiteData', site: settings.tabUrl});
    });
    
    //create canvas and append to page
   

    //make fabric obj, attach canvas to frabric and associate with currentUser
    getCurrentUser(function(user){

      canvas = $('<canvas></canvas>')
        .css({position: 'absolute', top: 0, left: 0, 'z-index':1000})
        .attr('width', document.body.scrollWidth)
        .attr('height', document.body.scrollHeight)
        .addClass(user)
        .attr('id', user);

      canvas.appendTo('body');

      canvasFabric = new fabric.Canvas(user, {
        isDrawingMode: true,
      });

      canvasFabric.setHeight(document.body.scrollHeight);
      canvasFabric.setWidth(document.body.scrollWidth);
    
      // settings.ctx = canvasFabric.getContext('2d');
    }); 

  };

 var getCurrentUser = function(callback){
  chrome.runtime.sendMessage({action: 'getUser'}, function(response) {
    console.log('response', response);
    callback(response.user);
  });
};

  var enableDrawingMode = function() { //maybe change z-index
    settings.canvasFabric.isDrawingMode = true; 

  };

  var disableDrawingMode = function() { //maybe change z-index
    settings.canvasFabric.isDrawingMode = false; //look at draggable
  };

  var saveUserCanvas = function(){
    var data = settings.canvasFabric.toDataURL();
    console.log('save user canvas: json canvas data', data);
    chrome.runtime.sendMessage(
      {action: 'saveCanvas', site: settings.tabUrl, data: data}, 
      function(response) {
        if (response.saveStatus) {
          console.log('saving user canvas');
        } else {
          console.log('failed to save canvas');
      }
    });
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
  console.log('getting new canvas data', user, document.getElementsByClassName(user)[0] );
  // if the user does not already have a canvas
  if ( settings.tabUrl === site ) {
    console.log('in the right tab');
    if ( !document.getElementsByClassName(user)[0] ) {
      appendOtherUsersCanvasToDOM(user);
    }
    var context = document.getElementsByClassName(user)[0].getContext('2d');  
    drawOtherUsersCanvasElement(context, data);
  }
};


  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse){
      // Toggle User Canvas Messages
      if ( request.toggle === 'off' ){
          // toggleUserCanvasOff();
          disableDrawingMode();
          sendResponse({confirm:'canvas turned off'});
      } else if ( request.toggle === 'on' ){
        enableDrawingMode();
          // toggleUserCanvasOn(); 
          sendResponse({confirm:'canvas turned on'});
          
      // Initialize toggle status for popup button
      } else if ( request.getStatus === true ){
        sendResponse({status:toggle});
      } else if (request.canvasData) { // new Canvas data
        onCanvasData(request.site, request.user, request.data);
      } else if (request.erase){
        eraseUserCanvas();
      } else if (request.changeColor){
        lineColor = request.changeColor;
      } else if (request.image){
        getCurrentUser(function(user){
          var userCanvas = $('.'+ user);
          addOneTimeClickEvent(userCanvas, addImage, request.image);
        });
      }
    }
  );

  initializePage();


  





