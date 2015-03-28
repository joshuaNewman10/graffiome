'use strict';

// helper function to determine what the current tab is and perform a callback on that tabID value

// Begin Angular Module
angular.module('graffio.drawController', [
  'ui.slider',
  'nya.bootstrap.select'
  ])
.controller('drawController', function($scope, $state) {
  // var ref = new Firebase('https://radiant-heat-919.firebaseio.com');
  
  getStatus(function(status, tabID) {
    // send a message to the tab and also set the current button value to be the opposite
    // ie. if a user clicks 'On' it should send a message telling the app to start drawing
    // and also change the UI here to indicate that the next click will turn the app off
    // sendTabMessage(status, tabID);
    if (status.switch === 'off') {
      $state.go('main');
    }

  });

  var setStatusUi = function(status) {
    console.log('setStatusUI called...');
    console.log('setStatusUI status: ', status);
    $scope.$apply(function() {
      $scope.brush = status.brush;
      $scope.color = status.color;
      $scope.thickness = status.width;
      
    });
  };

  $scope.toggleStatus = function() {
    getStatus(function(status, tabID) {
      console.log("LINE 36 togglestatus:", status)
      sendTabMessage(status, tabID);
    });
  };


  $scope.brush = "Paint";

  $scope.thickness = 1;

  $scope.end = function(){
    $state.go('main');
  }

  $scope.erase = function(){
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {erase: true}, function(res) {
        console.log(res)
      });
    });
  };

  $scope.brushSelect = function(event, brush){
    console.log(brush);
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {brushSelect: brush}, function(res) {
        console.log(res)
      });
    });
  };


  $scope.changeWidth = function(event, thickness){
    console.log(thickness);
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {changeWidth: thickness}, function(res) {
        console.log(res)
      });
    });
  };

  $scope.changeColor = function(event, color){
    console.log(color);
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {changeColor: color}, function(res) {
        console.log(res)
      });
    });
  };

  $scope.nyan = function(){
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {image: 'static/nyan.gif'}, function(res) {
        console.log(res)
      });
    });
  };

})

// .controller('paletteController', function($scope){



// });