/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .factory("customFilter", function ($timeout, filterService)
        {


            var customFilter = {};
            var filters = [];
            var availableSelectItems = {};
            var availableFilters = filterService.getAllFilters().sort();
            customFilter.add = function (name)
            {
                if (!jQuery.isEmptyObject(name))
                {
                    var fType = filterService.getFilterType(name);
                    filters.push({
                        //id: filters.length + 1,
                        title: name,
                        type: fType
                    });
                    availableSelectItems[name] = filterService.getAllFilterValues(name);
                    availableFilters.splice($.inArray(name, availableFilters), 1).sort();
                    $timeout(function () {
                        customFilter.show(name, filters.length - 1, fType);
                    });
                }
            };
            customFilter.show = function (name, index, type)
            {
                $("#filter-" + name + '-message').hide();
                // if (filters[index].type !== type)
                {
                    $("#filter-" + name + '-multiselect').hide();
                    $("#filter-" + name + '-radio').hide();
                    $("#filter-" + name + '-slider').hide();
                    $("#filter-" + name + '-' + type).show();
                    filters[index].type = type;
                }

                if (type === 'slider')
                {
                    $("#filter-" + name + '-slider').show();
                    var min = Math.min.apply(null, filterService.getAllFilterValues(name));
                    var max = Math.max.apply(null, filterService.getAllFilterValues(name));
                    $("#filter-" + name).val(min + " - " + max);
                    $("#filter-" + name + '-range').slider({
                        range: true,
                        min: min,
                        max: max,
                        values: [min, max],
                        stop: function (event, ui) {
                            $("#filter-" + name).val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
                            filterService.updateFilter(name, ui.values[ 0 ], ui.values[ 1 ], null);
                        }

                    });
                }
            };
            customFilter.checkNumeric = function (name)
            {
                if (!customFilter.isNumeric(name))
                {
                    $("#filter-" + name + '-message')[0].innerHTML = '<span   class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"> </span> ' +
                            "<strong> Range Slider only supports numeric data  </strong> ";

                    $("#filter-" + name + '-message').show();
                }
            };


            customFilter.getAvailableSelectItems = function (name)
            {
                return availableSelectItems[name];
            };
            customFilter.getAvailableFilters = function ()
            {
                return availableFilters;
            };
            customFilter.remove = function (name, index)
            {
                filters.splice(index, 1);
                availableFilters.splice(1, 0, name).sort();
                filterService.resetFilter(name);
            };
            customFilter.removeAll = function ()
            {
                filterService.resetAllFilters();
                availableFilters = filterService.getAllFilters().sort();
                filters = [];
            };
            customFilter.getFilters = function ()
            {
                return filters;
            };
            customFilter.updateFilter = function (index, rangeStart, rangeEnd, list)
            {
                filterService.updateFilter(filters[index].title, rangeStart, rangeEnd, list);
            };
            customFilter.isNumeric = function (name)
            {
                var allFilterValues = filterService.getAllFilterValues(name);
                return allFilterValues.filter(function (n) {
                    return /^\d+$/.test(n);
                }).length === allFilterValues.length;
            };
            return customFilter;
        });