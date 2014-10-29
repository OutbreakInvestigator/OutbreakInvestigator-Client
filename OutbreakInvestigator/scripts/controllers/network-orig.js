'use strict';

angular.module('obiUiApp')
    .controller('NetworkCtrl', function ($scope,graphService) {
        //$scope.getGraph = graphService.getGraph;
        //$scope.graph = graphService.getGraph();
        //$scope.digest();
        $scope.sizeChange = function()
        {
            alert("Loading network");
        }
    })
    .directive('networkVis', function ($window, $document,graphService,eventService) {
        //alert("performing networkVis2 directive");
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, elem, attrs) {
                var graph_data;
                var w = elem[0].clientWidth;
                var h = elem[0].clientHeight;

                var w_trans = 0;
                var h_trans = 0;



                /*
                scope.$on('leftFilterUpdate', function(evt, filter){
                    //scope.filter = filter;
                    updateNetworkFilter(elem[0],filter);
                });
                */

                scope.$on('leftFilterUpdate', function(evt, filter){
                    //scope.filter = filter;
                    if(getPosition(elem[0])=="left")
                        updateNetworkFilter(elem[0],filter);
                });
                scope.$on('rightFilterUpdate', function(evt, filter){
                    //scope.filter = filter;
                    if(getPosition(elem[0])=="right")
                        updateNetworkFilter(elem[0],filter);
                });
                scope.$on('selCaseUpdate', function(evt, selCase)
                {
                    updateCaseSelection(elem[0],selCase);
                });

                scope.$on('visPanelResize', function(event, position) {
                    var resize_pos = position[0];
                    var curr_pos = getPosition(elem[0]);

                    if(resize_pos!=curr_pos)
                    {
                        return;     // noop if this event is from another pane
                    }

                    // resize network
                    resize();

                });

                function resize()
                {
                    // TODO: NOT WORKING!!!!
                    /*
                    setTimeout(function(){
                        var svg = d3.select('svg');

                        // caculate translation from previous center to new center
                        //var prev_center_w = w/2;
                        //var prev_center_h = h/2;

                        w = elem[0].clientWidth;
                        h = elem[0].clientHeight;

                        //var new_center_w = w/2;
                        //var new_center_h = h/2;

                        //w_trans = new_center_w - prev_center_w;
                        //h_trans = new_center_h - prev_center_h;

                        //svg.attr("width", w).attr("height", h);
                        //h = new_h;
                        //w = new_w;
                        //force.start();

                        update(graphService.getGraph());
                    },10);
                    */

                    w = elem[0].clientWidth;
                    h = elem[0].clientHeight;
                    update(graphService.getGraph());
                }

                /*
                var force = d3.layout.force()
                    .charge(-120)
                    .linkDistance(30)
                    .size([w, h]);
                    */

                var force = d3.layout.force()
                    //.charge(function(d){return d.id=="gravity" ? 20 : -200})
                    .linkDistance(30)
                    //.distance(10)
                    //.size([w, h]);

                //force.stop();

                //d3_layout_force_pausable(force);
                scope.$watch(graphService.getGraph, function(newVal, oldVal)
                {
                    if(newVal)
                        update(newVal);
                });

                function update(newVal)
                {
                    //force.size([w, h]);

                    function tick() {
                        /*
                         if(force.alpha()<0.05)
                         {
                         force.paused(true);
                         return;
                         }*/

                        link.attr("x1", function(d) {
                            return d.source.x;
                        })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });

                        /*
                        node.attr("cx", function(d) {
                                var circle = this.querySelector("circle");
                                var r = circle.getAttribute("r");
                                return d.x = Math.max(r, Math.min(w - r, d.x));
                            })
                            .attr("cy", function(d) {
                                var circle = this.querySelector("circle");
                                var r = circle.getAttribute("r");
                                return d.y = Math.max(r, Math.min(h - r, d.y));
                            });*/

                        node.attr("transform", function(d) {

                            var circle = getElementsByClassName('node');
                            var r = circle[0].getAttribute('r');
                            //console.log("alpha = "+force.alpha());
                            //return "translate("+d.x+","+d.y+")";
                            //if(d.id!="gravity")
                            return "translate(" + Math.max(r, Math.min(w - r, d.x)) + "," + Math.max(r, Math.min(h - r, d.y)) + ")";
                            //else
                            //var new_x = d.x + w_trans;
                            //var new_y = d.y + h_trans;

                            //return "translate(" + d.x + "," + d.y +")";
                            /*
                            if(isNaN(d.x)||isNaN(d.y))
                            {
                                return;
                            }

                            if(Math.abs(d.x)>=1&&Math.abs(d.y)>=1)
                            {
                                return "translate(" + d.x + "," + d.y +")";
                            }
                            */
                        });
                    };

                    var node_drag = d3.behavior.drag()
                        .on("dragstart", dragstart)
                        .on("drag", dragmove)
                        .on("dragend", dragend);

                    function dragstart(d, i) {
                        force.stop() // stops the force auto positioning before you start dragging
                    }

                    function dragmove(d, i) {
                        if(!isNaN(d3.event.dx) && !isNaN(d3.event.dy))
                        {
                            d.px += d3.event.dx;
                            d.py += d3.event.dy;
                            d.x += d3.event.dx;
                            d.y += d3.event.dy;

                            tick(); // this is the key to make it work together with updating both px,py,x,y on d !
                        }
                    }

                    function dragend(d, i) {
                        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                        tick();
                        force.resume();
                    }

                    graph_data = jQuery.extend(true, {}, newVal);//JSON.parse(JSON.stringify(newVal));

                    // add gravity node
                    //var gravity_node = {id:"gravity", dbid:"gravity", x:w/2, y:h/2, fixed:true};
                    //graph_data.nodes.push(gravity_node);

                    //elem.text("graph data = "+ graph_data.nodes[0].id);
                    var used_nodes = [];

                    // create new node and edge collections
                    var pruned_nodes = [];
                    var modded_edges = [];
                    graph_data.links.forEach(function(link){
                        var newSourceIndex = used_nodes.indexOf(link.source);
                        if(newSourceIndex==-1)
                        {
                            newSourceIndex = used_nodes.push(link.source)-1;
                            pruned_nodes.push(graph_data.nodes[link.source]);
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
                    //pruned_nodes.push(gravity_node);

                    /*
                     graph_data.nodes.forEach(function(d,i) {
                     if (used_nodes.indexOf(i)>-1) pruned_nodes.push(d)
                     });
                     */

                    /*
                     var unique_used_nodes = [];
                     $.each(used_nodes, function(i, el){
                     if($.inArray(el, unique_used_nodes) === -1) unique_used_nodes.push(el);
                     });
                     */

                    //test
                    pruned_nodes = graph_data.nodes;

                    // get rid of previous network
                    var old_svg = d3.select(elem[0]).select("svg");
                    if(old_svg!=null)
                        old_svg.remove();

                    //test
                    //var scaleFactor = 1;
                    //var translation = [0,0];
                    /*** Configure zoom behaviour ***/
                    var zoomer = d3.behavior.zoom()
                        .scaleExtent([0.1,10])
                        //allow 10 times zoom in or out
                        .on("zoom", zoom);
                    //define the event handler function
                    function zoom() {
                        console.log("zooming");
                        /*
                        console.log("zoom", d3.event.translate, d3.event.scale);
                        scaleFactor = d3.event.scale;
                        translation = d3.event.translate;
                        tick(); //update positions
                        */
                    }

                    var svg = d3.select(elem[0]).append("svg:svg")

                        .attr({
                            //"width": "100%",
                            //"height": "100%"
                            //"class": "fill"
                        })

                        //.attr("width","100%")
                        //.attr("height","100%")
                        //.attr("viewBox","0 0 1 1")
                        //.attr("preserveAspectRatio","none")


                        .attr("viewBox", "0 0 " + w + " " + h )
                        .attr("preserveAspectRatio", "xMidYMid meet")
                        //.attr("pointer-events", "all")
                        //.call(d3.behavior.zoom().on("zoom", redraw));


                    //var vis = svg
                    //    .append('svg:g');


                    function redraw() {
                        svg.attr("transform",
                            "translate(" + d3.event.translate + ")"
                                + " scale(" + d3.event.scale + ")"
                        );
                    };


                    //svg.attr("width", w).attr("height", h);
                    //svg.attr("preserveAspectRatio","xMinYMin meet").attr("viewBox","0 0 "+ w +" "+ h);

                    force
                        .nodes(pruned_nodes/*graph_data.nodes*/)
                        .links(modded_edges/*graph_data.links*/)
                        //.charge(-1*(w-pruned_nodes.length)/10)  // experimental network size based charge
                        .size([w, h])
                        .start();
                    /*
                     var force = self.force = d3.layout.force().nodes(graph_data.nodes).links(
                     graph_data.links).distance(100).charge(-1000).size([ w, h ])
                     .friction(0.4).start();*/

                    var link = svg.selectAll(".link")
                        .data(modded_edges/*graph_data.links*/)
                        .enter().append("line")
                        .attr("class", "link")
                        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

                    //var filter = graphService.getLeftFilter();

                    var node = svg.selectAll(".node")
                        .data(pruned_nodes)
                        .enter().append("svg:g")
                        //.call(zoomer) //Attach zoom behaviour.
                        //.attr("fixed",function(d) {return d.id=="gravity" ? true : false})
                        //.attr("class", "node");
                        .attr("class", function(d,i) {
                            return /*used_nodes.indexOf(i)>-1||d.id=="gravity" ?*/ "node" /*: "node hidden" */
                        });

                    node.append("circle")
                        // TODO: experiment with setting style of selected node(s) here.
                        .on("click", function(){
                            console.log(this);
                            console.log(d3.select(this));
                            eventService.setSelCase(this);
                            d3.select(this).attr("class", "node type1");})
                        .attr("class", function(d) {return "node type0"})
                        .attr("r", function(d) {return 6.0})
                        //.style("fill", function(d) { return color(d.group); })
                        .call(node_drag);

                    node.append("svg:text").attr("class", "nodetext").attr("dx", 16).attr("dy",".35em").text(function(d) {
                        return d.dbid
                    });

                    force.on("tick", tick);

                    eventService.rebroadcastFilters();
                };

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

                        /*
                        var associated_links = svg.selectAll("link").filter(function(d) {
                            return d.source.index == i || d.target.index == i;
                        }).each(function(dLink, iLink) {
                                //unfade links and nodes connected to the current node
                                d3.select(this).style("opacity", 1);
                                //THE FOLLOWING CAUSES: Uncaught TypeError: Cannot call method 'setProperty' of undefined
                                d3.select(dLink.source).style("opacity", 1);
                                d3.select(dLink.target).style("opacity", 1);
                            });*/
                    }

                }

                function updateCaseSelection(elem, inCase)
                {
                    var svg = d3.select(elem).select("svg");
                    svg.selectAll("g.node").filter(function(d, i){
                        return d.id==inCase.id;
                    }).selectAll("circle").attr("class", "node type1");
                }
            }
        };
    });

function getElementsByClassName(className) {
    if (document.getElementsByClassName) {
        return document.getElementsByClassName(className);
    }
    else {
        return document.querySelectorAll('.' + className);
    }
}

function getPosition (el) {
    // class="vis-panel"
    var panelAncestor = findAncestor(el,"vis-panel");
    var position = null;
    if(panelAncestor!=null)
    {
        position = panelAncestor.getAttribute("pos");
    }

    return position;
}

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}
