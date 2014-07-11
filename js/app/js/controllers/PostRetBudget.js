function PostRetBudget($scope, $rootScope, dataService, dataProvider, budgetAccounts, CompareTerms){
  dataService.data.PostRetBudget = dataService.data.PostRetBudget || {};

  $scope.names = ['Surplus']
  for(var i in $scope.names){
    var name = $scope.names[i]
    $scope[name] = dataService.data.PostRetBudget[name] || 0;
  }

  $scope.isTabFilled = function(tab){
    var sub = false;
    for(var i in tab.parents){
      if(tab.parents[i].parents != undefined){
        for(var j in tab.parents[i].parents){
          sub = true;
          var value = dataService.data.PostRetBudget.expense.account[tab.parents[i].parents[j].tid];
          if(value == undefined || value == 0){
            return false;
          }
        }
      }
      var value = dataService.data.PostRetBudget.expense.account[tab.parents[i].tid];
      if(!sub && (value == undefined || value == 0)){
        return false;
      }
    }
    return true;
  }

  $scope.calcTotals = function(){
    var dataTypes = ['income', 'expense']
    for(var j in dataTypes){
      var data = dataService.data.PostRetBudget[dataTypes[j]]
      var sum = 0
      for(var i in data.account){
        if(data.account[i] == undefined) continue
        sum += data.account[i] * data.frequency[i]
      }
      dataService.data.PostRetBudget[dataTypes[j]].total = sum
    }

    if(!dataService.data.PostRetBudget.expense.total){
      dataService.data.PostRetBudget.expense.total = $scope.AnnualRetirementExpenses;
    }
    $scope.Surplus = dataService.data.PostRetBudget[dataTypes[0]].total - dataService.data.PostRetBudget[dataTypes[1]].total
  }

  $scope.calcTotal = function(tab){
//    if(tab.type == 'custom') return $scope.Surplus
    if(tab.type == 'custom') return $scope.expense.total

    var data = dataService.data.PostRetBudget[tab.type]
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
//    name: 'Retirement Budget',
//    type: 'custom',
//    parents: [0]
//  });

  $scope.expense = {}
  $scope.expense.frequency = {}
  $scope.expense.account = {}
  $scope.expense.total = 0

  $scope.income = {}
  $scope.income.frequency = {}
  $scope.income.account = {}
  $scope.income.total = 0

  dataService.data.PostRetBudget.income = dataService.data.PostRetBudget.income || $scope.income;
  dataService.data.PostRetBudget.expense = dataService.data.PostRetBudget.expense || $scope.expense;
  $scope.income.total = dataService.data.PostRetBudget.income.total || $scope.income.total
  $scope.expense.total = dataService.data.PostRetBudget.expense.total || $scope.expense.total
  $scope.AnnualRetirementExpenses = dataService.data.PostRetBudget.AnnualRetirementExpenses || 0;

  $scope.hasParents = function(obj){
    return obj.parents != undefined
  }

  var tabIncome = {
    name: 'Income',
    title: 'Annual Retirement Income',
    parents: [0],
    tid: 675,
    type: 'income'
  }
  $scope.tabs.push(tabIncome);

  var dataLoad = dataService.data.PostRetBudget
  //income
  budgetAccounts.query({tid:675}).$promise.then(function(data){
    data = data.budgetAccounts;
    var parents = [];
    for(var i in data){
      parents.push(data[i]);
    }
    tabIncome.parents = parents;

    for(var i in tabIncome.parents){
//      $scope.income.frequency[tabIncome.parents[i].tid] = 1;
      var id = tabIncome.parents[i].tid
      if(dataLoad.income.frequency[id] == undefined){
        $scope.income.frequency[id] = 1
      }else{
        $scope.income.frequency[id] = dataLoad.income.frequency[id]
        $scope.income.account[id] = dataLoad.income.account[id]
      }
    }

  });

  $scope.tabs.push({
    name: 'Expenses',
    title: 'Annual Retirement Expenses',
    type: 'custom',
    parents: [0]
  });

  //expenses
  budgetAccounts.query({tid:468}).$promise.then(function(data){
    data = data.budgetAccounts;

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
//        $scope.expense.frequency[tab.parents[j].tid] = 1;
        var id = tab.parents[j].tid
        if(dataLoad.expense.frequency[id] == undefined){
          $scope.expense.frequency[id] = 1
        }else{
          $scope.expense.frequency[id] = dataLoad.expense.frequency[id]
          $scope.expense.account[id] = dataLoad.expense.account[id]
        }

        if($scope.hasParents(tab.parents[j])){
          for(var p in tab.parents[j].parents){
//            $scope.expense.frequency[tab.parents[j].parents[p].tid] = 1;
            var id = tab.parents[j].parents[p].tid
            if(dataLoad.expense.frequency[id] == undefined){
              $scope.expense.frequency[id] = 1
            }else{
              $scope.expense.frequency[id] = dataLoad.expense.frequency[id]
              $scope.expense.account[id] = dataLoad.expense.account[id]
            }
          }
        }
      }
    }

    $scope.tab = $scope.tabs[0];
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

  $scope.$watch('percentage', function(){
//    $scope.expense.total = ($scope.income.total * $scope.percentage / 100).toFixed(0)
  });

  $scope.$watch(function(){
    if((event != undefined) && (event.type == 'input' || event.type == 'change')){
      if(event.currentTarget.id != 'Surplus'){
        $scope.calcTotals()
      }
      if(event.currentTarget.id == 'AnnualRetirementExpenses'){
//        $scope.expense.total = ($scope.income.total * $scope.percentage / 100).toFixed(0)
        $scope.expense.total = $scope.AnnualRetirementExpenses;
        $scope.Surplus = $scope.income.total - $scope.expense.total
      }

      for(var i in $scope.names){
        var name = $scope.names[i];
        dataService.data.PostRetBudget[name] = $scope[name];
      }

      dataService.data.PostRetBudget.AnnualRetirementExpenses = $scope.AnnualRetirementExpenses;
      dataService.data.PostRetBudget.income = $scope.income;
      dataService.data.PostRetBudget.expense = $scope.expense;

      $rootScope.$broadcast('UPDATE_DATA', dataService.data);
    }
  })

}
