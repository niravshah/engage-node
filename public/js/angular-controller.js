var phonecatApp = angular.module('phonecatApp', ["checklist-model"]);
phonecatApp.controller('PhoneListCtrl', function($rootScope, $http) {
    $rootScope.lnattrs = [];
    $rootScope.items = [];
    $rootScope.selected = {
        items: []
    };
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
    $rootScope.reloadData = function() {
        $rootScope.$emit('updateData');
    }
    $rootScope.printSelected = function() {
        //console.log($rootScope.selected);
    }
    $rootScope.$on('lnattrsprint',function(event,data){ 
       console.log($rootScope.lnattrs);
    });
    $rootScope.addArticlesAndSend = function() {
        console.log('Inside Add Article Send');
        var merge_vars = [];
        var x = 0;
        for(var i = 0; i < $rootScope.selected.items.length; i++) {
            merge_vars.push({
                'name': 'a' + i,
                'content': true
            });
            merge_vars.push({
                'name': 't' + i,
                'content': $rootScope.selected.items[i].resolved_title
            });
            merge_vars.push({
                'name': 'd' + i,
                'content': $rootScope.selected.items[i].excerpt
            });
            merge_vars.push({
                'name': 'l' + i,
                'content': $rootScope.selected.items[i].resolved_url
            });
            if($rootScope.selected.items[i].has_image == 1) {
                merge_vars.push({
                    'name': 'i' + i,
                    'content': $rootScope.selected.items[i].image.src
                });
            } else {
                merge_vars.push({
                    'name': 'i' + i,
                    'content': ''
                });
            }
        }
        for(var i = 0; i < $rootScope.lnattrs.length; i++) {
             merge_vars.push({
                'name': 'a' + i,
                'content': true
            });
        }
        
        $http.post('/add-articles-send', {
            'merge_vars': merge_vars
        }).success(function() {
            $rootScope.$broadcast('updateData');
        }).error(function(err) {
            console.log(err);
        });
    }
    $rootScope.addToPocket = function() {
        $http.post('/pocket-add', {
            'articleUrl': $('#url')[0].value
        }).success(function() {
            $rootScope.$broadcast('updateData');
        });
    }
});