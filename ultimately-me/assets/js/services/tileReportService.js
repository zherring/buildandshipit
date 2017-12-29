'use strict';

app.factory('TileReportService', ['$rootScope', 'StorageService', 'AccountService', 'TileService', function($rootScope, storage, account, tiles){

    var report = [],
        a1 = [],
        a2 = [];

    var _getTileChartType = function(tile, charts){
        var pref = _.findWhere(charts, {tid: tile.tid});
        return (pref && pref.chart ? pref.chart : tile.type);
    };

    // var _rotateDegree = function(start, end, precision){
    //     precision = precision || 1;
    //     var theta = Math.atan2(end.y - start.y, end.x - start.x);
    //     // deg = deg < 0 ? deg + -15 : deg + (deg === 180 ? 0 : 15);
    //     return parseFloat((theta * 180 / Math.PI).toFixed(precision)); // radians to degrees
    // };

    // var _lineLength = function(start, end, precision) {
    //     var x = 0;
    //     var y = 0;
    //     var l = 0;
    //
    //     precision = precision || 1;
    //
    //     x = end.x - start.x;
    //     x = x * x;
    //
    //     y = end.y - start.y;
    //     y = y * y;
    //
    //     l = Math.sqrt(x + y).toFixed(precision);
    //
    //     return parseFloat(l/Math.PI).toFixed(precision);
    // };

    var switchCharts = function(tile, next) {
        var chart = tile._chart;
        var charts = $rootScope.tileTypes[tile.type].charts;
        var index = _.indexOf(charts, chart);
        chart =
            next ? ((index < charts.length - 1) ? charts[index + 1] : _.first(charts))
            : ((index > 0) ? charts[index - 1] : _.last(charts));
        return chart;
    };

    var hitMe = function(primer, data, map){
        if(data.length) {
            var hit = _.find(map, function(num){
                if(parseInt(primer) === parseInt(num)) {
                    return _.find(data, function(item){
                        if(parseInt(primer) === parseInt(item.a)) {
                            return true;
                        }
                        return false;
                    });
                }
            });
            return (!_.isUndefined(hit) ? true : false);
        }
    };

    // var mapDaysData = function(tileData, daysBack){
    //     var start = moment().startOf('day').valueOf(); // unix timestamp with milliseconds
    //     var day = 0;
    //     var data = [];
    //
    //     _.each(tileData,function(answer){
    //         day = findDay(answer.d, start, day, daysBack);
    //         if(day > daysBack){
    //             return data;
    //         }
    //         if(_.isUndefined(data[day])){
    //             data[day] = [];
    //         }
    //         data[day].push(answer);
    //     });
    //     return data;
    // };
    //
    // var findDay = function(timestamp, start, day, daysBack){
    //     var microsecday = 86400000;
    //     if(day > daysBack){
    //         return day;//This is basically the stop call so we dont keep recursing
    //     }
    //     if(timestamp >= start){
    //         return day;
    //     }
    //     else {//timestamp < start
    //         var nextStart = start - ((day+1) * microsecday);
    //         return findDay(timestamp, nextStart, day + 1, daysBack);
    //     }
    // };

    var renderSingleChart = function(tile, tileSetKey, tileSetPreferences, duration){
        // setup some things
        duration = duration || 'week';
        var id = tile.tid,
            tileData = tiles.getAllTileData(tileSetKey, true),
            days = $rootScope.reportDayRange[duration],
            outerRange = [],
            cap = 0;

// window.console.log(duration);
        report[id] = {data: [], day: [], avg: []};
        a1[id] = [];
        a2[id] = [];

        // assign chart type from tileSetPreferences
        // or default based on tile type
        tile._chart = _getTileChartType(tile, tileSetPreferences.charts);

        // PRE-DURATION LOOP
        tile._scale = tile.type === 4 ? tile.scale : 2; // 2 = 0-10

        // report[id].data = mapDaysData(tileData[id], Math.abs(_.min(days)));

        _.each(days, function(day){
            var dayMoment = moment().add(day, 'days'),
                a = 0,
                b = 0,
                sum = 0,
                avg = 0,
                pct = 0,
                min = 0,
                max = 0,
                span = 0,
                spanTop = 0,
                spanBottom = 0,
                temp = [],
                innerRange = [];

            report[id].day[day] = {
                num: parseInt(dayMoment.format('D')),
                name: (day+1 === 1 ? 'today' : dayMoment.format('ddd'))
            };

            // filter down the amount of data in the report
            report[id].data[day] = _.filter(tileData[id], function(data){
                return data.d >= dayMoment.startOf('day') && data.d <= dayMoment.endOf('day');
            });

            // window.console.log(report[id].data[day]);

            // process answerable data objects differently (binary/question)
            if(tile.type === 3) {
                a = _.where(report[id].data[day], {a: 1}).length;
                b = _.where(report[id].data[day], {a: -1}).length;
                report[id].data[day].a = a;
                report[id].data[day].b = b;
                a1[id].push(a);
                a2[id].push(b);
                temp.push((a > b ? a : b));
                cap = _.max(temp);
                a = cap > 0 ? parseFloat((a/cap).toFixed(2)) : 0;
                b = cap > 0 ? parseFloat((b/cap).toFixed(2)) : 0;
                // report[id].data[day].aFade = a > 0 && a < 0.1 ? 0.1 : a;
                // report[id].data[day].bFade = b > 0 && b < 0.1 ? 0.1 : b;
            }

            // process answerable data objects differently (scale/slider)
            else if(tile.type === 4) {
                temp[day] = [];
                _.each(report[id].data[day], function(data){
                    temp[day].push(parseInt(data.a));
                });
                a = temp[day].length ? _.max(temp[day]) : 0;
                b = temp[day].length ? _.min(temp[day]) : 0;
                report[id].data[day].a = a;
                report[id].data[day].b = b;
            }

            // fabricate answerable data objects (count, quota, others)
            else {
                a = report[id].data[day].length;
                b = 0;
                report[id].data[day].a = a;
                report[id].data[day].b = b;
            }

            outerRange.push(a,b);
            innerRange = [a, b];

            sum = 0;
            _.each(report[id].data[day], function(data){
                if(data.a) {
                    sum += parseInt(data.a);
                }
            });

            avg = sum / report[id].data[day].length || 0;
            avg = tile._scale === 1 ? avg+5 : avg;
            pct = parseFloat((avg*0.90909*11).toFixed(2)); // 10 ÷ 11
            max = _.max(innerRange);
            min = _.min(innerRange);

            span = parseInt(max - min); //sum > 0 ? parseInt(max - min) : 0;
            spanTop = ($rootScope.scaleTypes[tile._scale].max - max);

            if(tile._scale === 1) {
                spanBottom = Math.abs((min - $rootScope.scaleTypes[tile._scale].min));
            } else {
                spanBottom = ($rootScope.scaleTypes[tile._scale].min + min);
            }

            // window.console.log(sum, 'span', spanTop, span, spanBottom);

            report[id].day[day].max = max;
            report[id].day[day].min = min;
            report[id].day[day].pct = pct;
            report[id].day[day].sum = sum;
            report[id].day[day].deg = 0; // temp
            report[id].day[day].span = span;
            report[id].day[day].spanTop = spanTop;
            report[id].day[day].spanBottom = spanBottom;

            report[id].avg[day] = parseFloat(avg.toFixed(2));

        });
        // window.console.log('report', report[id]);
        // END DAY LOOP

        // _.each($rootScope.reportDayRange[duration], function(day){
        //     var avg = report[id].avg[day];
        //     var prevDay = Math.abs(day-1);
        //     var prevAvg = report[id].avg[day-1] ? report[id].avg[day-1] : 0;
        //     var e = {x: day, y: avg};
        //     var s = {x: prevDay, y: prevAvg};
        //     var deg = _rotateDegree(s, e);
        //     // window.console.log('deg', tile.name, deg);
        //     report[id].day[day].deg = deg;
        //     report[id].day[day].w = deg === 180 ? 1 : _lineLength(s, e);
        // });

        // POST-DURATION LOOP
        tile._cap = parseFloat(_.max(outerRange));
        tile._base = parseFloat(_.min(outerRange));
        tile._quota = tile.type === 2 ? parseInt(tile.quota) : (tile.type === 1 && tile._cap < 10 ? 10 : tile._cap);
        tile._axis = tile.type === 2 ? tile.axis : 'up';

        // line labels
        report[id].data.lines = {
            start: (tile.type === 4 ? $rootScope.scaleTypes[tile._scale].start : 0),
            min: (tile.type === 4 ? $rootScope.scaleTypes[tile._scale].min : tile._base),
            max: (tile.type === 4 ? $rootScope.scaleTypes[tile._scale].max : (tile._cap > tile._quota ? tile._cap : tile._quota))
        };

        report[id].data.over = tile._cap - tile._quota < 0 ? 0 : tile._cap - tile._quota;
        report[id].data.a = tile.type === 3 ? a1[id].reduce(function(memo, num){ return memo + num; }) : tile._cap;
        report[id].data.b = tile.type === 3 ? a2[id].reduce(function(memo, num){ return memo + num; }) : tile._base;
        report[id].data.max = tile.type === 3 ? _.max([_.max(a1[id]), _.max(a2[id])]) : (tile._cap > tile._quota ? ((tile._cap - tile._quota)*50/tile._quota).toFixed(2) : 0);

        $rootScope.report = report;
        // window.console.log('\n');
        return report[id];

    };

    var renderAllCharts = function(tiles, tileSetKey, tileSetPreferences, duration){
        var charts = _.each(tiles, function(tile){
            return renderSingleChart(tile, tileSetKey, tileSetPreferences, duration);
        });
        // window.console.log(charts);
        return charts;
    };

    // =====================================================================
    // RETURN TileReportService API
    // =====================================================================
    return {
        switchCharts: switchCharts,
        hitMe: hitMe,
        renderSingleChart: renderSingleChart,
        renderAllCharts: renderAllCharts
    };

}]);
