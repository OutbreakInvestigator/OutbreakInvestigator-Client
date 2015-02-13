/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('filterService', function ($rootScope, $http, eventService, timelineService, graphService) {

            var newData = {
                rangeStart: undefined,
                rangeEnd: undefined,
                list: undefined
            };
            var AGE_FILTER = 'age', GENDER_FILTER = 'gender', DISEASE_FILTER = 'disease';


            var allFilters = [];
            var allFilterData = {};
            var genderData = {};
            var ageData = {};
            var diseaseData = {};
            var config = {headers:
                        {
                            'Accept': 'application/json'
                        }
            };
            $http.get('conf/filters.json', config)
                    .
                    success(function (data, status) {
                        allFilters = data.allFilters;

                    }).
                    error(function (data, status) {
                        alert("failed to load filters doc");
                    });

//            function isAgeFilter(name) {
//                return name === AGE_FILTER;
//            }
//            function isGenderFilter(name) {
//                return name === GENDER_FILTER;
//            }
//            function isDiseaseFilter(name) {
//                return name === DISEASE_FILTER;
//            }
            function isValid(filterData)
            {
                return  (filterData !== undefined && filterData !== null) &&
                        ((filterData.rangeStart !== undefined && filterData.rangeStart !== null &&
                                filterData.rangeEnd !== undefined && filterData.rangeEnd !== null) ||
                                (filterData.list !== undefined && filterData.list !== null && filterData.list.length > 0));
            }
            ;
            function filterTimeline(n) {
                return this.caller.filterTimeline(n, this.timelineFilter);
            }
            ;

            return {
                getDataField: function (name)
                {
                    return allFilters.filter(function (value) {
                        return  value.name === name;
                    })[0].data_field;
                },
                getAllFilterData: function ()
                {
                    return allFilterData;
                },
                getAllFilters: function ()
                {
                    return allFilters.map(function (value) {
                        return value.name;
                    });
                },
                getFilterType: function (name)
                {
                    var f = allFilters.filter(function (value) {
                        return  value.name === name;
                    });
                    return f[0].type;
                },
                getAllFilterValues: function (name)
                {
                    var data = graphService.getGraph();
                    var data_field = this.getDataField(name);
//                            allFilters.filter(function (value) {
//                        return  value.name === name;
//                    })[0].data_field;
                    var values = data.nodes.map(function (f) {
                        return f[data_field];
                    });
                    var allFilterValues = $.grep(values, function (v, k) {
                        return $.inArray(v, values) === k;
                    });

                    return this.sortFilterValues(allFilterValues);
                },
                sortFilterValues: function (allFilterValues)
                {
                    return allFilterValues.filter(function (n) {
                        return /^\d+$/.test(n);
                    }).length === allFilterValues.length ? allFilterValues.sort(function (a, b) {
                        return a - b;
                    }) : allFilterValues.sort();
                },
                updateFilter: function (name, rangeStart, rangeEnd, list)
                {
                    var filterData = {};
                    angular.copy(newData, filterData);
                    filterData.rangeStart = rangeStart;
                    filterData.rangeEnd = rangeEnd;
                    filterData.list = list;

                    this.setFilterData(name, filterData);


                },
                resetFilter: function (name)
                {
                    this.setFilterData(name, newData);
                },
                resetAllFilters: function ()
                {
                    angular.copy(newData, ageData);
                    angular.copy(newData, genderData);
                    angular.copy(newData, diseaseData);
                },
                getFilteredCases: function (filterTimeline) {

                    return this.filterAll(graphService.getGraph(), filterTimeline);

                },
                getFilterData: function (name)
                {
                    return  allFilterData[name];
                },
                setFilterData: function (name, data)
                {
                    var localData = {};
                    angular.copy(data, localData);
                    allFilterData[name] = localData;
                    eventService.rebroadcastFilterUpdate(name, localData);
                },
//                getAge: function ()
//                {
//                    return ageData;
//                },
//                  setAge: function (filterData)
//                {
//                    angular.copy(filterData, ageData);
//                    eventService.rebroadcastFilterUpdate(AGE_FILTER, ageData);
//                },
//                getDisease: function ()
//                {
//                    return diseaseData;
//                },
//                setDisease: function (filterData)
//                {
//                    angular.copy(filterData, diseaseData);
//                    eventService.rebroadcastFilterUpdate(DISEASE_FILTER, diseaseData);
//                },
//                getGender: function ()
//                {
//                    return genderData;
//                },
//                setGender: function (filterData)
//                {
//                    angular.copy(filterData, genderData);
//                    eventService.rebroadcastFilterUpdate(GENDER_FILTER, genderData);
//                },
                isRange: function (filterData)
                {
                    return isValid(filterData) && (filterData.list === undefined || filterData.list === null)
                },
                isList: function (filterData)
                {
                    return isValid(filterData) && (filterData.rangeStart === undefined || filterData.rangeStart === null)
                },
//                filterAge: function (n, timelineFilter, filterService, filter) {
//                    var filterData = filterService.getFilterData(filter);
//                    if (filterService.isRange(filterData))
//                        return n.AGEYEARS >= filterData.rangeStart && n.AGEYEARS <= filterData.rangeEnd;
//                    else if (filterService.isList(filterData))
//                        return $.inArray(n.AGEYEARS, filterData.list) >= 0;
//                    return true;
//                },
//                filterGender: function (n, timelineFilter, filterService, filter) {
//                    var filterData = filterService.getFilterData(filter);
//                    if (filterService.isRange(filterData))
//                        return n.GENDER >= genderData.rangeStart && n.GENDER <= genderData.rangeEnd;
//                    else if (filterService.isList(filterData))
//                        return $.inArray(n.GENDER, genderData.list) >= 0;
//                    return true;
//                },
//                filterDisease: function (n, timelineFilter, filterService, filter) {
//                    var filterData = filterService.getFilterData(filter);
//                    if (filterService.isRange(filterData))
//                        return n.DISEASE_NAME >= genderData.rangeStart && n.DISEASE_NAME <= genderData.rangeEnd;
//                    else if (filterService.isList(filterData))
//                        return $.inArray(n.DISEASE_NAME, genderData.list) >= 0;
//                    return true;
//                },
                filter: function (n, timelineFilter, filterService, filter) {
                    var filterData = filterService.getFilterData(filter);
                    var dataField = filterService.getDataField(filter);
                    if (filterService.isRange(filterData))
                        return n[dataField] >= filterData.rangeStart && n[dataField] <= filterData.rangeEnd;
                    else if (filterService.isList(filterData))
                        return $.inArray(n[dataField], filterData.list) >= 0;
                    return true;
                },
//                filterAgeList: function (n) {
//                    return $.inArray(n.AGEYEARS, ageData.list) >= 0;
//                },
//                filterGenderList: function (n) {
//                    return $.inArray(n.SEX, genderData.list) >= 0;
//                },
//                filterGenderRange: function (n) {
//                    return n.SEX >= genderData.rangeStart && n.SEX <= genderData.rangeEnd;
//                },
//                filterDiseaseList: function (n) {
//                    return $.inArray(n.DISEASE_NAME, diseaseData.list) >= 0;
//                },
                filterTimeline: function (n, timelineFilter) {
                    var timeline = timelineService.getTimeline();
                    if (timeline)
                    {
//                                var filters = timeline.filters()[0];
                        var filters;
                        if (timelineFilter === 'left')
                            filters = eventService.getLeftFilter();
                        else if (timelineFilter === 'right')
                            filters = eventService.getRightFilter();
                        else if (timelineFilter === 'linked')
                            filters = timeline.filters()[0];
                        if (filters)
                        {

                            return ((new Date(n.REPORT_DT)).getTime() >= filters[0].getTime() &&
                                    (new Date(n.REPORT_DT)).getTime() <= filters[1].getTime());


                        }
                    }
                    return true;
                },
                filterAll: function (graphOriginal, timelineFilter)  //client side filtering
                {

                    if (graphOriginal !== undefined)
                    {
                        var filteredCases = [];
                        angular.copy(graphOriginal.nodes, filteredCases);
                        for (var filter in this.getAllFilterData()) {
                            filteredCases = filteredCases.filter(function (n) {
                                return this.caller.filter(n, this.timelineFilter, this.caller, this.filter);
                            }, {caller: this, timelineFilter: timelineFilter, filter: filter});
                        }
                        ;
//                        angular.forEach(this.getAllFilterData(), function (value, key) {
//                            filteredCases = filteredCases.filter(function (n) {
//                                this.caller.filter(n, timelineFilter, this.caller, key);
//                            },{caller: this, timelineFilter: timelineFilter});
//                        });
//                        if (this.isRange(ageData))
//                        {
//
//                            filteredCases = filteredCases.filter(this.filterAgeRange);
//                        }
//                        else if (this.isList(ageData))
//                        {
//                            filteredCases = filteredCases.filter(this.filterAgeList);
//                        }
//
//                        if (this.isList(diseaseData))
//                        {
//                            filteredCases = filteredCases.filter(this.filterDiseaseList);
//                        }
//                        if (this.isList(genderData))
//                        {
//                            filteredCases = filteredCases.filter(this.filterGenderList);
//                        }
//                        else if (this.isRange(genderData))
//                        {
//                            filteredCases = filteredCases.filter(this.filterGenderRange);
//                        }

                        if (timelineFilter)
                        {
                            filteredCases = filteredCases.filter(filterTimeline, {caller: this, timelineFilter: timelineFilter});
//                            var timeline = timelineService.getTimeline();
//                            if (timeline)
//                            {
////                                var filters = timeline.filters()[0];
//                                var filters;
//                                if (filterTimeline === 'left')
//                                    filters = eventService.getLeftFilter();
//                                if (filterTimeline === 'right')
//                                    filters = eventService.getRightFilter();
//                                if (filterTimeline === 'linked')
//                                    filters = timeline.filters()[0];
//                                if (filters)
//                                {
//                                    filteredCases = filteredCases.filter(function (cif) {
//                                        return ((new Date(cif.REPORT_DT)).getTime() >= filters[0].getTime() &&
//                                                (new Date(cif.REPORT_DT)).getTime() <= filters[1].getTime());
//                                    });
//
//                                }
//                            }

//                            var timeline = timelineService.getTimeline();
//                            if (timeline)
//                            {
//                                updateNetworkFilter('time', function (marker) {
////                                    var filters = timelineService.getTimeline().filters()[0];
//                                    var filters;
//                                    if (filterTimeline === 'left')
//                                        filters = eventService.getLeftFilter();
//                                    if (filterTimeline === 'right')
//                                        filters = eventService.getRightFilter();
//                                    if (filterTimeline === 'linked')
//                                        filters = timeline.filters()[0];
//                                    if (filters)
//                                    {
//                                        return (new Date(marker.REPORT_DT)).getTime() >= filters[0].getTime() &&
//                                                (new Date(marker.REPORT_DT)).getTime() <= filters[1].getTime();
//                                    }
//                                    return true;
//                                });
//                            }
                        }
                        return filteredCases;
                    }

                }
            };
        });
