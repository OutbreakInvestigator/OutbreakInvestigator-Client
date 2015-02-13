/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('choroplethService', function ($http) {
            var geojsonZip;

            var promise = 
                    $http.get("data/KC_zip2010.geo.json").success(function (data, status) {
                                 geojsonZip = data;
                                 
                            }).
                    error(function (data, status) {
                        alert("failed to load geo json data");
                    });
                    
                   

            return {
                promise: promise,
                getGeoJson: function () {
                    return geojsonZip;
                } 
            };
        });