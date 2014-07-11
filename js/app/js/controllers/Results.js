function Results($scope, $rootScope, dataService, ExcelMethods, Advisors, expensesData){
  $scope.data = dataService.data;
  $scope.calculator = dataService.data.calculator;
  $scope.resultsVariables = [];
  $scope.tableData = [];

//  var data = $scope.data;
  $scope.savings = {data: [], age: [], resultsVariables: [], condition: []}
  angular.element("#advisors").css("display", "block");
  $scope.advisors = '';

  Advisors.query().$promise.then(function(data){
    $scope.advisors = data.advisors;
  });

  var chart = new Highcharts.Chart({
//    .width(800)
//    .height(500)
//    .highcharts({
      chart: {
        renderTo: 'chart',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Projected Savings',
        x: -20 //center
      },
//      subtitle: {
//        text: 'I like Coding',
//        x: -20
//      },
      xAxis: {
        text: 'Age (Years)',
        categories: $scope.savings.age
      },
      yAxis: {
        title: {
          text: 'Savings ($)'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        min: 0
      },
      tooltip: {
        useHTML: true,
        formatter: function(){
          return '<strong>Year:</strong> '+ this.key + '<br/><strong>Savings:</strong> $' + this.y.toFixed(0);
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: [{
        name: 'Savings',
        data: $scope.savings.data
      }]

    });

  $scope.savings = redrawChart($scope.data, ExcelMethods)

  dataService.data.Results = $scope.savings.Results;
  $rootScope.$broadcast('UPDATE_DATA', dataService.data);

  $rootScope.$on('REDRAW', function(event, data){
    $scope.calculator = dataService.data.calculator;
    $scope.savings = redrawChart($scope.data, ExcelMethods);

//    $scope.q = $scope.savings.q;

    $scope.tableData = redrawTable($scope.data, expensesData);

    chart.xAxis[0].setCategories($scope.savings.age)
    chart.series[0].setData($scope.savings.data)
  });

}

function redrawChart(data, ExcelMethods){
  var savings = {data: [], age: [], resultsVariables: [], condition: []}
//  var q = []
  var
    yearsLimit = 200,
    age = (data.PreRetData.currentAge != undefined) ? data.PreRetData.currentAge: 0, //$B$2
    annualExpenses = (data.PreRetBudget.annualExpenses != undefined)? data.PreRetBudget.annualExpenses: 0, //$B$5
    ageIndex = age, //
    percentage = data.PreRetData.percentage / 100, //$B$6
//    SalaryIncrease = parseInt(data.PreRetBudget.AnnualSalaryIncrease)? parseInt(data.PreRetBudget.AnnualSalaryIncrease): data.PreRetBudget.income.account[676] * data.PreRetBudget.income.frequency[676], //$B$11
//    SalaryIncrease = parseInt(data.PreRetData.AnnualSalaryIncrease), //$B$11
    SalaryIncrease = data.PreRetBudget.income.total * parseFloat(data.PreRetData.AnnualSalaryIncrease) / 100, //$B$11
    Surplus = data.PostRetBudget.Surplus,
    GovernmentPension = data.PostRetBudget.income.account[670] * data.PostRetBudget.income.frequency[670] || 0,
    AverageTaxOnWithdrawalsInRetirement = 25 / 100,
//  ExpensesInflation = 31208.99,//$D$5
//    Income = 56088,
//    Expenses =  41080,
    Income = data.PreRetBudget.income.total,
    Expenses = data.PreRetBudget.expense.total,

//    InflationRate = SalaryIncrease / Income,
    InflationRate = data.PreRetData.InflationRate / 100;

    CurrentRetirementSavings = data.PreRetData.savings, //$B$4
    ExpectedYears = data.PreRetData.expectedYears,
    ExpectedAge = data.PreRetData.expectedAge, //$B$3

    expExpectedAgeAge = Math.pow(1 + percentage, ExpectedAge - age),
    expAgeExpectedAge = Math.pow(1 + percentage, age - ExpectedAge),

    FundsAcquiredThroughPrinciple = ExcelMethods.FV(percentage, ExpectedAge - age, 0, -1) * CurrentRetirementSavings,
    FundsObtainedFromTheTenYears = ExcelMethods.FV(percentage, ExpectedAge - age, -1) * annualExpenses,
    FundsObtainedFromTheTenYearsGradiant = (SalaryIncrease * (expExpectedAgeAge - percentage * (ExpectedAge - age) - 1) /
      (percentage * percentage * expExpectedAgeAge)) * expExpectedAgeAge,
    ExpensesInflation = (expExpectedAgeAge * Expenses * (1 - Math.pow(1 + InflationRate, ExpectedAge - age) * expAgeExpectedAge) / (percentage - InflationRate)) -
      Expenses * ((expExpectedAgeAge -1) / percentage),//D5
    TotalFunds = FundsAcquiredThroughPrinciple + FundsObtainedFromTheTenYears + FundsObtainedFromTheTenYearsGradiant - ExpensesInflation,

    FactorRateForPrinciple = ExcelMethods.FV(percentage, ExpectedAge - age, 0, -1),//D2
    FactorRateForAnnuity = ExcelMethods.FV(percentage, ExpectedAge - age, -1),//D3
    FactorRateForArithmeticGradiantOnAnnuity = (Math.pow(1 + percentage, ExpectedAge - age) - percentage * (ExpectedAge - age) - 1) /
      (percentage * percentage * Math.pow(1 + percentage, ExpectedAge - age)) * Math.pow(1 + percentage, ExpectedAge - age),//D4

    TotalAmountSavedAtRetirement = FactorRateForPrinciple * CurrentRetirementSavings + FactorRateForAnnuity * annualExpenses +
      FactorRateForArithmeticGradiantOnAnnuity * SalaryIncrease - ExpensesInflation; //D6

  var NumberOfYearsInRetirement = ExcelMethods.log10((1 - (TotalAmountSavedAtRetirement *(percentage - InflationRate)) / ((Surplus - GovernmentPension) * (1 + AverageTaxOnWithdrawalsInRetirement))) ) /
    ExcelMethods.log10((1 + InflationRate)/(1 + percentage));//D7
  var AgeOfUntilFundsRunDry = ExpectedAge + NumberOfYearsInRetirement;//D8
//  console.log(Surplus);

  if(data.calculator == 1){
    for(var i = age; i <= yearsLimit;i++){
      var
        expAgeIndexAge = Math.pow(1 + percentage, ageIndex - age),
        expAgeAgeIndex = Math.pow(1 + percentage, age - ageIndex)

      var Equation2 =
        annualExpenses * ExcelMethods.FV(percentage, ageIndex - age, -1) +
        SalaryIncrease * (expAgeIndexAge - (percentage * (ageIndex - age)) - 1) /
        (percentage * percentage * expAgeIndexAge) * expAgeIndexAge -
        (ExpensesInflation * expAgeAgeIndex) * ExcelMethods.PMT(percentage, ExpectedAge - age, -1) * ExcelMethods.FV(percentage, ageIndex - age, -1) +
        CurrentRetirementSavings * expAgeIndexAge,

      Equation3 =
        TotalAmountSavedAtRetirement * Math.pow(1 + percentage, ageIndex - ExpectedAge) -
        ((Surplus - GovernmentPension) * (1 + AverageTaxOnWithdrawalsInRetirement) * Math.pow(1 + percentage, ageIndex - ExpectedAge) * (1 - Math.pow(1 + InflationRate, ageIndex - ExpectedAge) * Math.pow(1 + percentage, ExpectedAge - ageIndex)) / (percentage - InflationRate) )

      if(ageIndex < ExpectedAge){
        savings.data.push(Equation2)
      }else{
        if(Equation3 < 0)break;
        savings.data.push(Equation3)
      }
      savings.age.push(ageIndex)

//      q.push({
//        q: ageIndex,
//        q0: InflationRate,
//        q1: Equation2,
//        q2: Equation3
//      })

      ageIndex++
    }

    if(isNaN(AgeOfUntilFundsRunDry) || AgeOfUntilFundsRunDry < 0 || AgeOfUntilFundsRunDry == null || AgeOfUntilFundsRunDry < age){
      savings.condition = false;
      AgeOfUntilFundsRunDry = 0
    }else{
      savings.condition = true;
    }
    savings.resultsVariables.push(TotalAmountSavedAtRetirement.toFixed(2));
    savings.resultsVariables.push(Math.round(AgeOfUntilFundsRunDry));

  }

  if(data.calculator == 2){
    for(var i = age; i <= yearsLimit; i++){
      var
        expAgeIndexAge = Math.pow(1 + percentage, ageIndex - age),
        expAgeAgeIndex = Math.pow(1 + percentage, age - ageIndex)

      var Equation2 =
        annualExpenses * ExcelMethods.FV(percentage, ageIndex - age, -1) +
        SalaryIncrease * (expAgeIndexAge - (percentage * (ageIndex - age)) - 1) /
        (percentage * percentage * expAgeIndexAge) * expAgeIndexAge -
        ((ExpensesInflation * expAgeAgeIndex) * ExcelMethods.PMT(percentage, ExpectedAge - age, -1) * ExcelMethods.FV(percentage, ageIndex - age, -1)) +
        CurrentRetirementSavings * expAgeIndexAge

      var Equation3 =
        TotalFunds * Math.pow(1 + percentage, ageIndex - ExpectedAge) -
        (Surplus - GovernmentPension) * (1 + AverageTaxOnWithdrawalsInRetirement) * Math.pow(1 + percentage, ageIndex - ExpectedAge) *
        (1 - Math.pow(1 + InflationRate, ageIndex - ExpectedAge) * Math.pow(1 + percentage, ExpectedAge - ageIndex)) / (percentage - InflationRate)

      if(ageIndex < ExpectedAge){
        savings.data.push(Equation2)
      }else{
        if(Equation3 < 0) break
        savings.data.push(Equation3)
      }
      savings.age.push(ageIndex)

      ageIndex++
    }

    savings.resultsVariables.push(FundsAcquiredThroughPrinciple.toFixed(2));
    savings.resultsVariables.push(Math.round(TotalAmountSavedAtRetirement).toFixed(2));
    savings.condition = savings.resultsVariables[1] - savings.resultsVariables[0];
  }

  if(data.calculator == 3){
    var
      rand1 = CurrentRetirementSavings / (Math.pow(1 + percentage, age)) + (annualExpenses / (percentage * Math.pow(1 + percentage, age))),
      rand2 = annualExpenses / percentage,
      AnnualExpensesInRetirementAccountingForTaxAndGovernmentPension = (Surplus - GovernmentPension) * (1 + AverageTaxOnWithdrawalsInRetirement),
      rand3 = (AnnualExpensesInRetirementAccountingForTaxAndGovernmentPension / (percentage - InflationRate)) * Math.pow((1 + InflationRate)/(1 + percentage), ExpectedYears),
      value = 0;

    for(var i = age; i <= yearsLimit; i++){
      value = rand1 * Math.pow(1 + percentage, i) - rand2 + rand3 * Math.pow((1 + percentage)/(1 + InflationRate), i)
      var ageCondition = (AnnualExpensesInRetirementAccountingForTaxAndGovernmentPension) / (percentage - InflationRate)
      if(value > ageCondition){
        ExpectedAge = i
        break
      }
    }

    var AmountRequiredAtRetirementYearOne = 0

    for(var i = age; i <= yearsLimit; i++){
      var
        expAgeIndexAge = Math.pow(1 + percentage, ageIndex - age),
        expAgeAgeIndex = Math.pow(1 + percentage, age - ageIndex);

      var Equation2 =
        CurrentRetirementSavings * expAgeIndexAge + annualExpenses * (1 - expAgeAgeIndex) / percentage * expAgeIndexAge;

      if(ageIndex == ExpectedAge){
        AmountRequiredAtRetirementYearOne = Equation2;
      }

      var Equation3 =
        AmountRequiredAtRetirementYearOne *
          Math.pow(1 + percentage, ageIndex - ExpectedAge) - AnnualExpensesInRetirementAccountingForTaxAndGovernmentPension * ((1 - Math.pow(1 + InflationRate, ageIndex - ExpectedAge) * Math.pow(1 + percentage, ExpectedAge - ageIndex)) /
          (percentage - InflationRate)) * Math.pow(1 + percentage, ageIndex - ExpectedAge);

      if(ageIndex < ExpectedAge){
        savings.data.push(Equation2);
      }else{
        if(Equation3 < 0) break
        savings.data.push(Equation3);
      }
      savings.age.push(ageIndex);

      ageIndex++
    }
    //(LOG((D2+B5/B6)/(B4+B5/B6)))/LOG(1+B6)
    var NumberOfYearsUntilYouCanRetire = (ExcelMethods.log10( (AmountRequiredAtRetirementYearOne + annualExpenses/percentage)/(CurrentRetirementSavings + annualExpenses/percentage) )) / ExcelMethods.log10(1 + percentage);
//    var NumberOfYearsUntilYouCanRetire = (AmountRequiredAtRetirementYearOne + annualExpenses/percentage)/(CurrentRetirementSavings + annualExpenses/percentage) ;
//    console.log(AmountRequiredAtRetirementYearOne);

    savings.resultsVariables.push(ExpectedAge);
//    savings.resultsVariables.push(Math.round(NumberOfYearsUntilYouCanRetire));
    savings.resultsVariables.push(Math.round(AmountRequiredAtRetirementYearOne));
  }

  var Results = {
    TotalAmountSavedAtRetirement: TotalAmountSavedAtRetirement,
    AgeOfUntilFundsRunDry: Math.round(AgeOfUntilFundsRunDry),
    FundsAcquiredThroughPrinciple: FundsAcquiredThroughPrinciple,
    ExpectedAge: ExpectedAge,
    AmountRequiredAtRetirementYearOne: Math.round(AmountRequiredAtRetirementYearOne)
  };

  savings.Results = Results;

//  savings.q = q

  return savings
}

function redrawTable(data, expensesData){
  var tableData = [];

  fillExpensesData(tableData, data, expensesData.data);

  tableData.unshift({
    name: 'Expenses',
    value1: data.PreRetBudget.expense.total,
    value2: data.PostRetBudget.expense.total,
    attr: {type: 'custom', level: 0}
  });

  tableData.unshift({
    name: 'Income',
    value1: data.PreRetBudget.income.total,
    value2: data.PostRetBudget.income.total,
    attr: {type: 'custom', level: 0}
  });

  tableData.push({
    name: 'see-more see',
    value1: '',
    value2: '',
    attr: {type: 'seemore', level: 0}
  });
  tableData.push({
    name: 'Starting surplus or deficit',
    value1: data.PreRetBudget.annualExpenses,
    value2: data.PostRetBudget.Surplus,
    attr: {type: 'custom', level: 0}
  });

  return tableData;
}

function fillExpensesData(tableData, data, expensesData, level){
  if(level == undefined) level = 1;

  for(var i in expensesData){
    if(expensesData[i] == undefined) continue;

    var localTotals = {value1: 0, value2: 0}

    calcTotals(data, expensesData[i], localTotals)

    tableData.push({
      name: expensesData[i].name,
      value1: localTotals.value1,
      value2: localTotals.value2,
      attr: {level: level}
    });

    if((expensesData[i].parents != undefined) && (expensesData[i].parents.length)){
      fillExpensesData(tableData, data, expensesData[i].parents, level+1);
    }

  }

}

function calcTotals(data, expensesData, sum){
  if(sum == undefined) sum = {value1: 0, value2: 0}

  if(expensesData.parents != undefined && expensesData.parents.length){

  }

  if(expensesData.parents == undefined || !expensesData.parents.length){
    var values = getSum(data, expensesData);
    sum.value1 += values.value1;
    sum.value2 += values.value2;
  }

  for(var i in expensesData.parents){

    if(expensesData.parents[i].parents != undefined){
      for(var j in expensesData.parents[i].parents){
        var values = getSum(data, expensesData.parents[i].parents[j]);

        sum.value1 += values.value1;
        sum.value2 += values.value2;

      }
    }

    var values = getSum(data, expensesData.parents[i]);

    sum.value1 += values.value1;
    sum.value2 += values.value2;
  }
//  return sum;
}

function getSum(data, item){
  var
    tid = item.tid,
    value1 = data.PreRetBudget.expense.account[tid] * data.PreRetBudget.expense.frequency[tid],
    value2 = data.PostRetBudget.expense.account[tid] * data.PostRetBudget.expense.frequency[tid];

  if(isNaN(value1)) value1 = 0;
  if(isNaN(value2)) value2 = 0;

  return {value1: value1, value2: value2}
}