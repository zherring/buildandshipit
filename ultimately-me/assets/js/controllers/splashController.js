'use strict';

app.controller('splashController', ['$rootScope', '$scope', '$templateCache', '$http', '$timeout', '$interval', '$document', 'AccountService', 'UtilityService', function($rootScope, $scope, $templateCache, $http, $timeout, $interval, $document, account, utils){

    $scope.color = utils.randomColor([1,2,3,4,5,6,7,8]);

    var splashIcons = ['thumbs-o-up', 'rocket', 'thumbs-o-up', 'check', 'smile-o','thumbs-o-up', 'rocket', 'check-circle', 'smile-o'];

    var rand = _.random(0, splashIcons.length-1);
    $scope.splashIcon = splashIcons[rand];

    var templates = [
        'assets/graphics/ico-um-logo.svg',

        'views/tutorial.html',
        'views/main.html',
        'views/tile-add.html',
        'views/tile-edit.html',
        'views/report.html',
        'views/report-details.html',
        'views/archive.html',
        'views/account.html',

        'views/partials/tiles/general-tools.html',
        'views/partials/tiles/count.html',
        'views/partials/tiles/binary.html',
        'views/partials/tiles/in-archive.html',
        'views/partials/tiles/quota.html',
        'views/partials/tiles/scale.html',

        'views/partials/tile-settings/for-binary.html',
        'views/partials/tile-settings/for-count.html',
        'views/partials/tile-settings/for-quota.html',
        'views/partials/tile-settings/for-scale.html',
        'views/partials/tile-settings/general-colors.html',
        'views/partials/tile-settings/general-timebox.html',
        'views/partials/tile-settings/general-timestamp.html',

        'views/partials/reports/tile-binary.html',
        'views/partials/reports/tile-count.html',
        'views/partials/reports/tile-quota.html',
        'views/partials/reports/tile-scale.html',
        'views/partials/charts/chart-bars.html',
        'views/partials/charts/chart-line.html',
        'views/partials/charts/chart-stacked.html',
        'views/partials/charts/chart-units.html',

        'views/partials/reports/detail-binary.html',
        'views/partials/reports/detail-count.html',
        'views/partials/reports/detail-quota.html',
        'views/partials/reports/detail-scale.html',
        'views/partials/charts/detail-chart-bars.html',
        'views/partials/charts/detail-chart-line.html',
        'views/partials/charts/detail-chart-stacked.html',
        'views/partials/charts/detail-chart-units.html'
    ];

    var lockAndLoad = function(){
        var totalTemplates = templates.length;
        var t = 1;

        if(navigator && navigator.splashscreen) {
            navigator.splashscreen.hide();
        }

        $scope.progressAxis = 'width';
        $scope.message = 'Counting things...';
        $scope.progress = 0;

        _.each(templates, function(template, i){
            $timeout(function(){
                $scope.progress = Math.floor((t / totalTemplates) * 100);
                $http.get(template, {cache:$templateCache});
                t++;
            }, 80 * i);
        });

        $scope.$watch('progress', function(n){
            if(n === 100 && $scope.view === 'splash') {
                $scope.message = '';
                $timeout(function(){
                    if(_.isUndefined($scope.preferences.tutorial)) {
                        $rootScope.goTo('/tutorial');
                    } else {
                        $rootScope.goTo('/main');
                    }

                }, 2500);
            }
        });
    };

    $scope.init();

    utils.deviceReady(lockAndLoad);

}]);
