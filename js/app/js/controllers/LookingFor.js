//retirementControllers.controller('LookingFor', ['$scope', function($scope){
function LookingFor($scope, $rootScope, dataService, dataProvider){
  $scope.calculatorOptions = [{
    value: 1,
    name: 'How Many Years Your Retirement Savings Will Last',
    description: 'This will calculate your age when retirement savings run out. If you estimate you will live past this age, then you can change the budget variables to plan accordingly.'
  }, {
    value: 2,
    name: 'Are Your Savings Enough To Live Your Desired Retirement Lifestyle',
    description: ' This will calculate if you are over or under budget according to your financial plan. It is similar to the option above but asks for expected years in retirement.'
  }, {
    value: 3,
    name: 'When You Can Retire',
    description: 'This will calculate the age at which you can retire, given your savings, pre retirement budget, and post retirement budget.'
  }];

  dataService.data.calculator = dataService.data.calculator || 1;
  $rootScope.$broadcast('UPDATE_DATA', dataService.data);

  $scope.calculator = dataService.data.calculator;

  $scope.$watch('calculator', function(){
    dataService.data.calculator = $scope.calculator;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });

}
