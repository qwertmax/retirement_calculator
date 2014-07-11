function PreRetData($scope, $rootScope, dataService, dataProvider){
  dataService.data.PreRetData = dataService.data.PreRetData || {};
  $scope.getCalculator = function(){
    return dataService.data.calculator;
  }

  $scope.AnnualSalaryIncrease = parseInt(dataService.data.PreRetData.AnnualSalaryIncrease) || 0
  $scope.InflationRate = parseInt(dataService.data.PreRetData.InflationRate) || 0

  $scope.list = ['currentAge', 'expectedAge', 'expectedYears', 'savings', 'percentage', 'InflationRate'];

  for(var i in $scope.list){
    var item = $scope.list[i];
    $scope[item] = dataService.data.PreRetData[item];
  }

  if($scope.InflationRate == null){
    $scope.InflationRate = 2;
  }
//  $scope.$watch('list', function(newNames, oldNames){
//    for(var i in newNames){
//      dataService.data.PreRetData[newNames[i]] = $scope[newNames[i]];
//    }
//    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
//    console.log(newNames);
//  }, true);

  $scope.$watch('currentAge', function(){
    dataService.data.PreRetData.currentAge = $scope.currentAge;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('expectedAge', function(){
    dataService.data.PreRetData.expectedAge = $scope.expectedAge;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('expectedYears', function(){
    dataService.data.PreRetData.expectedYears = $scope.expectedYears;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('savings', function(){
    dataService.data.PreRetData.savings = $scope.savings;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('percentage', function(){
    dataService.data.PreRetData.percentage = $scope.percentage;
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('AnnualSalaryIncrease', function(){
//    dataService.data.PreRetBudget.income.account[676] = $scope.AnnualSalaryIncrease
//    dataService.data.PreRetBudget.income.frequency[676] = 1

    dataService.data.PreRetData.AnnualSalaryIncrease = $scope.AnnualSalaryIncrease
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });
  $scope.$watch('InflationRate', function(){
    dataService.data.PreRetData.InflationRate = $scope.InflationRate
    $rootScope.$broadcast('UPDATE_DATA', dataService.data);
  });

}
