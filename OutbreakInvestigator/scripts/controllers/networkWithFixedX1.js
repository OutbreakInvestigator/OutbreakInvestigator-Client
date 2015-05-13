/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller('Network1WithFixedXCtrl', function ($scope, graphService) {
            $scope.sizeChange = function () {
                alert("Loading network");
            }
        })
        .directive('network1WithFixedXVis', function (graphService, eventService, displayService, timelineService, filterService) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var uid = elem.uniqueId();
                    var graph_data, nodes, links, minDate, maxDate;
                    var w = elem[0].clientWidth;
                    var h = elem[0].clientHeight;
                    var r = 6;

                    var nodeCircles,
                            linkLines,
                            text,
                            xAxis;

                    var scaleFactor = 1;
                    var translation = [0, 0];
                    var textPadding = 10;

                    scope.$watch(graphService.getGraph, function (newVal, oldVal)
                    {
                        if (newVal)
                            update(newVal);

                        updateAllFilters(getPosition(elem[0]));
                    });

                    scope.$on('resetUI', function (evt, filter) {
                        resetNetwork();
                        var nodes = vis.selectAll("circle.node");
                        nodes.style("fill", color);
                    });

                    scope.$on('leftFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "left")
                            updateAllFilters(getPosition(elem[0]));
                    });

                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "right")
                            updateAllFilters(getPosition(elem[0]));
                    });

                    scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
                    {
                        if (requestModuleID != uid)
                        {
                            updateCaseSelection(elem[0], selCases);
                        }
                    });

                    scope.$on('filterUpdate', function (evt, filter, value1, value2)
                    {
                        updateAllFilters(getPosition(elem[0]));
                    });

                    scope.$on('visPanelResize', function (event, position, width, height) {
                        var resize_pos = position[0];
                        var curr_pos = getPosition(elem[0]);

                        if (resize_pos != curr_pos)
                        {
                            return;     // noop if this event is from another pane
                        }

                        // resize network svg
                        resize(width, height);
                    });

                    ////////////////////// 

                    var caseInfoFields = displayService.getCaseInfoFields();

                    var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10, 0])
                            .html(function (d) {
                                return "<span>" + getInfoText(d) + "</span>";//"<strong>DBID:</strong> <span style='color:red'>" + d.dbid + "</span>";
                            })

                    function getInfoText(d)
                    {
                        var infoText = '';
                        for (var i = 0; i < caseInfoFields.length; i++)
                        {
                            var currField = caseInfoFields[i];
                            infoText += currField['display_text'] + ": " + d[currField['data_field']];
                            if (i != caseInfoFields.length - 1)
                            {
                                infoText += "<br/>";
                            }
                        }

                        return infoText;
                    }

                    function resize(width, height)
                    {
                        w = width;
                        h = height;

                        svg.attr("width", w).attr("height", h);
                        svg.select(".x.axis").attr("transform", "translate(" + translation[0] + "," + (h - 30) + ")" + " scale(" + scaleFactor + ")").call(xAxis);
                    }


                    /*** Configure Force Layout ***/
                    var force = d3.layout.force()

                            .size([w, h])
                            .linkDistance(50)
                            .charge(-100)
                            .friction(0.90)
                            .on("tick", tick);

                    /*** Configure drag behaviour ***/
                    var dragger = d3.behavior.drag()
                            //allow 10 times zoom in or out
                            .on("dragstart", dragstart)
                            .on("drag", drag);

                    //define the event handler function
                    function drag(d, i) {
                        if (eventService.getUIMode() == "manipulate")
                        {
                            var maxX = w;
                            var maxY = h;

                            d.px += d3.event.dx;
                            d.py += d3.event.dy;
                            d.x += d3.event.dx;
                            d.y += d3.event.dy;

                            // constrain drags to div
                            if (d.x > maxX)
                                d.x = maxX;
                            if (d.x < 0)
                                d.x = 0;
                            if (d.y > maxY)
                                d.y = maxY;
                            if (d.y < 0)
                                d.y = 0;

                            tick(); //update positions
                        }
                    }

                    function dragstart(d, i) {
                        if (eventService.getUIMode() == "manipulate")
                        {
                            d3.event.sourceEvent.stopPropagation(); // silence other listeners
                        }
                    }

                    /** Initialize SVG ***/
                    var svg = d3.select(elem[0]).append("svg:svg");
                    var graph = svg
                            .attr("width", w)
                            .attr("height", h)
                            .call(tip)
                            .append("g")
                            .attr("class", "graph")
//                            .call(zoomer); //Attach zoom behaviour.


                    // Add a transparent background rectangle to catch
                    // mouse events for the zoom behaviour.
                    // Note that the rectangle must be inside the element (graph)
                    // which has the zoom behaviour attached, but must be *outside*
                    // the group that is going to be transformed.
                    var rect = graph.append("rect")
                            .attr("width", w)
                            .attr("height", h)
                            .style("fill", "none")
                            //make transparent (vs black if commented-out)
                            .style("pointer-events", "all");
                    //respond to mouse, even when transparent

                    var vis = graph.append("svg:g")
                            .attr("class", "plotting-area");
                    //create a group that will hold all the content to be zoomed



                    /*** Initialize and position node and link elements ***/
                    function update(newVal) {
                        /*
                         //resize
                         w = elem[0].clientWidth;
                         h = elem[0].clientHeight;
                         svg.attr("width", w);
                         svg.attr("height", h);
                         */

                        graph_data = {};
                        angular.copy(newVal, graph_data);
                        //var graph_data = graphService.getGraph(); // TODO: should I use the line above?

                        // get rid of previous network
                        var old_vis = graph.select("g");
                        if (old_vis != null)
                            old_vis.remove();
                        vis = graph.append("svg:g")
                                .attr("class", "plotting-area");


                        //TODO, I think that links may be wrong in next line (should we base edges on node indices and not id)
                        nodes = graph_data.nodes;
                        links = graph_data.links;
                        var ndx = new crossfilter(nodes);
                        var dateDimension = ndx.dimension(function (d) {
                            var date = new Date(d.REPORT_DT);
                            return date;
                        });

                        var dateGroup = dateDimension.group().reduceCount();

                        minDate = new Date(dateDimension.bottom(1)[0].REPORT_DT);
                        minDate.setHours(minDate.getHours() - 144);
                        maxDate = new Date(dateDimension.top(1)[0].REPORT_DT);
                        maxDate.setHours(maxDate.getHours() + 144);
                        var xComp = d3.scale.linear()
                                .domain([minDate, maxDate])
                                .range([0 + r, w - r]);
                        nodes.forEach(function (n) {
                            n.staticx = xComp(new Date(n.REPORT_DT));
                        });



                        function getConnectedCases(inCase)
                        {
                            var filteredLinks = links.filter(function (d, i) {
                                return (d.source.id === inCase.id) || (d.target.id === inCase.id)
                            });
                            var connectedCases = nodes.filter(function (d, i) {
//                                return d.group == inCase.group;
                                return $.inArray(d.id, filteredLinks.map(function (d) {
                                    return d.source.id;
                                }).concat(filteredLinks.map(function (d) {
                                    return d.target.id;
                                }))) >= 0;
                            });

                            return connectedCases;
                        }

                        // Restart the force layout.
                        force.nodes
                                (d3.values(graph_data.nodes))
                                .links(graph_data.links).start();

                        text = vis.selectAll("text")
                                .data(force.nodes())
                                .enter().append("svg:text")
                                .attr("class", "text")
                                .attr("x", textPadding)
                                .attr("y", ".31em")
                                .text(function (d) {
                                    return d.id;
                                });


                        // Per-type markers, as they don't inherit styles.
                        vis.append("defs").selectAll("marker")
                                .data(["contact"])
                                .enter().append("marker")
                                .attr("id", function (d) {
                                    return d;
                                })
                                .attr("viewBox", "0 -5 10 10")
                                .attr("refX", 15)
                                .attr("refY", -1.5)
                                .attr("markerWidth", 6)
                                .attr("markerHeight", 6)
                                .attr("orient", "auto")
                                .append("svg:path")
                                .attr("d", "M0,-5L10,0L0,5");

                        // Update the links…
                        linkLines = vis.selectAll("link")
                                .data(force.links())
                                .enter().append("svg:path")
                                .attr("class", function (d) {
                                    return "link " + "contact";
                                })
                                .attr("marker-end", function (d) {
                                    return "url(#" + "contact" + ")";
                                });


                        // Update the nodes
                        nodeCircles = vis.selectAll("circle.node")
                                .data(force.nodes(), function (d) {
                                    return d.id;
                                })
                                .enter().append("svg:circle")
                                .attr("class", "node")
                                .attr("r", 8)
                                .style("fill", color)
                                .style("pointer-events", "all")
                                .style("stroke", "#333").style("stroke-width", "1.5px")

                                .on('mouseover', tip.show)
                                .on('mouseout', tip.hide)

                                .on("click", function (d) {
                                    var currUIMode = eventService.getUIMode();
                                    if (currUIMode == "select")
                                    {
                                        updateCaseSelection(elem[0], [d]);
                                        eventService.setSelCases([d], uid);
                                    }
                                    else if (currUIMode == "multiselect")
                                    {
                                        var selCases = eventService.getSelCases();
                                        var index = null;
                                        selCases.forEach(function (c, i) {
                                            if (c.dbid === d.dbid)
                                                index = i;
                                        });

                                        if (index !== null)
                                            selCases.splice(index, 1);
                                        else
                                            selCases.push(d);

                                        updateCaseSelection(elem[0], selCases);
                                        eventService.setSelCases(selCases, uid);
                                    }
                                })
                                .call(dragger);


                        xAxis = d3.svg.axis()
                                .scale(d3.time.scale().domain([minDate, maxDate]).range([0 + r, w - r]))
                                .orient("bottom");
                        graph.append("svg:g")
                                .attr("class", "x axis").attr("transform", "translate(0," + (h - 30) + ")" + " scale(" + scaleFactor + ")")
                                .call(xAxis.tickSize(-h + 50, 0, 0)
//            .tickFormat("")
                                        );

                        /*** Configure zoom behaviour ***/
                        var zoomer = d3.behavior.zoom()
                                .scaleExtent([0.1, 10])
                                //allow 10 times zoom in or out
                                .on("zoom", zoom);
                        //define the event handler function
                        function zoom() {
                            scaleFactor = d3.event.scale;
                            translation = d3.event.translate;
                            tick(); //update positions
                            svg.select(".x.axis").attr("transform", "translate(" + translation[0] + "," + (h - 30) + ")" + " scale(" + scaleFactor + ")").call(xAxis);
                        }

                        graph.call(zoomer);
                        // initialize selections
                        updateCaseSelection(elem[0], eventService.getSelCases());

                    }

                    function color(d) {
                        return "#c6dbef";//return  d.children ? "#c6dbef" : d.group;
                    }

                    function sel_color(d) {
                        return "red";
                    }

                    /*** Set the position of the elements based on data ***/
                    function tick() {
                        linkLines.attr("d", linkArc);
//                        nodeCircles.attr("transform", transform);
//                        text.attr("transform", transform);

                        linkLines.attr("x1", function (d) {
                            return translation[0] + scaleFactor * d.source.staticx;
                        })
                                .attr("y1", function (d) {
                                    return translation[1] + scaleFactor * d.source.y;
                                })
                                .attr("x2", function (d) {
                                    return translation[0] + scaleFactor * d.target.staticx;
                                })
                                .attr("y2", function (d) {
                                    return translation[1] + scaleFactor * d.target.y;
                                });

                        nodeCircles.attr("cx", function (d) {
                            return translation[0] + scaleFactor * d.staticx;
                        })
                                .attr("cy", function (d) {
                                    return translation[1] + scaleFactor * d.y;
                                });

                        text.attr("x", function (d) {

                            return translation[0] + scaleFactor * d.staticx + textPadding;
                        })
                                .attr("y", function (d) {
                                    return translation[1] + scaleFactor * d.y;
                                });
                    }


                    function linkArc(d) {
                        var dSourceX = translation[0] + scaleFactor * d.source.staticx,
                                dSourceY = translation[1] + scaleFactor * d.source.y,
                                dTargetX = translation[0] + scaleFactor * d.target.staticx,
                                dTargetY = translation[1] + scaleFactor * d.target.y,
                                dx =
                                //d.target.x - d.source.x,
                                dTargetX - dSourceX,
                                dy =
                                //d.target.y - d.source.y,
                                dTargetY - dSourceY,
                                dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + dSourceX + "," + dSourceY + "A" + dr + "," + dr + " 0 0,1 " + dTargetX + "," + dTargetY;
                    }

                    function transform(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    }

                    function updateNetworkFilter(filter, checkFn, timelineFilter)
                    {
                        if (filter)
                        {
                            svg.selectAll(".node").filter(function (d) {
                                var isHidden = !checkFn(d, timelineFilter, filterService, filter);
                                return isHidden;
                            }).each(function (d, i) {
                                var associated_links = svg.selectAll(".link").filter(function (e) {
                                    return e.source == d || e.target == d;
                                }).style("visibility", "hidden");
                            }).style("visibility", "hidden");

                            svg.selectAll(".text").filter(function (d) {
                                var isHidden = !checkFn(d, timelineFilter, filterService, filter);
                                return isHidden;
                            }).style("visibility", "hidden");
                        }

                    }

                    function resetNetwork()
                    {
                        var svg = d3.select(elem[0]).select("svg");
                        svg.selectAll(".node").style("visibility", "visible");
                        svg.selectAll(".link").style("visibility", "visible");
                        svg.selectAll(".text").style("visibility", "visible");
                        svg.select(".x.axis").attr("transform", "translate(" + translation[0] + "," + (h - 30) + ")" + " scale(" + scaleFactor + ")").call(xAxis);

                    }

                    function updateAllFilters(timelineFilter)
                    {
                        //reset first
                        resetNetwork();
                        if (timelineFilter)
                        {
                            updateNetworkFilter('time', filterService.filterTimeline, timelineFilter);
                        }
                        angular.forEach(filterService.getAllFilterData(), function (value, key) {
                            updateNetworkFilter(key, filterService.filter);
                        });
                    }

                    function updateCaseSelection(elem, inCases)
                    {
                        // if there are no selections, there is nothing to do
                        if (!inCases)
                        {
                            return;
                        }

                        //var svg = d3.select(elem).select("svg");
                        var plotting_area = d3.select(elem).select(".plotting-area");
                        var nodes = plotting_area.selectAll("circle.node");
                        plotting_area.selectAll("circle.node").filter(function (d, i) {
                            return isSelected(inCases, d);//d.id==inCase.id;
                        }).style("fill", sel_color);
                        plotting_area.selectAll("circle.node").filter(function (d, i) {
                            return !isSelected(inCases, d);//d.id!=inCase.id;
                        }).style("fill", color);
                    }

                    function isSelected(selCases, currCase)
                    {
                        var selected = false;
                        selected = selCases.some(function (currSelCase)
                        {
                            if (currCase.dbid == currSelCase.dbid)
                                return true;
                        });

                        return selected;
                    }

                }
            };
        });
 