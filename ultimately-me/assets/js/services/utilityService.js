'use strict';

app.factory('UtilityService', ['$rootScope', function($rootScope){

    var _keyCharList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var randomString = function(len, chars){
        var result = '';
        for (var i = len; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };

    var createUuid = function(){
        return randomString(12, _keyCharList) + '-' + randomString(12, _keyCharList);
    };

    var randomColor = function(sample){
        sample = sample || $rootScope.colors;
        return _.sample(sample);
    };

    var numbersArray = function(num, math){
        if(!math) {math = 0;}
        return new Array(num + math);
    };

    var swipe = function(step, selector) {
        step = step || 1;
        selector = selector || '.swiper';

        var dirProp = function(direction, hProp, vProp) {
            return (direction && Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
        };

        var HammerCarousel = function(container, direction) {
            this.container = container;
            this.direction = direction;
            this.panes = Array.prototype.slice.call(this.container.children, 0);
            this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];
            this.currentIndex = step-1;
            this.hammer = new Hammer.Manager(this.container);
            // this.hammer.add(new Hammer.Pan({ direction: this.direction, threshold: 10 }));
            // this.hammer.add(new Hammer.Pan());
            this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(_.throttle(this.onPan, 100), this));
            this.show(this.currentIndex);
        };

        HammerCarousel.prototype = {
            show: function (showIndex, percent) {
                showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
                percent = percent || 0;

                var paneIndex, pos, translate;

                for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
                    pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
                    translate = 'translate3d(' + pos + 'px, 0, 0)';
                    this.panes[paneIndex].style.transform = translate;
                    this.panes[paneIndex].style.mozTransform = translate;
                    this.panes[paneIndex].style.webkitTransform = translate;
                }

                this.currentIndex = showIndex;
            },

            onPan: function (ev) {
                var delta = dirProp(this.direction, ev.deltaX, ev.deltaY);
                var percent = (100 / this.containerSize) * delta;

                if (ev.type === 'panend' || ev.type === 'pancancel') {
                    if (Math.abs(percent) > 20 && ev.type === 'panend') {
                        this.currentIndex += (percent < 0) ? 1 : -1;
                    }
                    percent = 0;
                }

                this.show(this.currentIndex, percent);
            }
        };

        var outer = new HammerCarousel(window.document.querySelector(selector), Hammer.DIRECTION_HORIZONTAL);
        return outer;
    };

    var deviceReady = function(fn){
        if (typeof window.cordova === 'object') {
            document.addEventListener('deviceready', function () {
                fn();
            }, false);
        } else {
            fn();
        }
    };

    var deviceResume = function(fn){
        if (typeof window.cordova === 'object') {
            deviceReady(function() {
                document.addEventListener('resume', function() {
                    fn();
                }, false);
            });
        } else {
            // fn();
        }
    };

    var devicePause = function(fn){
        if (typeof window.cordova === 'object') {
            deviceReady(function() {
                document.addEventListener('pause', function() {
                    fn();
                }, false);
            });
        } else {
            fn();
        }
    };

    return {
        deviceReady: deviceReady,
        devicePause: devicePause,
        deviceResume: deviceResume,
        createUuid: createUuid,
        randomString: randomString,
        randomColor: randomColor,
        numbersArray: numbersArray,
        swipe: swipe
    };

}]);
