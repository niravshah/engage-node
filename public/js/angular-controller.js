var phonecatApp = angular.module('phonecatApp', ["checklist-model", "ui.bootstrap"]);
phonecatApp.controller('PhoneListCtrl', function($rootScope, $http) {
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
    $rootScope.addToPocket = function() {
        $http.post('/pocket-add', {
            'articleUrl': $('#url')[0].value
        }).success(function() {
            $rootScope.$broadcast('updateData');
        });
    }
});
phonecatApp.controller('ChartJsCtrl', function($rootScope, $http) {
    $rootScope.trends = ["AngularJS", "NodeJS"]
    $rootScope.sizes = [60, 40]
    $rootScope.drawGraphs = function() {
        for(i in $rootScope.trends) {
            $rootScope.createGraph($rootScope.sizes[i], $rootScope.sizes[i] + "%", $rootScope.trends[i], i * 100);
        }
    }
    $rootScope.createGraph = function(trendSize, trendText, trendName, xOffset) {
        var data = [];
        data.push({
            value: trendSize,
            color: "#F7464A"
        });
        data.push({
            value: 100 - trendSize,
            color: "Grey"
        });
        var canvas = $('#working-canvas')[0];
        var context = canvas.getContext("2d");
        new Chart(context).Doughnut(data, {
            animation: false
        });
        context.font = '12pt Calibri';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'grey';
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        context.fillText(trendText, x, y);
        var pcanvas = $('#final-canvas')[0];
        var pcontext = pcanvas.getContext("2d");
        pcontext.font = '12pt Calibri';
        pcontext.textAlign = 'center';
        pcontext.fillStyle = '#F7464A';
        pcontext.clearRect(xOffset, 0, 100, 150);
        pcontext.fillText(trendName, canvas.width / 2 + xOffset, canvas.height + 20);
        pcontext.drawImage(canvas, xOffset, 0);
    }
});
phonecatApp.controller('LinkedInCtrl', function($rootScope, $http) {
    $rootScope.lnattrs = {};
    $rootScope.$on('lnattrsprint', function(event, data) {
        console.log($rootScope.lnattrs);
    });
});
phonecatApp.controller('NewsletterCampaignCtrl', function($rootScope, $http) {
    $rootScope.accountCampaign = {};
    $rootScope.logoImg = {};
    $rootScope.accountCampaign.account = 'Javascript Ninja';
    $rootScope.accountCampaign.campaign = 'New Campaign';
    $rootScope.imgs = [{
        id: 1,
        url: "icons/airplane.png"
    }, {
        id: 2,
        url: "icons/analytics.png"
    }, {
        id: 3,
        url: "icons/android.png"
    }, {
        id: 4,
        url: "icons/archive.png"
    }, {
        id: 5,
        url: "icons/baloons.png"
    }, {
        id: 6,
        url: "icons/beacon.png"
    }, {
        id: 7,
        url: "icons/blueprints.png"
    }, {
        id: 8,
        url: "icons/book.png"
    }, {
        id: 9,
        url: "icons/brain.png"
    }, {
        id: 10,
        url: "icons/briefcase.png"
    }, {
        id: 11,
        url: "icons/brochure.png"
    }, {
        id: 12,
        url: "icons/browser.png"
    }, {
        id: 13,
        url: "icons/bulb.png"
    }];
    $rootScope.slickSelected = 1
    $rootScope.slickClicked = function(id) {
        $rootScope.slickSelected = id;
    }
});
phonecatApp.controller('AccordionCtrl', function($scope) {
    $scope.oneAtATime = true;
    $scope.status = {
        open: true,
        isFirstOpen: true,
        isFirstDisabled: false
    };
});
phonecatApp.controller('FinalSendCtrl', function($rootScope) {
    $rootScope.finalSend = function() {
        console.log('Final Send');
        console.log($rootScope.logoImg);
        var data = {};
        data.account = $rootScope.accountCampaign.account;
        data.campaign = $rootScope.accountCampaign.campaign;
        data.imgBase64 = $('#final-canvas')[0].toDataURL("image/png");
        var lnatt = []
        for(var key in $rootScope.lnattrs) {
            $rootScope.addNameValPairs(lnatt, key, $rootScope.lnattrs[key]);
        }
        data.lnattrs = lnatt;
        var content = [];
        for(var i = 0; i < $rootScope.selected.items.length; i++) {
            var art = [];
            $rootScope.addNameValPairs(art, 'a' + i, true);
            $rootScope.addNameValPairs(art, 't' + i, $rootScope.selected.items[i].resolved_title);
            $rootScope.addNameValPairs(art, 'd' + i, $rootScope.selected.items[i].excerpt);
            $rootScope.addNameValPairs(art, 'l' + i, $rootScope.selected.items[i].resolved_url);
            if($rootScope.selected.items[i].has_image == 1) {
                $rootScope.addNameValPairs(art, 'i' + i, $rootScope.selected.items[i].image.src);
            } else {
                $rootScope.addNameValPairs(art, 'i' + i, null);
            }
            $rootScope.addNameValPairs(content, i, art);
        }
        data.content = content;
        data.logoImage = $('#target').attr('src');
        if(data.logoImage == undefined) {
            for(img in $rootScope.imgs) {
                if($rootScope.imgs[img].id == $rootScope.slickSelected) {
                    data.logoImageUrl = $rootScope.imgs[img].url;
                }
            }
        }
        console.log(data);
        $.ajax({
            type: "POST",
            url: "/final-send",
            data: {
                'data': data
            }
        });
    }
    $rootScope.addNameValPairs = function(arr, name, val) {
        arr.push({
            'name': name,
            'content': val
        });
    }
});