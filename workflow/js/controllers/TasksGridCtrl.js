'use strict';

// TasksGrid controller
// dependency injection
function TasksGridCtrl($scope, $window, $modal, $cookies, WorklistSrvc) {
  
  // Initialize grid. 
  // grid data:
  // grid title, css grid class, column names
  $scope.page.grid = {
    caption: 'Inbox Tasks',
    cssClass:'table table-condensed table-bordered table-hover',
    columns: [{name: '', property: 'New', align: 'center'},
              {name: 'Priority', property: 'Priority'}, 
              {name: 'Subject', property: 'Subject'},
              {name: 'Message', property: 'Message'},
              {name: 'Role', property: 'RoleName'},
              {name: 'Assigned To', property: 'AssignedTo'},
              {name: 'Time Created', property: 'TimeCreated'},
              {name: 'Age', property: 'Age'}]
  };
 
  
  // data initialization for Worklist
  $scope.page.dataInit = function() {    
    if ($scope.page.loginState) {
      $scope.page.loadTasks();
    }
  };

  
  $scope.page.loadSuccess = function(data) {
    $scope.page.grid.items = data.children;
    // if we get data for other user - logout
    if (!$scope.page.checkUserValidity()) {
      $scope.page.doExit();  
    }
    
    var date = new Date();

    var hours = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours();
    var minutes = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes();
    var secs = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();
    
    $('#updateTime').animate({ opacity : 0 }, 100, function() { $('#updateTime').animate({ opacity : 1 }, 1000);} );
      
    $scope.page.grid.updateTime = ' [Last Update: ' + hours;
    $scope.page.grid.updateTime += ':' + minutes + ':' + secs + ']'; 
    
    
  };
    

  // all user's tasks loading
  $scope.page.loadTasks = function() {
   $scope.page.loading = true;
   
   WorklistSrvc.getAll($scope.page.authToken).then(
     function(data) {                 
        $scope.page.loadSuccess(data);
     },
     function(data, status, headers, config) {
       if (data.Error) {
         $scope.page.addAlert( {type: 'danger', msg: data.Error} ); 
       } 
       else {
         $scope.page.addAlert( {type: 'danger', msg: "Data fetching failed. Please reload."} );
       }
     })
     .then(function () { $scope.page.loading = false; })     
  };
   
   
  // load task (worklist) by id
  $scope.page.loadTask = function(id) {
    WorklistSrvc.get(id, $scope.page.authToken).then(
      function(data) {
        $scope.page.task = data;
      },
      function(data, status, headers, config) {
        $scope.page.addAlert( {type: 'danger', msg: data.Error} );  
      });       
  };
   
  // 'Accept' button handler.
  // Send worklist object with '$Accept' action to server.
  $scope.page.accept = function(id) {
    // nothing to do, if no id
    if (!id) return;
    
    // get full worklist, set action and submit worklist.
    WorklistSrvc.get(id).then(
      function(data) {
        data.Task["%Action"] = "$Accept";
        $scope.page.submit(data); 
      },
      function(data, status, headers, config) {
        $scope.page.addAlert( {type: 'danger', msg: data.Error} );
      });
  };  
  
  // 'Yield' button handler.
  // Send worklist object with '$Relinquish' action to server.
  $scope.page.yield = function(id) {
    // nothing to do, if no id
    if (!id) return;
    
    // get full worklist, set action and submit worklist.
    WorklistSrvc.get(id).then(
      function(data) {
        data.Task["%Action"] = "$Relinquish";    
        $scope.page.submit(data); 
      },
      function(data, status, headers, config) {
        $scope.page.addAlert( {type: 'danger', msg: data.Error} );      
      });
  };
  
  
  // submit the worklist object 
  $scope.page.submit = function(worklist) {
    // send object to server. If ok, refresh data on page.
    WorklistSrvc.save(worklist, $scope.page.authToken).then(
      function(data) { 
         $scope.page.dataInit();    
      },
      function(data, status, headers, config) {
         $scope.page.addAlert( {type: 'danger', msg: data.Error} );  
      } 
    );  
  };
  
  /* table section */
  
  // sorting table
  $scope.page.sort = function(property, isUp) {
    $scope.page.predicate = property; 
    $scope.page.isUp = !isUp;
    // change sorting icon
    $scope.page.sortIcon = 'fa fa-sort-' + ($scope.page.isUp ? 'up':'down') + ' pull-right';    
  };
    
  // selecting row in table
  $scope.page.select = function(item) {
    if ($scope.page.grid.selected) {
      $scope.page.grid.selected.rowCss = '';
        
      if ($scope.page.grid.selected == item) {
        $scope.page.grid.selected = null;
        return;
      }
    }
      
    $scope.page.grid.selected = item;
    // change css class to highlight the row
    $scope.page.grid.selected.rowCss = 'info';
  };

  // count currently displayed tasks
  $scope.page.totalCnt =  function() {
    return $window.document.getElementById('tasksTable').getElementsByTagName('TR').length - 2;
  };

    
  // if AssignedTo matches with current user - return 'true'  
  $scope.page.isAssigned = function(selected) {
    if (selected) {   
      if (selected.AssignedTo.toLowerCase() === $cookies['User'].toLowerCase())
        return true;
    }    
    return false;
  };
  
  // watching for changes in 'Search' input
  // if there is change, reset the selection.  
  $scope.$watch('query', function() {
    if ($scope.page.grid.selected) {
      $scope.page.select($scope.page.grid.selected);  
    }
  });

  /* modal window open */
  
  $scope.page.modalOpen = function (size, id) {    
    // if no id - nothing to do
    if (!id) return;
      
    // obtainig the full object by id. If ok - open modal.
    WorklistSrvc.get(id).then(
      function(data) {
        // see http://angular-ui.github.io/bootstrap/ for more options
        var modalInstance = $modal.open({
          templateUrl: 'partials/task.csp',
          controller: 'TaskCtrl',
          size: size,
          backdrop: true,
          resolve: {
                    task :  function() { return data; }, 
                    submit: function() { return $scope.page.submit }
                   }
        });
        
        // onResult
        modalInstance.result.then(
          function (reason) {
            if (reason === 'save') {
              $scope.page.addAlert( {type: 'success', msg: 'Task saved'} );   
            }
          }, 
          function () {});
      },
      function(data, status, headers, config) {
        $scope.page.addAlert( {type: 'danger', msg: data.Error} );        
      });
     
    };
     

  /*  User's validity checking. */

  // If we get the data for other user, logout immediately
  $scope.page.checkUserValidity = function() {
   var user = $cookies['User'];
   
   for (var i = 0; i < $scope.page.grid.items.length; i++) {
     
     if ($scope.page.grid.items[i].AssignedTo && (user.toLowerCase() !== $scope.page.grid.items[i].AssignedTo.toLowerCase())) {  
       return false;
     }
     else if ($scope.page.grid.items[i].AssignedTo && (user.toLowerCase() == $scope.page.grid.items[i].AssignedTo.toLowerCase())) {
       return true;
     }
   } 
   
   return true;
  };
        
  
  // Check user's validity every 10 minutes.
  setInterval(function() { $scope.page.dataInit() }, 600000); 

  /* Initialize */ 
  
  // sort table (by Age, asc)
  // to change sorting column change 'columns[<index>]'
  $scope.page.sort($scope.page.grid.columns[7].property, true);
  
  $scope.page.dataInit();   
}

// resolving minification problems
TasksGridCtrl.$inject = ['$scope', '$window', '$modal', '$cookies', 'WorklistSrvc'];
controllersModule.controller('TasksGridCtrl', TasksGridCtrl);
