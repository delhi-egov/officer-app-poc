var app = angular.module('app', []);

app.factory('httpRequestInterceptor', function ($scope) {
  return {
    request: function (config) {
            var token = window.btoa($scope.user.username + ':' + $scope.user.password);
            config.headers['Authorization'] = 'Basic ' + token;
        return config;
    }
  };
});

var controller = app.controller('controller', function($scope, $http) {
    $scope.user = {};
    $scope.login = function() {
        $scope.refresh();
    }
    $scope.refresh = function() {
        $scope.selected = null;
        $scope.getTasks('assignee', $scope.user.username, 'assigned');
        $scope.getTasks('candidateUser', $scope.user.username, 'queued');
    }
    $scope.getTasks = function(filter, value, holder) {
        $http.get('http://localhost:8888/api/runtime/tasks?size=1000&' + filter + '=' + value).then(function(response) {
            if(holder == 'assigned') {
                $scope.assignedTasks = response.data.data;
            }
            if(holder == 'queued') {
                $scope.queuedTasks = response.data.data;
            }
        }, function(response) {
            $scope.message = "Could not fetch tasks";
        });
    }
    $scope.complete = function(variables) {
        $http.post('http://localhost:8888/api/runtime/tasks/' + $scope.selected.id, {action: "complete", variables: variables}).then(function(response) {
            $scope.refresh();
        }, function(response) {
            $scope.message = "Failed to complete the task";
        });
    }
    $scope.openTask = function(task) {
        $scope.selected = task;
        $http.get('http://localhost:8888/api/runtime/process-instances/' + task.processInstanceId + '/variables/form').then(function(response){
            $scope.selectedData = JSON.parse(response.data.value);
        },function(response) {
            $scope.message = "Failed to fetch application forms";
        });
        if(task.taskDefinitionKey == 'decision') {
            $http.get('http://localhost:8888/api/runtime/process-instances/' + task.processInstanceId + '/variables/report').then(function(response){
                $scope.report = response.data.value;
            },function(response) {
                $scope.message = "Failed to fetch ALC's report";
            });
        }
    }
    $scope.claimTask = function(task) {
        $http.post('http://localhost:8888/api/runtime/tasks/' + task.id, {action: "claim", assignee: $scope.user.username}).then(function(response) {
            $scope.refresh();
        }, function(response) {
            $scope.message = "Failed to claim the task";
        });
    }
    $scope.completeScrutiny = function(value) {
        var variables = [{name: "hasDiscrepancy", type: "boolean", value: value}];
        $scope.complete(variables);
    }
    $scope.completeReport = function() {
        var variables = [{name: "report", type: "string", value: $scope.report}];
        $scope.complete(variables);
    }
    $scope.completeApproval = function(value) {
        var variables = [{name: "accepted", type: "boolean", value: value}];
        $scope.complete(variables);
    }
})
