'use strict';

var retirementControllers = angular.module('retirementControllers', []);

retirementControllers.controller('MainCtrl', ['$scope', 'base_path', 'saveData', '$resource', 'dataService', '$modal', '$rootScope', function($scope, base_path, saveData, $resource, dataService, $modal, $rootScope){
  $scope.base_path = base_path()

  $scope.page = 0;

  $scope.templates = [{
    url: $scope.base_path +'/partials/looking_for.html',
    name: 'START',
    id: 1
  },{
    url: $scope.base_path +'/partials/pre_retirement_data.html',
    name: 'VARIABLES',
    id: 2
  },{
    url: $scope.base_path +'/partials/pre_retirement_budget.html',
    name: 'CURRENT BUDGET',
    controller: '',
    id: 3
  },{
    url: $scope.base_path +'/partials/post_retirement_budget.html',
    name: 'RETIREMENT BUDGET',
    id: 4
  },{
    url: $scope.base_path +'/partials/results.html',
    name: 'RESULTS',
    id: 5
  }];

  $scope.template = $scope.templates[$scope.page];

  $scope.topTabClick = function(template){
    $scope.template = template;
    $scope.page = template.id - 1;

    if($scope.page == 4) {
      $rootScope.$broadcast('REDRAW', dataService.data);
    }
  }

  $scope.next = function(){
    if($scope.templates[$scope.page+1] != undefined){
      $scope.page++
      $scope.topTabClick($scope.templates[$scope.page])
    }
  }

  $scope.mySubmit = function(e){
    var Data = $resource('/wp_retirement_rest/:action', {action: '@action'})
    var data = Data.save({action: 'save', data: JSON.stringify(dataService.data)})
    data.$promise.then(function(data){
      if(data.path != undefined){
        window.location = '/'+ data.path
      }
    })
  }

  $scope.save = function(){
    var modalInstance = $modal.open({
      templateUrl: base_path() + "/partials/dialog.html",
      controller: function($scope, $modalInstance, name){
        $scope.name = name;
        $scope.error = false;

        $scope.uid = (Drupal.settings.fa_uid) ? true: false;

        $scope.ok = function(val){
          if(!val.length){
            $scope.error = true;
            return false;
          }

          $scope.error = false;

          if(this.sendBudget){
            $modalInstance.close({val: val, contact: this.contact});

          }else{
            $modalInstance.close({val: val});
          }
        };
        $scope.cancel = function(){
          $modalInstance.dismiss('cancel');
        };
        $scope.login = function(val){
          $modalInstance.close(val);
          angular.element('.login-popup a').click();
        };
        $scope.register = function(val){
          $modalInstance.close(val);
          angular.element('.register-popup a').click();
        };
      },
      resolve: {
        name: function(){
          return $scope.name;
        }
      }
    });

    modalInstance.result.then(function(data){
      $scope.name = data.val;
      dataService.data.name = $scope.name;
      $rootScope.$broadcast('UPDATE_DATA', dataService.data);

      if(Drupal.settings.fa_uid){
        var Data = $resource('/wp_retirement_rest/:action', {action: '@action'})
        var data = Data.save({action: 'save', data: JSON.stringify(dataService.data), contact: data.contact})
        data.$promise.then(function(data){
          if(data.path != undefined){
            window.location = '/'+ data.path
          }
        })
      }

    });
  }

  $scope.load = function(){
    $scope.options = JSON.parse(angular.element('#caclulators_list').html())

    var modalInstance = $modal.open({
      templateUrl: base_path() + "/partials/dialog_select.html",
      controller: function($scope, $modalInstance, options){
        $scope.options = options
        $scope.calc_name = options[0].url

        $scope.ok = function(val){
          $modalInstance.close(val);
        };

        $scope.cancel = function(){
          $modalInstance.dismiss('cancel');
        };
      },
      resolve: {
        options: function(){
          return $scope.options;
        }
      }
    });

    modalInstance.result.then(function(calc_name){
      window.location = '/'+ calc_name
    });
  }

  $scope.erase = function(){
    $scope.options = JSON.parse(angular.element('#caclulators_list').html())

    var modalInstance = $modal.open({
      templateUrl: base_path() + "/partials/dialog_ask.html",
      controller: function($scope, $modalInstance, options){
        $scope.options = options

        $scope.ok = function(val){
          $modalInstance.close();
        };

        $scope.cancel = function(){
          $modalInstance.dismiss('cancel');
        };
      },
      resolve: {
        options: function(){
          return $scope.options;
        }
      }
    });

    modalInstance.result.then(function(){
      window.location = '/retirement-calc'
    });
  }

  $scope.print = function(){
    var nid = dataService.data.nid;
    window.location = "/wp-retirement-tcpdf/"+ nid;
  }

  $scope.name = dataService.data.name
}]);


retirementControllers.controller('LookingFor', ['$scope', '$rootScope', 'dataService', 'dataProvider', LookingFor]);

retirementControllers.controller('PreRetData', ['$scope', '$rootScope', 'dataService', 'dataProvider', PreRetData]);

retirementControllers.controller('PreRetBudget', ['$scope', '$rootScope', 'dataService', 'dataProvider', 'budgetAccounts', 'CompareTerms', 'expensesData', PreRetBudget]);

retirementControllers.controller('PostRetBudget', ['$scope', '$rootScope', 'dataService', 'dataProvider', 'budgetAccounts', 'CompareTerms', PostRetBudget]);

//retirementControllers.controller('PostRetBudget', ['$scope', '$rootScope', 'dataService', 'ExcelMethods', 'Advisors', 'expensesData', Results]);
