/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller('BarchartCtrl', function ($scope, graphService) {

        })
        .directive('barchartVis', function ($timeout, graphService, eventService, chartService, timelineService, filterService) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    scope.uid = elem.uniqueId();
                    scope.id = getPosition(elem[0]);
                    scope.chart;   // current chart graph data
                    scope.data;
                    scope.chartsData = chartService.getChartsConf(); // all charts data from config file
                    scope.charts = scope.chartsData.map(function (c) {  // for the dropdown on the view 
                        return c.name;
                    });
                    scope.chartSelection = scope.chartsData[0];  // current selected chart
                    scope.chartName = scope.charts[0];

//
//                    $http.get('conf/charts.json')
//                            .
//                            success(function (data, status) {
//                                scope.chartsData = data.allCharts;
//                                scope.charts = data.allCharts.map(function (c) {
//                                    return c.name;
//                                });
//                                scope.chartSelection = scope.chartsData[0];
//                            }).
//                            error(function (data, status) {
//                                alert("failed to load charts data");
//                            });

                    var timeFormat = d3.time.format("%Y-%m-%d");
                    var ITEM_HEIGHT = 13;
                    var LABEL_GAP = 5;
                    var LEGEND_X = elem.width() - 70;
                    var LEGEND_Y = 10;

                    scope.$on('resetUI', function (evt, filter) {
                        scope.chart.filterAll();
                        newChart(graphService.getGraph().nodes);

                    });
                    scope.$on('visPanelResize', function (event, position, width, height) {
                        if ((position[0]) === getPosition(elem[0]))
                        {
                            elem.width(width);
                            elem.height(height - 30);
                            LEGEND_X = elem.width() - 70;

                            scope.chart.width(elem.width())
                                    .height(elem.height() - 30)
                                    .legend(dc.legend().x(LEGEND_X).y(LEGEND_Y).itemHeight(ITEM_HEIGHT).gap(LABEL_GAP))

                            scope.chart.svg().style("height", height - 30).style("width", width);
                            scope.chart.render();
                        }
                    });
                    scope.$on('leftFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) === "left")
                            updateFilter(getPosition(elem[0]));
                    });

                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) === "right")
                            updateFilter(getPosition(elem[0]));
                    });

                    scope.$on('filterUpdate', function (evt, filter, value)
                    {
                        updateFilter(getPosition(elem[0]));
                    });

                    scope.$watch('chartName', function (newVal, oldVal)
                    {
                        if ((newVal !== undefined) && (newVal !== oldVal))
                        {
                            scope.chartSelection = scope.chartsData.filter(function (d) {
                                return d.name === newVal;
                            })[0];
                            scope.chart.resetSvg();
                            //scope.chart = dc.barChart("#chart-" + scope.id);
                            newChart(filterService.getFilteredCases(getPosition(elem[0])));
//                            updateFilter(getPosition(elem[0]));                            
                        }
                    });

                    scope.$watch(graphService.getGraph, function (newVal, oldVal)
                    {
                        if (scope.chart === undefined)
                            scope.chart = dc.barChart("#chart-" + scope.id);

                        if (newVal)
                            newChart(newVal.nodes);

                        updateFilter(getPosition(elem[0]));
                    });
//
//                    function maxY(dimension, key, value)
//                    {
//                        var yGroup = dimension.group().reduceSum(function (d) {
//                            if (d[key] == value)
//                                return 1;
//                            else
//                                return 0;
//                        });
//
//                        return (yGroup.top(1)[0].value);
//                    }
//                    ;

                    function newChart(newVal) {

                        scope.data = [];
                        angular.copy(newVal, scope.data);
                        scope.chart.filterAll();
                        var dateDimension = createDateDimension();
                        var group = createGroup(dateDimension);
//                        var ndx = new crossfilter(scope.data);
//
//                        var dateDimension = ndx.dimension(function (d) { // return d.date;
//
//                            var date = d3.time.format("%Y-%m-%d").parse(d.REPORT_DT);
//                            d.date = date;
//                            return date;
//                        });
//
//                        var group = dateDimension.group().reduce(function (p, d) {
//                            p[d[scope.chartSelection.data_field] + ''] = (p[d[scope.chartSelection.data_field] + ''] || 0) + 1;
//                            return p;
//                        },
//                                function (p, d) {
//                                    --p[d[scope.chartSelection.data_field] + ''];
//                                    return p;
//                                },
//                                function () {
//                                    return {};
//                                }
//                        );

                        var minDate = dateDimension.bottom(1)[0].date;
                        var maxDate = (dateDimension.top(1)[0].date);
                        var chartValues = scope.data.map(function (d) {
                            return d[scope.chartSelection.data_field] + '';
                        });
                        scope.ChartUniqueValues = $.grep(chartValues, function (v, k) {
                            return $.inArray(v, chartValues) === k;
                        });
 
                        scope.chart.yAxis().tickValues(yTickValues(scope.ChartUniqueValues, group.all()));

                        scope.chart.width(elem.width())
                                .height(elem.height() - 30)
                                .margins({top: 5, right: 90, bottom: 30, left: 20})
                                .dimension(dateDimension)
                                .renderHorizontalGridLines(true)
                                .centerBar(true)
                                .legend(dc.legend().x(LEGEND_X).y(LEGEND_Y).itemHeight(ITEM_HEIGHT).gap(LABEL_GAP))
                                .elasticY(true)
                                .brushOn(false)
                                .group(group, scope.ChartUniqueValues[0])
                                .valueAccessor(function (p) {
                                    return p.value[scope.ChartUniqueValues[0]] || 0;
                                })
                                .yAxisLabel("Cases")
                                .x(d3.time.scale().domain([minDate, maxDate]))
                                .elasticX(true)
                                .xUnits(calculateXUnits)
                                .xAxisPadding("1");
//                                .hidableStacks(true);
//                                .stack(group, 'Female', function (d) {
//                                    return d.value['Female'] || 0;
//                                });
                        // .stack(femaleGroup,'Female')


                        var others = scope.ChartUniqueValues.slice(1); 
                        others.forEach(function (s) {
                            scope.chart.stack(group, s, function (d) { 
                                return d.value[s] || 0;
                            });
                        });

                        //override the generated ones
                        scope.chart.yAxis().tickFormat(d3.format("d"));
                        scope.chart.renderlet(function (_chart) {
                            _chart.selectAll("rect.bar").on("click", onClick);
                        });

                        scope.chart.render();
//                        var yTickValues=[];var i=1;while(yTickValues.push(i++)<=maxY);
//                        scope.chart.yAxis().tickValues(yTickValues);
                    }
                    ;

                    var onClick = function (e)
                    {
                        console.log(e);
                        var cases = scope.data.filter(function (d) {
                            return  (d.REPORT_DT === timeFormat(e.x)) && (d[scope.chartSelection.data_field] + '' === e.layer);
                        });
                        eventService.setSelCases(cases, scope.uid);
                    };
                    var calculateXUnits = function (start, end, xDomain) { // return Math.abs(end - start);
//                        console.log('Diff: ' + dateDiff(start, end));
//                        console.log('start: ' + start);
//                        console.log('end: ' + end);
                        if (!isNaN(xDomain[0].getTime())) {
                            var diff = dateDiff(start, end);
                            return (diff > 20 ? diff : 20);
                        }
                    };

                    function dateDiff(start, end)
                    {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var firstDate = start;
                        var secondDate = end;

                        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        return diffDays;
                    }
                    ;

                    function createDateDimension()
                    {
                        var ndx = new crossfilter(scope.data);
                        var dateDimension = ndx.dimension(function (d) {
                            var date = d3.time.format("%Y-%m-%d").parse(d.REPORT_DT);
                            d.date = date;
                            return date;
                        });
                        return dateDimension;
                    }
                    ;
                    function createGroup(dimension)
                    {
                        return dimension.group().reduce(reduceAdd(), reduceRemove(), reduceInit);
                    }
                    ;

                    // create functions to generate count for any attribute
                    function reduceAdd() {
                        return function (p, d) {
                            p[d[scope.chartSelection.data_field] + ''] = (p[d[scope.chartSelection.data_field] + ''] || 0) + 1;
                            return p;
                        };
                    }
                    function reduceRemove() {
                        return function (p, d) {
                            --p[d[scope.chartSelection.data_field] + ''];
                            return p;
                        };
                    }
                    function reduceInit() {
                        return {};
                    }



                    function updateFilter(timelineFilter)
                    {

                        angular.copy(filterService.getFilteredCases(getPosition(elem[0])), scope.data);
                        scope.chart.filterAll();

                        var dateDimension = createDateDimension();
                        var group = createGroup(dateDimension);
                        var chartValues = scope.data.map(function (d) {
                            return d[scope.chartSelection.data_field] + '';
                        });
                        scope.ChartUniqueValues = $.grep(chartValues, function (v, k) {
                            return $.inArray(v, chartValues) === k;
                        });

                        scope.chart.yAxis().tickValues(yTickValues(scope.ChartUniqueValues, group.all()));

                        scope.chart
                                .dimension(dateDimension)
                                .elasticY(true)
                                .brushOn(false)
                                .group(group, scope.ChartUniqueValues[0])
                                .valueAccessor(function (p) {
                                    return p.value[scope.ChartUniqueValues[0] + ''] || 0;
                                })
                                .elasticX(true)
                                .xUnits(calculateXUnits);

                        var others = scope.ChartUniqueValues.slice(1);

                        others.forEach(function (s) {
                            scope.chart.stack(group, s, function (d) {
                                return d.value[s + ''] || 0;
                            });
                        });

                        if (timelineFilter) {
                            var timeline = timelineService.getTimeline();

                            var filters;
                            if (timelineFilter === 'left')
                                filters = eventService.getLeftFilter();
                            else if (timelineFilter === 'right')
                                filters = eventService.getRightFilter();
                            else //if (timelineFilter === 'linked')
                                filters = timeline.filters()[0];


                            var minDate = timeFormat.parse(timeFormat(new Date(filters[0])));
                            var maxDate = timeFormat.parse(timeFormat(new Date(filters[1])));

                            scope.chart.rescale();
                            scope.chart.elasticX(true);
                            scope.chart.x(d3.time.scale().domain([minDate, maxDate]));
                            scope.chart.xUnits(calculateXUnits).centerBar(true);
                            var diff = dateDiff(minDate, maxDate);
                            if (diff > 12)
                            {
                                scope.chart.xAxis().tickValues(undefined);
                            }

                            else {
//                                    var customTimeFormat = d3.time.format.multi([
//                                        [".%L", function (d) {
//                                                return false;
//                                            }],
//                                        [":%S", function (d) {
//                                                return false;
//                                            }],
//                                        ["%I:%M", function (d) {
//                                                return false;
//                                            }],
//                                        ["%I %p", function (d) {
//                                                return false;
//                                            }],
//                                        ["%a %d", function (d) {
//                                                return d.getDay() && d.getDate() != 1;
//                                            }],
//                                        ["%b %d", function (d) {
//                                                return d.getDate() != 1;
//                                            }],
//                                        ["%B", function (d) {
//                                                return d.getMonth();
//                                            }],
//                                        ["%Y", function () {
//                                                return true;
//                                            }]
//                                    ]);
//                                    scope.chart.xAxis().tickFormat(d3.time.format( '%b %e %H'));
                                var newDate = new Date(minDate);
                                var dateStrings = new Array();

                                for (var i = 1; i <= diff + 1; i++) {
                                    dateStrings.push(new Date(newDate));
                                    newDate.setDate(newDate.getDate() + i);
                                }
                                scope.chart.xAxis().tickValues(dateStrings);

                            }
                            scope.chart.xAxis().tickFormat(d3.time.format('%b %e'));

                        }
                        scope.chart.redraw();

                        $timeout(function () { 
                            updateLegend();                           
                        });
                        $timeout(function () {  //render again in case the redraw animation fails
                            scope.chart.render();
                        },1000);
                    }
//
//                    function updateAllFilters(timelineFilter)
//                    {
//                        // update(filterService.getFilteredCases());
//
//                        //if (timelineFilter)
//                        {
//                            updateFilter('time', timelineFilter);
//
//                        }
//                        
//angular.forEach(filterService.getAllFilterData(), function(value, key) {
//    updateFilter(key, filterService.filter);
//}); 

//                    }

                    function yTickValues(uniqueGroups, groupData)
                    {
                        var maxY = 0;
                        uniqueGroups.forEach(function (s) {
                            groupData.forEach(function (d) {
                                if (d.value[s] > maxY)
                                    maxY = d.value[s];

                            });
                        });
                         
                        var yTickValues = [];
                        var i = 1;
                        while (yTickValues.push(i++) <= maxY)
                            ;
                        return yTickValues;
                    }

                    function updateLegend()
                    {
                        scope.chart.svg().select("g.dc-legend").remove();
                        var _g = scope.chart.svg().append("g")
                                .attr("class", "dc-legend")
                                .attr("transform", "translate(" + LEGEND_X + "," + LEGEND_Y + ")");
                        var localLegendables = [];
                        angular.copy(scope.chart.legendables(), localLegendables);
                        var chartValues = scope.data.map(function (d) {
                            return d[scope.chartSelection.data_field] + '';
                        });
                        var chartUniqueValues = $.grep(chartValues, function (v, k) {
                            return $.inArray(v, chartValues) === k;
                        });
                        var legendables = localLegendables.filter(function (l) {
                            return $.inArray(l.name, chartUniqueValues) >= 0;
                        });

                        var itemEnter = _g.selectAll('g.dc-legend-item')
                                .data(legendables)
                                .enter()
                                .append("g")
                                .attr("class", "dc-legend-item")
                                .on("mouseover", function (d) {
                                    scope.chart.legendHighlight(d);
                                })
                                .on("mouseout", function (d) {
                                    scope.chart.legendReset(d);
                                })
                                .on("click", function (d) {
                                    scope.chart.legendToggle(d);
                                });

//                        _g.selectAll('g.dc-legend-item')
//                                .classed("fadeout", function (d) {
//                                    return d.chart.isLegendableHidden(d);
//                                });

                        if (legendables.some(dc.pluck('dashstyle'))) {
                            itemEnter
                                    .append("line")
                                    .attr("x1", 0)
                                    .attr("y1", ITEM_HEIGHT / 2)
                                    .attr("x2", ITEM_HEIGHT)
                                    .attr("y2", ITEM_HEIGHT / 2)
                                    .attr("stroke-width", 2)
                                    .attr("stroke-dasharray", dc.pluck('dashstyle'))
                                    .attr("stroke", dc.pluck('color'));
                        } else {
                            itemEnter
                                    .append("rect")
                                    .attr("width", ITEM_HEIGHT)
                                    .attr("height", ITEM_HEIGHT)
                                    .attr("fill", function (d) {
                                        return d ? d.color : "blue";
                                    });
                        }

                        itemEnter.append("text")
                                .text(dc.pluck('name'))
                                .attr("x", ITEM_HEIGHT + LABEL_GAP)
                                .attr("y", function () {
                                    return ITEM_HEIGHT / 2 + (this.clientHeight ? this.clientHeight : 13) / 2 - 2;
                                });

                        var _cumulativeLegendTextWidth = 0;
                        var row = 0;
                        itemEnter.attr("transform", function (d, i) {
//                            if (_horizontal) {
//                                var translateBy = "translate(" + _cumulativeLegendTextWidth + "," + row * legendItemHeight() + ")";
//                                if ((_cumulativeLegendTextWidth + _itemWidth) >= _legendWidth) {
//                                    ++row;
//                                    _cumulativeLegendTextWidth = 0;
//                                } else {
//                                    _cumulativeLegendTextWidth += _itemWidth;
//                                }
//                                return translateBy;
//                            }
//                            else {
                            return "translate(0," + i * (LABEL_GAP + ITEM_HEIGHT) + ")";
//                            }
                        });

                    }
                }
            };
        });
