/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
    .service('timelineService', function ($rootScope) {
        var timeline;
        var brush;
        var inactive_brush;

        return {
            getTimeline: function () {
                return timeline;
            },
            setTimeline: function (inTimeline)
            {
                timeline = inTimeline;
            },
            getBrush: function () {
                return brush;
            },
            setBrush: function (inBrush) {
                brush = inBrush;
            },
            getInactiveBrush: function () {
                return inactive_brush;
            },
            setInactiveBrush: function (inBrush) {
                inactive_brush = inBrush;
            }
        };
    });
