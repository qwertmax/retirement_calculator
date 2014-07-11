'use strict';

/* App Module */

var retirementApp = angular.module('retirementApp', [
  'ngRoute',
  'ngSanitize',
  'retirementControllers',
  'retirementServices',
  'uiSlider',
//  'ui.slider',
  'ui.bootstrap'
//  'easyMatchServices'
]);

retirementApp.constant('base_path', function(){
  return Drupal.settings.angularjsApp.basePath + 'sites/all/modules/wp_retirement/js/app'
});

//retirementApp.config(['$routeProvider',
//  function($routeProvider, base_path) {
//    var base_path = Drupal.settings.angularjsApp.basePath + 'sites/all/modules/wp_retirement/js/app'
//    $routeProvider.
//      when('/', {
//        templateUrl: base_path +'/partials/main.html',
//        controller: 'MainCtrl'
//      }).
//      otherwise({
//        redirectTo: '/'
//      });
//  }])

retirementApp.directive('frequency', function($compile, base_path){
  var base_path = base_path()
//  var base_path = Drupal.settings.angularjsApp.basePath + 'sites/all/modules/wp_retirement/js/app'
  var obj = {
    restrict: 'A',
    scope: {
      title: '@',
      frequency: '=',
      account: '=',
      tid: '=',
      blur: '&'
    },
    templateUrl: base_path + '/partials/select.html'
  }
  return obj;
})

retirementApp.directive('numbersOnly', function(){
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        // this next if is necessary for when using ng-required on your input.
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue == undefined) return ''
        var transformedInput = inputValue.replace(/[^0-9]/g, '');
        if (transformedInput!=inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }

        return transformedInput;
      });
    }
  };
});

retirementApp.directive('tablerow', function(){
  return {
    restrict: 'AE',
//    require: 'data',
//    transclude: true,
    template: "<div>default text</div>",
    link: function(scope, element, attrs){
      scope.$watch(attrs.data, function(val){

//      element.text(attrs.data);
//      element.attr('myAttr', attrs.data);
        console.log(val);

      })
    },
    scope: {
      tableClass: '='
    }
  };

});

retirementApp.directive('retirementtable', function($compile, base_path){
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: base_path() + '/partials/table.html',
    link: function(scope, element, attrs){
      scope.see = 'See more';
      scope.seeMore = function(){
        angular.element('.level1, .level2, .level3').slideToggle('fast');
        if(scope.see == 'See more'){
          scope.see = 'See less';
        }else{
          scope.see = 'See more';
        }
      }

    },
    scope: {
      data: '='
    }
  };

});
