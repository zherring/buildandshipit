'use strict';

app.controller('reportController', ['$rootScope', '$scope', '$timeout', 'TileService', 'TileReportService', function($rootScope, $scope, $timeout, tiles, reports){
    $scope.init();

    $scope.sliderLegends = [];
    // $scope.tileInFocus = null;

    $scope.sliderLegends[1] = _.range($rootScope.scaleTypes[1].min, $rootScope.scaleTypes[1].max + 1).reverse();
    $scope.sliderLegends[2] = _.range($rootScope.scaleTypes[2].min, $rootScope.scaleTypes[2].max + 1).reverse();

    // $timeout(function(){
        reports.renderAllCharts($scope.tiles, $scope.currentSetKey, $scope.tileSetPreferences, 'week');
    // }, 1000);

    // $scope.loadReport = function(tile){
    //     $scope.tileInFocus = angular.copy(tile);
    //     $scope.tileReport = reports.renderSingleChart(tile, $scope.currentSetKey, $scope.tileSetPreferences, 'month');
    //     window.console.log($scope.tileInFocus, $scope.tileReport);
    // };
    //
    // $scope.unloadReport = function(){
    //     $scope.tileInFocus = null;
    // };

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

    // CHART SWITCHING
    var _processTilePref = function(tile, next){
        tile._chart = reports.switchCharts(tile, next);
        var charts = $scope.tileSetPreferences.charts;
        var data = _.findWhere(charts, {tid: tile.tid});

        if(data) {
            data.chart = tile._chart;
        } else {
            charts.push({tid: tile.tid, chart: tile._chart});
        }

        tiles.updateTileSetPreference($scope.currentSetKey, 'charts', charts);
        $scope.tileSetPreferences = tiles.getTileSetPreferences($scope.currentSetKey);
        reports.renderSingleChart(tile, $scope.currentSetKey, $scope.tileSetPreferences, 'week');
    };

    $scope.nextChartType = function(tile){
        _processTilePref(tile, true);
    };

    $scope.prevChartType = function(tile){
        _processTilePref(tile, false);
    };

}]);
