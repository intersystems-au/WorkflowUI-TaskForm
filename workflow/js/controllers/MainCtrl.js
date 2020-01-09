'use strict';

// Main controller
// Controls the authentication. Loads all the worklists for user.
function MainCtrl($scope, $location, $cookies, WorklistSrvc, SessionSrvc, UtilSrvc) {
  $scope.page = {};
  $scope.page.alerts = [];
  $scope.utils = UtilSrvc;
  $scope.page.loading = false;
  $scope.page.loginState = $cookies['Token'] ? 1 : 0;
  $scope.page.authToken = $cookies['Token'];

  $scope.page.closeAlert = function(index) {        
   if ($scope.page.alerts.length) {
     $('.alert:nth-child('+(index+1)+')').animate({opacity: 0, top: "-=150" }, 400, function() { 
       $scope.page.alerts.splice(index, 1); $scope.$apply();
     });
   }
  };
  
  $scope.page.addAlert = function(alert) {
    $scope.page.alerts.push(alert);
    
    if ($scope.page.alerts.length > 5) {
      $scope.page.closeAlert(0);  
    }  
  };
  
  /* Authentication section */
  $scope.page.makeBaseAuth = function(user, password) {
    var token = user + ':' + password;
    var hash = Base64.encode(token);
    return "Basic " + hash;
  } 
    
  // login
  $scope.page.doLogin = function(login, password) {
    var authToken = $scope.page.makeBaseAuth(login, password);
    $scope.page.loading = true;
    
    WorklistSrvc.getAll(authToken).then(
      function(data) {
        $scope.page.alerts = [];
        $scope.page.loginState = 1; 
        $scope.page.authToken = authToken;
        // set cookie to restore loginState after page reload
        $cookies['User'] = login.toLowerCase();
        $cookies['Token'] = $scope.page.authToken;
               
        // refresh the data on page
        $scope.page.loadSuccess(data); 
      },
      function(data, status, headers, config) {
        if (data.Error) {
          $scope.page.addAlert( {type: 'danger', msg: data.Error} ); 
        }
        else {
          $scope.page.addAlert( {type: 'danger', msg: "Login unsuccessful"} );
        }
    })
    .then(function () { $scope.page.loading = false; })
  };

  // logout
  $scope.page.doExit = function() {     
    SessionSrvc.logout($scope.page.authToken).then(
      function(data) {
        $scope.page.loginState = 0;  
        $scope.page.grid.items = null;
        $scope.page.loading = false;
        // clear cookies
        delete $cookies['User'];
        delete $cookies['Token'];
        document.cookie = "CacheBrowserId" + "=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "CSPSESSIONID" + "=; Path=" + RESTWebApp.appName + "; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "CSPWSERVERID" + "=; Path=" + RESTWebApp.appName + "; expires=Thu, 01 Jan 1970 00:00:01 GMT;";   
     },
     function(data, status, headers, config) {
       $scope.page.addAlert( {type: 'danger', msg: data.Error} );
     });
  };

}

// resolving minification problems
MainCtrl.$inject = ['$scope', '$location', '$cookies', 'WorklistSrvc', 'SessionSrvc', 'UtilSrvc'];
controllersModule.controller('MainCtrl', MainCtrl);