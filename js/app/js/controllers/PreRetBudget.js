function PreRetBudget($scope, $rootScope, dataService, dataProvider, budgetAccounts, CompareTerms, expensesData){
  dataService.data.PreRetBudget = dataService.data.PreRetBudget || {};

  $scope.dataLoaded = false;

  $scope.isTabFilled = function(tab){
    var sub = false;
    for(var i in tab.parents){
      if(tab.parents[i].parents != undefined){
        for(var j in tab.parents[i].parents){
          sub = true;
          var value = dataService.data.PreRetBudget.expense.account[tab.parents[i].parents[j].tid];
          if(value == undefined || value == 0){
            return false;
          }
        }
      }
      var value = dataService.data.PreRetBudget.expense.account[tab.parents[i].tid];
      if(!sub && (value == undefined || value == 0)){
        return false;
      }
    }
    return true;
  }

  $scope.calcTotals = function(){
    var dataTypes = ['income', 'expense'];
    for(var j in dataTypes){
      var data = dataService.data.PreRetBudget[dataTypes[j]];
      var sum = 0
      for(var i in data.account){
        if(data.account[i] == undefined) continue
        sum += data.account[i] * data.frequency[i]
      }
      dataService.data.PreRetBudget[dataTypes[j]].total = sum
    }

    if(!dataService.data.PreRetBudget.expense.total){
      dataService.data.PreRetBudget.expense.total = $scope.expensesTotal;
    }
    $scope.annualExpenses = dataService.data.PreRetBudget[dataTypes[0]].total - dataService.data.PreRetBudget[dataTypes[1]].total;
  }

  $scope.calcTotal = function(tab){
    if(tab.type == 'custom') return dataService.data.PreRetBudget.expense.total;

    var data = dataService.data.PreRetBudget[tab.type]
    tab.localTotal = 0

    function mul(value){
      if(data.account[value.tid] == undefined || data.frequency[value.tid] == undefined)
        return 0
 
      return data.account[value.tid] * data.frequency[value.tid]
    }

    if($scope.hasParents(tab.parents[0])){
      angular.forEach(tab.parents, function(localTab){
        angular.forEach(localTab.parents, function(val){
          tab.localTotal += mul(val)
        })
      })
    }else{
      angular.forEach(tab.parents, function(val){
        tab.localTotal += mul(val)
      })
    }

    return isNaN(tab.localTotal)? 0: tab.localTotal
  }

  $scope.tabs = [];

//  $scope.tabs.push({
//    name: 'Annual Savings/Shortfall',
//    type: 'custom',
//    parents: [0]
//  });

  $scope.annualExpenses = dataService.data.PreRetBudget.annualExpenses || 0
  $scope.AnnualSalaryIncrease = parseInt(dataService.data.PreRetBudget.AnnualSalaryIncrease) || 0

  $scope.expense = {}
  $scope.expense.frequency = {}
  $scope.expense.account = {}
  $scope.expense.total = 0

  $scope.income = {}
  $scope.income.frequency = {}
  $scope.income.account = {}
  $scope.income.total = 0

  dataService.data.PreRetBudget.income = dataService.data.PreRetBudget.income || $scope.income
  dataService.data.PreRetBudget.expense = dataService.data.PreRetBudget.expense || $scope.expense
  $scope.income.total = dataService.data.PreRetBudget.income.total || $scope.income.total
  $scope.expense.total = dataService.data.PreRetBudget.expense.total || $scope.expense.total
  $scope.expensesTotal = $scope.expense.total;

  $scope.isCustom = function(obj){
    return obj.type == 'custom';
  }

  $scope.hasParents = function(obj){
    return obj.parents != undefined
  }

  var dataLoad = dataService.data.PreRetBudget;
  budgetAccounts.query({tid:467}).$promise.then(function(data){
    data = data.budgetAccounts;
    var parents = [];

    for(var i in data){
      parents.push(data[i]);
    }

    parents.sort(CompareTerms.compare);

    var tab = {
      name: 'Income',
      title: 'Current Annual Income',
      parents: parents,
      tid: 467,
      type: 'income'
    }
    $scope.tabs.push(tab);

    for(var i in tab.parents){
      if(dataLoad.income.frequency[tab.parents[i].tid] == undefined){
        $scope.income.frequency[tab.parents[i].tid] = 1
      }else{
        $scope.income.frequency[tab.parents[i].tid] = dataLoad.income.frequency[tab.parents[i].tid]
        $scope.income.account[tab.parents[i].tid] = dataLoad.income.account[tab.parents[i].tid]
      }
    }

    $scope.tabs.push({
      name: 'Expenses',
      title: 'Current Annual Expenses',
      type: 'custom',
      parents: [0]
    });

  });

  budgetAccounts.query({tid:468}).$promise.then(function(data){
    data = data.budgetAccounts;

    expensesData.data = data;

    for(var i in data){
      var tid = data[i].tid;

      var tab = {
        name: data[i].name,
        title: data[i].name,
        parents: data[i].parents,
        tid: tid,
        type: 'expense'
      }
      $scope.tabs.push(tab);

      for(var j in tab.parents){
        if(dataLoad.expense.frequency[tab.parents[j].tid] == undefined){
          $scope.expense.frequency[tab.parents[j].tid] = 1;
        }else{
          $scope.expense.frequency[tab.parents[j].tid] = dataLoad.expense.frequency[tab.parents[j].tid]
          $scope.expense.account[tab.parents[j].tid] = dataLoad.expense.account[tab.parents[j].tid]
        }
//        $scope.expense.frequency[tab.parents[j].tid] = 1;

        if($scope.hasParents(tab.parents[j])){
          for(var p in tab.parents[j].parents){
            if(dataLoad.expense.frequency[tab.parents[j].parents[p].tid] == undefined){
              $scope.expense.frequency[tab.parents[j].parents[p].tid] = 1
            }else{
              $scope.expense.frequency[tab.parents[j].parents[p].tid] = dataLoad.expense.frequency[tab.parents[j].parents[p].tid]
              $scope.expense.account[tab.parents[j].parents[p].tid] = dataLoad.expense.account[tab.parents[j].parents[p].tid]
            }
          }
        }
      }
    }

    $scope.tab = $scope.tabs[0];
    $scope.dataLoaded = true
  });

  $scope.tabClick = function(tab){
    $scope.tab = tab;
  }
  $scope.nextSubTab = function(){
    if($scope.tabs.indexOf($scope.tab)+1 == $scope.tabs.length) return;

    $scope.tab = $scope.tabs[$scope.tabs.indexOf($scope.tab)+1];
  }
  $scope.prevSubTab = function(){
    if($scope.tabs.indexOf($scope.tab) < 1) return;

    $scope.tab = $scope.tabs[$scope.tabs.indexOf($scope.tab)-1];
  }

  $scope.$watch(function(oldVal, newVal){
    if((event != undefined) && (event.type == 'input' || event.type == 'change')){
      if(event.currentTarget.id != 'annualExpenses' || event.currentTarget.id != 'expensesTotal'){
        $scope.calcTotals()
      }
//      if(event.currentTarget.id == 'AnnualSalaryIncrease'){
//        dataService.data.PreRetBudget.income.account[676] = $scope.AnnualSalaryIncrease
//        dataService.data.PreRetBudget.income.frequency[676] = 1
//      }
//      if(event.currentTarget.id == 'account-676'){
//        var income = dataService.data.PreRetBudget.income
//        $scope.AnnualSalaryIncrease =  income.account[676] * income.frequency[676]
//      }

      if(event.currentTarget.id == 'expensesTotal'){
        $scope.expense.total = $scope.expensesTotal;
        $scope.annualExpenses = $scope.income.total - $scope.expense.total;
      }

      dataService.data.PreRetBudget.annualExpenses = $scope.annualExpenses;
//      dataService.data.PreRetBudget.AnnualSalaryIncrease = $scope.AnnualSalaryIncrease
      dataService.data.PreRetBudget.income = $scope.income;
      dataService.data.PreRetBudget.expense = $scope.expense;

      $rootScope.$broadcast('UPDATE_DATA', dataService.data)
    }
  })

}
