/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('displayService', function ($http) {

            var caseInfo;
            var caseInfoGrid;

            var promise = $http.get('conf/display.json')
                    .
                    success(function (data, status) {
                        caseInfo = data.case_info;
                        caseInfoGrid = data.case_info_grid;
                    }).
                    error(function (data, status) {
                        alert("failed to load display config doc");
                    });

            return {
                promise: promise,
                getCaseInfoFields: function () {
                    return caseInfo;
                },
                getCaseInfoFieldsGrid: function () {
                    return caseInfoGrid;
                }
            };
        });