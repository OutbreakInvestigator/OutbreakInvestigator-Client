/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('chartService', function ($http) {
            var chartsConfData;

            var promise = 
                   $http.get('conf/charts.json')
                            .
                            success(function (data, status) {
                                chartsConfData = data.allCharts;
                               
                            }).
                            error(function (data, status) {
                                alert("failed to load charts data");
                            });
                    
                   

            return {
                promise: promise,
                getChartsConf: function () {
                    return chartsConfData;
                } 
            };
        });