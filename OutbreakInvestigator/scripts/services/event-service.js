/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
    .service('eventService', function ($rootScope) {
        var ui_mode = "select";
        var left_filter;
        var right_filter;
        var currFilterSel = "linkedFilterSel";
        var selCases = [];

        return {
            getUIMode: function () {
                return ui_mode;
            },
            setUIMode: function (inMode) {
                ui_mode = inMode;
                //console.log("selected UI mode: "+ui_mode);
            },
             getLeftFilter: function () {
                return left_filter;
            },
            /*
            setLeftFilter: function (inFilter) {
                left_filter = inFilter;
                $rootScope.$broadcast('leftFilterUpdate', left_filter);
            },
            */
            getRightFilter: function () {
                return right_filter;
            },
            /*
            setRightFilter: function (inFilter) {
                right_filter = inFilter;
                $rootScope.$broadcast('rightFilterUpdate', right_filter);
            },
            */
            setFilter: function (inFilter, requestModuleID) {
                if(currFilterSel=="leftFilterSel")
                {
                    left_filter = inFilter;
                    $rootScope.$broadcast('leftFilterUpdate', left_filter);
                }
                else if(currFilterSel=="rightFilterSel")
                {
                    right_filter = inFilter;
                    $rootScope.$broadcast('rightFilterUpdate', right_filter);
                }
                else if(currFilterSel=="linkedFilterSel")
                {
                    left_filter = inFilter;
                    $rootScope.$broadcast('leftFilterUpdate', left_filter);
                    right_filter = inFilter;
                    $rootScope.$broadcast('rightFilterUpdate', right_filter);
                }
                //rebroadcastFilters();
            },
            setFilterSel: function (inFilterSel) {
                var returnFilter;

                // equate filters if necessary
                if(inFilterSel=='linkedFilterSel')
                {
                    // determine current selection in case of "linked" selection
                    if(currFilterSel=='rightFilterSel')
                    {
                        returnFilter = right_filter;
                        left_filter = right_filter;
                    }
                    else
                    {
                        returnFilter = left_filter;
                        right_filter = left_filter;
                    }
                }

                currFilterSel = inFilterSel;

                if(inFilterSel=='rightFilterSel')
                {
                    returnFilter = right_filter;
                }
                else if(inFilterSel=='leftFilterSel')
                {
                    returnFilter = left_filter;
                }

                //rebroadcastFilters();
                return returnFilter;
            },
            getSelCases: function () {
                return selCases;
            },
            setSelCases: function (inCases, requestModuleID) {
                selCases = inCases;
                $rootScope.$broadcast('selCasesUpdate', selCases, requestModuleID);
            },
            rebroadcastFilters: function() {
                if(currFilterSel=='leftFilterSel')
                    $rootScope.$broadcast('leftFilterUpdate', left_filter);
                else if(currFilterSel=='rightFilterSel')
                    $rootScope.$broadcast('rightFilterUpdate', right_filter);
                else
                {
                    $rootScope.$broadcast('leftFilterUpdate', left_filter);
                    $rootScope.$broadcast('rightFilterUpdate', right_filter);
                }
            },
            rebroadcastSelCases: function() {
                $rootScope.$broadcast('selCasesUpdate', selCases);
            },
            rebroadcastResetUI: function() {
                console.log('resetting');
                selCases = [];
                $rootScope.$broadcast('resetUI');
            }
        };
    });
