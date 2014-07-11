'use strict';

var retirementServices = angular.module('retirementServices', ['ngResource']);

retirementServices.service('dataService', dataService);

function dataService($rootScope){
  var data = {}
  var self = this
  var target = angular.element('#settings')

  if(target == undefined || !target.length){
    data = {name: '', nid: null}
  }else{
    var tmp = JSON.parse(target.text())
    data = JSON.parse(tmp.body)
    data.nid = tmp.nid
    data.name = tmp.name
  }

  self.data = data

  this.set = function(data){
    self.data = data
  }

  $rootScope.$on('UPDATE_DATA', function(event, data){
    self.data = data
  });
}

retirementServices.provider('dataProvider', dataProvider);

function dataProvider(){
  var data = {}
//  var target = angular.element('#settings');
//
//  if(target == undefined){
//    data = {name: '', nid: null}
//  }else{
//    data = JSON.parse(target.find("#body").text())
//  }

  this.data = data;
  this.$get = function(){
    return this.data;
  }
}

retirementServices.factory('budgetAccounts', ['$resource', function($resource){
  return $resource('/wp_retirement_budget_accounts', {}, {
    query: {method:'GET'}
  });
}]);

retirementServices.provider('expensesData', function(){
  var data = {}
  this.data = data;

  this.$get = function(){
    return this.data;
  }
})

retirementServices.factory('saveData', ['$resource', function($resource){
//  var Data = $resource('/wp_retirement_rest/:action/:data', {action: '@action', data: '@data'});
//  var data = Data.get({action: 'save', data: 'www'});
//  return $resource('/wp_retirement_rest/:action/:data', {action: ''}, {
//    query: {method: 'POST'}
//  });
}]);

retirementServices.factory('CompareTerms', [function(){
  this.compare = function(a, b){
    if (a.weight < b.weight)
      return -1
    if (a.weight > b.weight)
      return 1
    return 0
  }
  return this
}]);

retirementServices.service('ExcelMethods', function(){
  this.FV = function(rate, nper, pmt, pv, type) {
    if(pv == undefined) pv = 0
    if(type == undefined) type = 0

    var pow = Math.pow(1 + rate, nper),
      fv;
    if (rate) {
      fv = (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;
    } else {
      fv = -1 * (pv + pmt * nper);
    }
    return fv;
  }

  this.PMT = function(rate_per_period, number_of_payments, present_value, future_value, type){
    if(future_value == undefined) future_value = 0
    if(type == undefined) type = 0

    if(rate_per_period != 0.0){
      // Interest rate exists
      var q = Math.pow(1 + rate_per_period, number_of_payments);
      return  -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

    } else if(number_of_payments != 0.0){
      // No interest rate, but number of payments exists
      return -(future_value + present_value) / number_of_payments;
    }

    return 0;
  }

  this.log10 = function(val) {
    return Math.log(val) / Math.LN10;
  }

})

retirementServices.factory('Advisors', ['$resource', function($resource){
  return $resource('/wp-retirement-advisors', {}, {
    query: {method: 'GET'}
  });
}]);
