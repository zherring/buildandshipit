'use strict';

app.controller('reportControllerD3', ['$rootScope', '$scope', '$timeout', '$swipe', '$location', 'StorageService', function($rootScope, $scope, $timeout, $swipe, $location, storage){
    $rootScope.viewClass = 'report';
    $scope.init();
    var dateFormat = d3.time.format("%m/%d/%Y");

    var getTileDataForReport = function(){
        var data = [];
        _.each($scope.tiles, function(item){
            var tile_data = $scope.getTileData($scope.currentSetKey, item.tid);
            if(_.isNull(tile_data)) {
                //continue;
            }
            _.each(tile_data, function(temp_data){
                temp_data.tid = item.tid;
                temp_data.dd = new Date(temp_data.d);
                data.push(temp_data);
            });
        });
        return data;
    };

    $scope.reportData = getTileDataForReport();
    /*
    count: bar graph (total by day), line chart
    quota: bar graph (total by day) red line as goal, line chart
    binary: pie chart, up down bar graph total by day, dual line chart
    scale: bar graph total by day, line chart
    */
    var xMin = d3.min($scope.reportData, function(d){ return Math.min(d.dd); });
    var xMax = d3.max($scope.reportData, function(d){ return Math.max(d.dd); });
    $scope.xScale = d3.time.scale()
    .domain([xMin, xMax]);
    /*var yMin = d3.min(sample2, function(d){ return Math.min(d.low); });
    var yMax = d3.max(sample2, function(d){ return Math.max(d.high); });*/

    ndx = crossfilter($scope.reportData);
    $scope.dayDimension = ndx.dimension(function(d) {
        return d3.time.hour(d.dd);
    });
    // console.log($scope.dayDimension.group().top(Number.POSITIVE_INFINITY));
    $scope.dayGroup = $scope.dayDimension.group().reduceCount();
    $scope.tileDimension = ndx.dimension(function(d) {return d.tid;});
    $scope.tileGroup = $scope.tileDimension.group();
}]);
