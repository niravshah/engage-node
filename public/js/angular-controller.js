var phonecatApp = angular.module('phonecatApp', ["checklist-model"]);

phonecatApp.controller('PhoneListCtrl', function($rootScope, $http) {
    $rootScope.items = [];
    $rootScope.selected={items:[]};
    $rootScope.$on('updateData', function(event, data) {
        console.log('Event Recieved - Update Data');
        $http.get('/pocket-get').success(function(data) {
            var arr = [];
            for(var i in data.list) {
                arr.push(data.list[i])
            }
            arr.sort(function(x, y) {
                return y.time_added - x.time_added;
            })
            $rootScope.items = arr;
        });
    });
    $rootScope.reloadData = function(){
        $rootScope.$emit('updateData');
    }
    $rootScope.printSelected = function(){
        console.log($rootScope.selected);
    }
});

phonecatApp.controller('PocketAddCtrl', function($rootScope, $http) {
    $rootScope.addToPocket = function() {
        $http.post('/pocket-add', {
            'articleUrl': $('#url')[0].value
        }).success(function() {
            $rootScope.$broadcast('updateData');
        });
    }
});

phonecatApp.controller('PocketAuthCtrl', function($scope, $http) {
    /*$scope.$apply(function() {
            for(var i in data) {
                $scope.items.push({
                    'item_id': data[i].item_id,
                    'resolved_title': data[i].resolved_title
                });
            }
        })*/
});