'use strict';

app.controller('reportDetailsController', ['$rootScope', '$scope', '$routeParams', '$location', 'TileService', 'TileReportService', function($rootScope, $scope, $routeParams, $location, tiles, reports){
    // $rootScope.viewClass = 'report-details';
    if(!$routeParams.tid) {
        $rootScope.goTo('/report');
    }

    $scope.init();

    $scope.sliderLegends = [];

    $scope.sliderLegends[1] = _.range($rootScope.scaleTypes[1].min, $rootScope.scaleTypes[1].max + 1).reverse();
    $scope.sliderLegends[2] = _.range($rootScope.scaleTypes[2].min, $rootScope.scaleTypes[2].max + 1).reverse();

    var tileId = parseInt($routeParams.tid);
    var index = _.findIndex($scope.tiles, function(tile){
        return tile.tid === tileId;
    });

    $scope.tileInFocus = $scope.tiles[index];
    $scope.tileReport = reports.renderSingleChart($scope.tileInFocus, $scope.currentSetKey, $scope.tileSetPreferences, 'month');
    // window.console.log($scope.tileReport.data);

    $scope.hitMe = function(primer, data, map){
        return reports.hitMe(primer, data, map);
    };

    $scope.dayClasses = function(d, day, data){
        var classes = [];
        if(d+1 === 1) {
            classes.push('today');
        }
        if(d % 7 === 0) {
            classes.push('weekline');
        }
        if(day && parseInt(day.num) === 1) {
            classes.push('monthline');
        }
        if(data && data.length) {
            classes.push('hit');
        }
        return classes.join(' ');
    };

}]);
