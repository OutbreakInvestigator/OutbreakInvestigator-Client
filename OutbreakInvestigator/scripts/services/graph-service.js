/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
    .service('graphService', function ($rootScope,$http) {
        var graph;
        var loaded = true;
       // var selectedGraph;

        // query stuff
        var queries = [];
        var url;
        $http.get('conf/queries_extended.json')
            .
            success(function(data, status) {
                queries = data.queries;
                url = data.vertex_query_url;
            }).
            error(function(data, status) {
                alert("failed to load query doc");
            });
        var config = {headers:
            {
                'Accept': 'application/json'
            }
        };

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
            setGraph: function (inGraph){
                graph = inGraph;
            },
            isLoadingComplete: function() {
                return loaded;
            },
            setLoadingComplete: function(complete) {
                return loaded = complete;
            },
            fetchGraphFromServer: function(query) {
                // noop for now;
                return;
            },

            getQueries:function(){
                return queries;
            },
            getQueryURL:function(){
                return url;
            },
            executeQuery: function(query)
            {
                loaded = false;
                $http.get(url+encodeURIComponent(query),config)
                    .
                    success(function(data, status) {
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
                            node_data['id']=this._id.toString();
                            node_data['dbid']=this.DBID;
                            for(var key in this)
                            {
                                if(key!='id'&&key!='DBID')
                                {
                                    var val = this[key]
                                    if(val!='')
                                    {
                                        node_data[key]=this[key];
                                    }
                                }

                            }
                            nodes.push(node_data);
                            node_ids.push(this._id.toString());
                        });  // end each dataitem function
                        $.each(data.edges, function () {
                            links.push({"source":node_ids.indexOf(this._inV),"target":node_ids.indexOf(this._outV)});
                        });

                        graph.nodes = nodes;
                        graph.links = links;
                        loaded=true;
                    }).
                    error(function(data, status) {
                       // $scope.status = status || "Request failed";
                        //graphService.setLoadingComplete(true);
                        loaded=true;
                    });
            }
        };
    });
