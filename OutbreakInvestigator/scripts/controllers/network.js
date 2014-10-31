/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
    .controller('NetworkCtrl', function ($scope, graphService) {
        $scope.sizeChange = function () {
            alert("Loading network");
        }
    })
    .directive('networkVis', function ($window, $document, graphService, eventService, displayService) {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, elem, attrs) {
                var uid = elem.uniqueId();
                var graph_data;
                var w = elem[0].clientWidth;
                var h = elem[0].clientHeight;

                var nodeCircles,
                    linkLines,
                    root;

                var scaleFactor = 1;
                var translation = [0, 0];

                var caseInfoFields = displayService.getCaseInfoFields();

                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return "<span>"+getInfoText(d)+"</span>";//"<strong>DBID:</strong> <span style='color:red'>" + d.dbid + "</span>";
                    })

                function getInfoText(d)
                {
                    var infoText = '';
                    for(var i = 0; i < caseInfoFields.length; i++)
                    {
                        var currField = caseInfoFields[i];
                        infoText += currField['display_text'] +": "+ d[currField['data_field']];
                        if(i!=caseInfoFields.length-1)
                        {
                            infoText+="<br/>";
                        }
                    }

                    return infoText;
                }

                scope.$watch(graphService.getGraph, function(newVal, oldVal)
                {
                    if(newVal)  
                        update(newVal);
                });

                scope.$on('leftFilterUpdate', function(evt, filter){
                    if(getPosition(elem[0])=="left")
                        updateNetworkFilter(elem[0],filter);
                });

                scope.$on('rightFilterUpdate', function(evt, filter){
                    if(getPosition(elem[0])=="right")
                        updateNetworkFilter(elem[0],filter);
                });

                scope.$on('selCasesUpdate', function(evt, selCases, requestModuleID)
                {
                    if(requestModuleID!=uid)
                    {
                        updateCaseSelection(elem[0],selCases);
                    }
                });

                scope.$on('visPanelResize', function(event, position, width, height) {
                    var resize_pos = position[0];
                    var curr_pos = getPosition(elem[0]);

                    if(resize_pos!=curr_pos)
                    {
                        return;     // noop if this event is from another pane
                    }

                    // resize network svg
                    resize(width,height);
                });

                /*
                function getClientWidth()
                {
                    return elem[0].clientWidth;
                }

                scope.$watch(getClientWidth,function(newVal, oldVal)
                {
                    if(newVal)
                        resize(newVal);
                });
                */



                function resize(width,height)
                {
                    w = width;
                    h = height;

                    svg.attr("width", w).attr("height", h);
                }


                /*** Configure Force Layout ***/
                var force = d3.layout.force()
                    .on("tick", tick)
                    .charge(function (d) {
                        return -50;//d._children ? -d.size / 100 : -50;
                    })
                    .linkDistance(function (d) {
                        return 30;//d.target._children ? 80 : 30;
                    })
                    .friction(0.70)
                    .size([w, h]);


                /*** Configure zoom behaviour ***/
                var zoomer = d3.behavior.zoom()
                    .scaleExtent([0.1, 10])
                    //allow 10 times zoom in or out
                    .on("zoom", zoom);
                //define the event handler function
                function zoom() {
                    //alert("zooming");
                    //console.log("zoom", d3.event.translate, d3.event.scale);
                    if(eventService.getUIMode()=="manipulate")
                    {
                        scaleFactor = d3.event.scale;
                        translation = d3.event.translate;
                        tick(); //update positions
                    }
                }

                /*** Configure drag behaviour ***/
                var dragger = d3.behavior.drag()
                    //allow 10 times zoom in or out
                    .on("dragstart", dragstart)
                    .on("drag", drag);

                //define the event handler function
                function drag(d, i) {
                    //alert("zooming");
                    //console.log("drag", d, i);
                    //if(eventService.getUIMode()=="selPointer")
                    //    eventService.setSelCase(d);

                    if(eventService.getUIMode()=="manipulate")
                    {
                        var maxX = w;
                        var maxY = h;

                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;

                        // constrain drags to div
                        if(d.x>maxX)
                            d.x = maxX;
                        if(d.x<0)
                            d.x = 0;
                        if(d.y>maxY)
                            d.y = maxY;
                        if(d.y<0)
                            d.y=0;

                        tick(); //update positions
                    }
                }

                function dragstart(d, i) {
                    if(eventService.getUIMode()=="manipulate")
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
                    //.call(dragger)
                    .call(zoomer); //Attach zoom behaviour.

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

                    //graph_data = jQuery.extend(true, {}, newVal);
                    graph_data = {};
                    angular.copy(newVal,graph_data);
                    //var graph_data = graphService.getGraph(); // TODO: should I use the line above?

                    // get rid of previous network
                    var old_vis = graph.select("g");
                    if(old_vis!=null)
                        old_vis.remove();
                    vis = graph.append("svg:g")
                        .attr("class", "plotting-area");


                    //TODO, I think that links may be wrong in next line (should we base edges on node indices and not id)
                    var nodes = graph_data.nodes;
                    var links = graph_data.links;//[];//d3.layout.force().links(nodes);

                    /*
                    // rework edges to reference nodes by index, not by id
                    var used_nodes=[];
                    graph_data.links.forEach(function(link){
                        var newSourceIndex = used_nodes.indexOf(link.source);
                        if(newSourceIndex==-1)
                        {
                            newSourceIndex = used_nodes.push(link.source)-1;
                        }
                        var newTargetIndex = used_nodes.indexOf(link.target);
                        if(newTargetIndex==-1)
                        {
                            newTargetIndex = used_nodes.push(link.target)-1;
                        }

                        // create new edge (for new node indices)
                        links.push({source:newSourceIndex,target:newTargetIndex});
                    });
                    */
                    links.forEach(function(link) {
                        var source = link.source, target = link.target;
                        if(!nodes[source].neighbors)
                            nodes[source].neighbors = [];
                        if(!nodes[target].neighbors)
                            nodes[target].neighbors = [];
                        nodes[source].neighbors.push(nodes[target]);
                        nodes[target].neighbors.push(nodes[source]);
                    });

                    function traverse(node, group) {
                        if ("group" in node) {
                            node.group = Math.min(node.group, group);
                        } else {
                            node.group = group;
                            if(node.neighbors)
                                node.neighbors.forEach(function(d) { traverse(d, group); });
                        }
                    }

                    nodes.forEach(traverse);

                    /*
                    var used_nodes = [];
                    var pruned_nodes = [];
                    var modded_edges = [];
                    graph_data.links.forEach(function(link){
                        var newSourceIndex = used_nodes.indexOf(link.source);
                        if(newSourceIndex==-1)
                        {
                            newSourceIndex = used_nodes.push(link.source)-1;
                            pruned_nodes.push(graphData.nodes[link.source]);
                        }
                        var newTargetIndex = used_nodes.indexOf(link.target);
                        if(newTargetIndex==-1)
                        {
                            newTargetIndex = used_nodes.push(link.target)-1;
                            pruned_nodes.push(graph_data.nodes[link.target]);
                        }

                        // create new edge (for new node indices)
                        modded_edges.push({source:newSourceIndex,target:newTargetIndex});
                    });
                    */

                    function getConnectedCases(inCase)
                    {
                        //var connectedCases = [inCase];
                        //var currGroup = inCase.group;
                        var connectedCases = nodes.filter(function(d, i){
                            return d.group==inCase.group;
                        });

                        return connectedCases;

                        /*
                        console.log("getting connected cases for "+inCase);
                        for(var i= 0; i < links.length; i++) {
                            console.log(links[i]);
                            var currLink = links[i];
                            if(currLink.source.id == inCase.id)
                            {
                                console.log("found link from selected case: "+currLink);
                            }
                        }*/

                    }

                    // Restart the force layout.
                    force.nodes(nodes)
                        .links(links)
                        .start();

                    // Update the links…
                    linkLines = vis.selectAll("link")
                        .data(links, function (d) {
                            return d.target.id;
                        });

                    // Enter any new links.
                    linkLines.enter().insert("svg:line", ".node")
                        .attr("class", "link");

                    // Exit any old links.
                    linkLines.exit().remove();

                    // Update the nodes
                    nodeCircles = vis.selectAll("circle.node")
                        .data(nodes, function (d) {
                            return d.id;
                        })
                        .style("fill", color);
                        //.style("fill", "red");

                    // Enter any new nodes.
                    nodeCircles.enter().append("svg:circle")
                        .attr("class", "node")
                        .attr("r", "6")
                        .call(dragger)
                        .style("pointer-events", "all")

                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide)

                        .on("click",function(d) {
                            var currUIMode = eventService.getUIMode();
                            if(currUIMode=="select")
                            {
                                updateCaseSelection(elem[0],[d]);
                                eventService.setSelCases([d],uid);
                            }
                            else if(currUIMode=="multiselect")
                            {
                                var connectedCases = getConnectedCases(d);
                                updateCaseSelection(elem[0],connectedCases);
                                eventService.setSelCases(connectedCases,uid);
                            }
                        })
                        .style("fill", color);
                        /*
                        .on("mouseover", function(d) {
                            var g = d3.select(this); // The node
                            // The class is used to remove the additional text later
                            g.append("svg:text").attr("class", "nodetext").attr("dx", 16).attr("dy",".35em").text(function(d) {
                                return d.dbid
                            });

                            //var info = g.append('svg:text')
                            //    .classed('info', true)
                            //    .attr('x', 20)
                            //    .attr('y', 10)
                            //    .text('More info');
                        })
                        .on("mouseout", function() {
                            // Remove the info text on mouse out.
                            d3.select(this).select('text.info').remove();
                        });
                        */
                        //.style("fill", "red");

                    // Exit any old nodes.
                    nodeCircles.exit().remove();

                    // Set initial positions of nodes and links
                    tick();

                    eventService.rebroadcastFilters();

                    // initialize selections
                    updateCaseSelection(elem[0],eventService.getSelCases());

                }

                function color(d) {
                    return "#c6dbef";//return  d.children ? "#c6dbef" : d.group;
                }

                function sel_color(d) {
                    return "red";
                }

                /*** Set the position of the elements based on data ***/
                function tick() {
                    linkLines.attr("x1", function (d) {
                        return translation[0] + scaleFactor * d.source.x;
                    })
                        .attr("y1", function (d) {
                            return translation[1] + scaleFactor * d.source.y;
                        })
                        .attr("x2", function (d) {
                            return translation[0] + scaleFactor * d.target.x;
                        })
                        .attr("y2", function (d) {
                            return translation[1] + scaleFactor * d.target.y;
                        });

                    nodeCircles.attr("cx", function (d) {
                        return translation[0] + scaleFactor * d.x;
                    })
                        .attr("cy", function (d) {
                            return translation[1] + scaleFactor * d.y;
                        });
                }


                function updateNetworkFilter(elem, filter)
                {
                    if(filter)
                    {
                        var svg = d3.select(elem).select("svg");
                        svg.selectAll(".node").style("visibility", "visible"); // is this correct?
                        svg.selectAll(".link").style("visibility", "visible"); // is this correct?

                        svg.selectAll(".node").filter(function(d){
                            var isHidden = (new Date(d.REPORT_DT)).getTime()<filter[0].getTime()||
                                (new Date(d.REPORT_DT)).getTime()>filter[1].getTime();
                            return isHidden;
                        }).each(function(d, i) {
                                var associated_links = svg.selectAll(".link").filter(function(e) {
                                    return e.source == d || e.target == d;
                                }).style("visibility", "hidden");
                            }).style("visibility", "hidden");
                    }

                }

                function updateCaseSelection(elem, inCases)
                {
                    // if there are no selections, there is nothing to do
                    if(!inCases)
                    {
                        return;
                    }

                    //var svg = d3.select(elem).select("svg");
                    var plotting_area = d3.select(elem).select(".plotting-area");
                    var nodes = plotting_area.selectAll("circle.node");
                    plotting_area.selectAll("circle.node").filter(function(d, i){
                        return isSelected(inCases,d);//d.id==inCase.id;
                    }).style("fill", sel_color);
                    plotting_area.selectAll("circle.node").filter(function(d, i){
                        return !isSelected(inCases,d);//d.id!=inCase.id;
                    }).style("fill", color);
                }

                function isSelected(selCases, currCase)
                {
                    var selected = false;
                    selected = selCases.some(function(currSelCase)
                    {
                        if(currCase.dbid==currSelCase.dbid)
                            return true;
                    });

                    return selected;
                }

            }
        };
    })
