'use strict';

// From Ilya Podolko's webinar demo.

/*
Recomendations:
Service module to describe services.
Controller module to describe controllers.
Directive module to describe directives.
And entire app module.

Adding routes(when).
[route], {[template path for ng-view], [controller for this template]}

otherwise
Set default route.

$routeParams.id - :id parameter.
*/

var servicesModule    = angular.module('servicesModule',[]);
var controllersModule = angular.module('controllersModule', []);

// Added ngSanitize for HTML injection
var app = angular.module('app', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'servicesModule', 'controllersModule', 'ngSanitize']);

app.config([ '$routeProvider', function( $routeProvider ) {
  $routeProvider.when( '/tasks',     {templateUrl: 'partials/tasks.csp'} );
  $routeProvider.when( '/tasks/:id', {templateUrl: 'partials/task.csp',  controller: 'TaskCtrl'} );
    
  $routeProvider.otherwise( {redirectTo: '/tasks'} );
}]);