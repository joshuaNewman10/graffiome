'use strict';

// helper function to determine what the current tab is and perform a callback on that tabID value
//////////////////*3*/////////////////////
var getCurrentTabID = function(callback) {
  // console.log("3: in getCurrentTabID", callback)
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    // console.log("4: in chromesTab", tabs)
    var currentTabId = tabs[0].id;
    callback(currentTabId);
  });
};



// getStatus takes a callback and applies it to the status of the current tab
// it queries the current tab for the status of the app on that tab
var getStatus = function(callback) {
  // console.log("2: getStatus has started with callback", callback)
  getCurrentTabID(function(tabID) {
    // console.log("5: in chromesTab", tabID)
    chrome.tabs.sendMessage(tabID, {getStatus: true}, function(res) {
      callback(res.status, tabID);
    });
  });
};

// generic send tab message function, telling the content script to change from
// the current status to the opposite
var sendTabMessage = function(status, tabID) {
 var msg;
 if (status.switch === 'off') {
   msg = 'on';
 } else {
   msg = 'off';
 }
 chrome.tabs.sendMessage(tabID, {toggle: msg}, function(res){

 });
};

// Begin Angular Module
angular.module('graffio.mainController', [])
.controller('mainController', function($scope, $state) {
  var ref = new Firebase('https://radiant-heat-919.firebaseio.com/web/data/sites/');

  var setUsersUi = function(allTheUsers) {
    $scope.$apply(function() {
      $scope.allUsers = allTheUsers;      
    });
  };

//FUNCTION TO SEND TO DRAW SCREEN
  getStatus(function(status, tabID) {
    // send a message to the tab and also set the current button value to be the opposite
    // ie. if a user clicks 'On' it should send a message telling the app to start drawing
    // and also change the UI here to indicate that the next click will turn the app off
    // sendTabMessage(status, tabID);
    console.log("FUNCTION TO SEND TO DRAW SCREEN:", status.switch)
    if (status.switch === 'on') {
      $state.go('draw');
    }

    $scope.allUsers = [];

    ref.child(status.tabUrl).on('value', function(dataSnapshot) {
      var values = dataSnapshot.val();
      var arr = [];
      console.log(values)
      for(var key in values){
        arr.push(key);
      }
      setUsersUi(arr)    
    });



    // console.log(query)
    // .equalTo(25).on("child_added", function(snapshot) {
    //   console.log(snapshot.key());
    // });
 
  });

  console.log("allUsers:", $scope.allUsers)

  $scope.getUserDrawing = function(){
    var user = this.user;
    console.log(user)
    getCurrentTabID(function(activeTab){
      chrome.tabs.sendMessage(activeTab, {getUserDrawing: user}, function(res) {
        console.log(res)
      });
    });    
  }

  $scope.draw = function(){
    $state.go('draw');
    //start drawing functionality
  }

  $scope.logout = function() {
    ref.unauth();
    chrome.runtime.sendMessage({action: 'clearToken'});
    $state.go('login');
  };
}).controller('onOffController', function($scope){ 
  // initialize text before we can query the current tab
  $scope.onOffButtonTxt = 'loading...';

  // generic UI update function for the status of the app
  // needs to use $scope.$apply since these callback functions otherwise wouldn't trigger a $digest event
  // even though they would update the $scope variable values...
  // $scope.$apply triggers the $digest, which in turn is what causes a UI update
  var setStatusUi = function(status) {
    // console.log('this is SetStatusUI Status: ', status);
    $scope.$apply(function() {
      if (status === 'off') {
        $scope.onOffButtonTxt = 'On';
        // console.log("onOffButton:" + $scope.onOffButtonTxt);
      } else {
        $scope.onOffButtonTxt = 'Off';
        // console.log("onOffButton:" + $scope.onOffButtonTxt);
      }
    });
  };


    
  // function called when button is pressed by user wishing to toggle the current state
  $scope.toggleStatus = function() {
    // console.log("1: toggleStatus button has been pressed")
    // figure out what existing state is from the content script
    getStatus(function(status, tabID) {
      // send a message to the tab and also set the current button value to be the opposite
      // ie. if a user clicks 'On' it should send a message telling the app to start drawing
      // and also change the UI here to indicate that the next click will turn the app off
      sendTabMessage(status, tabID);
      if (status === 'off') {
        // console.log("this is GetStatus Function Status:" + status)
        setStatusUi('on');  
      } else {
        // console.log("this is GetStatus Function Status:" + status)
        setStatusUi('off');
      }
    });
  };
 
  // console.log('initial get status called...');
  // Initial call to getStatus to figure out what status the page was in last.
  getStatus(function(status) {
    setStatusUi(status);
    // console.log('status set');
  });

});