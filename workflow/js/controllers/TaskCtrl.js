'use strict';

// Task controller
// dependency injection
function TaskCtrl($scope, $routeParams, $location, $modalInstance, WorklistSrvc, task, submit) {
  $scope.page = { task:{} };
  $scope.page.task = task;
  $scope.page.actions = "";
  $scope.page.formFields = "";
  $scope.page.formValues = task.Task['%FormValues'];
  
  if (task.Task['%TaskStatus'].Request['%Actions']) {
    $scope.page.actions = task.Task['%TaskStatus'].Request['%Actions'].split(',');
  }
  
  if (task.Task['%TaskStatus'].Request['%FormFields']) {
    $scope.page.formFields = task.Task['%TaskStatus'].Request['%FormFields'].split(',');
  }
  
  // dismiss modal 
  $scope.page.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  // perform a specified action
  $scope.page.doAction = function(action) {
    $scope.page.task.Task["%Action"] = action;  
    $scope.page.task.Task['%FormValues'] = $scope.page.formValues;

    submit($scope.page.task); 
    $modalInstance.close(action);
  }

}

// resolving minification problems
TaskCtrl.$inject = ['$scope', '$routeParams', '$location', '$modalInstance', 'WorklistSrvc', 'task', 'submit'];
controllersModule.controller('TaskCtrl', TaskCtrl);
