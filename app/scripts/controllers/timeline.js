/**
 * Created by detwiler on 1/31/14.
 */

angular.module('obiUiApp')
    .controller('TimelineCtrl', function ($scope,graphService,eventService,timelineService) {
        $scope.getGraph = graphService.getGraph;
        $scope.filterTargetSel = function(event)
        {
            //alert(event.target.id);
            var button_id = event.target.id;
            if(button_id=='')
            {
                button_id = event.target.parentElement.id;
            }
            var filter = eventService.setFilterSel(button_id);
            if(filter!=null)
            {
                /*
                var chart = dc.barChart("#timeline");//d3.select("#timeline");

                chart.brush().extent(filter);
                chart.event("brush");
                //chart.brush(filter);
                chart.redraw();
                */

                var chart = timelineService.getTimeline();
                var currBrush = timelineService.getBrush();

                dc.events.trigger(function () {
                    chart.filter(filter);
                    console.log("event firing with filters: "+chart.filters());
                });

                currBrush.extent(filter)
                d3.select(".brush").call(currBrush);
                //chart.filter(filter);
                //eventService.setFilter(filter);
                //chart.redraw();
            }

        };
        $scope.radioModel = 'Middle';

    })

    // or should this be watch?
    .directive('timelineVis', function ($window,$document, graphService, eventService, timelineService) {
        return {
            restrict: 'A',
            scope: {
                visData: '=',
                chart: '='
            },
            link: function (scope, elem, attrs) {
                //var chart = dc.barChart("#test");
                //$('.btn').button();

                scope.$watch("visData", function(newVal, oldVal) {

                    if(newVal)
                    {
                        var chart = dc.barChart("#timeline");
                        timelineService.setTimeline(chart);
                        var ndx = /*graphService.getLeftCrossfilter();*/new crossfilter(newVal.nodes);
                            /*
                            timeDimension = ndx.dimension(function(d) {
                                var date = new Date(d.REPORT_DT);
                                return date.getFullYear() + date.getMonth()/12.0;
                            }),*/
                        var dateDimension = ndx.dimension(function(d) {
                                var date = new Date(d.REPORT_DT);
                                return date;
                        });

                        var dateGroup = dateDimension.group().reduceCount();

                        var minDate = new Date(dateDimension.bottom(1)[0].REPORT_DT);
                        var maxDate = new Date(dateDimension.top(1)[0].REPORT_DT);

                        chart
                            .width(elem.width())
                            .height(60)
                            //.height(300)
                            .margins({top: 0, right: 50, bottom: 20, left: 40})
                            //.dimension(moveMonths)
                            //.group(volumeByMonthGroup)
                            //.centerBar(true)
                            //.gap(1)
                            //.x(d3.time.scale().domain([new Date(2007, 0, 1), new Date(2009, 11, 31)]))
                            .x(d3.time.scale().domain([minDate,maxDate]))
                            //.y(d3.scale.linear().domain([0,d3.max(dateGroup, function(d) {return d.value();})]))
                            .elasticX(true)
                            .elasticY(true)
                            .xAxisPadding("10%")
                            .yAxisPadding("10%")
                            .turnOnControls(true) // this doesn't seem to be doing anything
                            .brushOn(true) // nor this
                            //.round(d3.time.month.round)
                            //.alwaysUseRounding(true)
                            //.xUnits(d3.time.months)
                            .dimension(dateDimension)
                            .group(dateGroup);


                        chart.yAxis().tickFormat(d3.format("d"));
                        chart.on("filtered", function(chart, filter)
                        {
                            if(filter!=null)
                            {
                                console.log("filter min "+filter[0]);
                                console.log("filter max "+filter[1]);
                                eventService.setFilter(filter);
                                //graphService.setLeftFilter(filter);
                                //ndx.
                            }
                        });

                        chart.on("zoomed", function(chart, filter)
                        {
                            console.log("you have zoomed");
                        });

                        chart.render();

                        // set initial brush bounds to surround all data points
                        var brush = chart.brush();
                        timelineService.setBrush(brush);
                        brush.extent([minDate,maxDate]);


                        //var inactiveBrush = chart.brush();
                        //timelineService.setInactiveBrush(inactiveBrush);
                        //inactiveBrush.extent([minDate,maxDate]);

                        //test
                        /*
                         brush1 = chart.brush();
                         brush2 = chart.brush();
                         brush1.extent([minDate,maxDate]);
                         brush2.extent([minDate,maxDate]);

                        brush = d3.svg.brush().x(d3.time.scale().domain([minDate,maxDate]));
                        //brush.extent([minDate,maxDate]);
                        var svg = d3.select("svg").select("g");
                        svg.append("g")
                            .attr("class", "x brush")
                            .call(brush.extent([minDate,maxDate]))
                            .selectAll("rect")
                            .attr("height",60)
                            .style({
                                "fill": "#69f",
                                "fill-opacity": "0.1"
                            });
                            */


                        // set filter to full range on new data
                        //graphService.setLeftFilter([minDate,maxDate]);
                        eventService.setFilter([minDate,maxDate]);

                        // refresh display
                        chart.redraw();

                    }
                });
            }
        };
    });