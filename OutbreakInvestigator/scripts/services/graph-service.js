/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('graphService', function ($rootScope, $http, eventService) {
            var graph;
            var graphOriginal;
            var loaded;
            // var selectedGraph;

            // query stuff
            var queries = [];
            var url;
            var config = {headers:
                        {
                            'Accept': 'application/json'
                        }
            };
            $http.get('conf/queries_extended.json',config)
                    .
                    success(function (data, status) {
                        queries = data.queries;
                        url = data.vertex_query_url;
                    }).
                    error(function (data, status) {
                        alert("failed to load query doc");
                    });
            

            return {
//            getSelectedGraph: function () {
//                return selectedGraph;
//            },
//            setSelectedGraph: function (inSelectedGraph){
//                selectedGraph = inSelectedGraph;
//            },
                getGraph: function () {
                    return graph;

                },
                setGraph: function (inGraph) {
                    graph = inGraph;
                },
                isLoadingComplete: function () {
                    return loaded;
                },
                setLoadingComplete: function (complete) {
                    return loaded = complete;
                },
                fetchGraphFromServer: function (query) {
                    // noop for now;
                    return;
                },
                getQueries: function () {
                    return queries;
                },
                getQueryURL: function () {
                    return url;
                },
                executeQuery: function (query)
                {
                    loaded = false;
                    $http.get(url + encodeURIComponent(query), config)
                            .
                            success(function (data, status) {
                                //$scope.status = status;
                                //$scope.data = data;
                                // populate graph
                                graph = {};
                                var nodes = [];
                                var node_ids = [];
                                var links = [];
                                //var node_list = [];
                                $.each(data.vertices, function () {
                                    // build data for nod
                                    var node_data = {};
                                    node_data['id'] = this._id.toString();
                                    node_data['dbid'] = this.DBID;
                                    for (var key in this)
                                    {
                                        if (key != 'id' && key != 'DBID')
                                        {
                                            var val = this[key]
                                            if (val != '')
                                            {
                                                node_data[key] = this[key];
                                            }
                                        }

                                    }
                                    nodes.push(node_data);
                                    node_ids.push(this._id.toString());
                                });  // end each dataitem function
                                $.each(data.edges, function () {
                                    links.push({"source": node_ids.indexOf(this._inV), "target": node_ids.indexOf(this._outV)});
//                                    links.push({"source": this._inV, "target": this._outV});
                                });

                                graph.nodes = nodes;
                                graph.links = links;
                                graphOriginal = {};
                                angular.copy(graph, graphOriginal);
                                loaded = true;
                                eventService.rebroadcastResetUI();
                            }).
                            error(function (data, status) {
                                // $scope.status = status || "Request failed";
                                //graphService.setLoadingComplete(true);
                                loaded = true;
                            });
                }
                ,
                filterGender: function (gender)  //client side filtering
                {
                    var gender;
                    if (gender === 'Male')
                        gender = 1;
                    if (gender === 'Female')
                        gender = 2;

                    if (graphOriginal !== undefined)
                    {
                        var filteredCases = [];
                        angular.copy(graphOriginal.nodes, filteredCases);
                        if (gender === 1 || gender === 2)
                        {
                            filteredCases = graphOriginal.nodes.filter(function (n) {
                                return n.GENDER === gender;
                            });
                        }
                        var ids = filteredCases.map(function (n) {
                            return n.dbid;
                        });


                        var filteredLinks = graphOriginal.links.filter(function (l) {
                            return $.inArray(graphOriginal.nodes[l.source].dbid, ids) >= 0 && $.inArray(graphOriginal.nodes[l.target].dbid, ids) >= 0;
                        });
                        $.each(filteredLinks, function () {
                            var sourceId = this.source;
                            var targetId = this.target;
                            this.source = $.map(filteredCases, function (obj, index) {

                                if (obj.dbid == graphOriginal.nodes[sourceId].dbid) {
                                    return index;
                                }
                            })[0];
                            this.target = $.map(filteredCases, function (obj, index) {

                                if (obj.dbid == graphOriginal.nodes[targetId].dbid) {
                                    return index;
                                }
                            })[0];
//                                    links.push({"source": this._inV, "target": this._outV});
                        });
                        var filteredGraph = {};
                        filteredGraph.nodes = filteredCases;
                        filteredGraph.links = filteredLinks;
                        this.setGraph(filteredGraph);
                    }

                }
            };
        });
