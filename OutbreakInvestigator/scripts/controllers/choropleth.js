/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller("ChoroplethCtrl", function ($scope, $http, graphService) {
            $scope.uid;
            angular.extend($scope, {
                seattle: {
                    lat: 47.6097,
                    lng: -122.3331,
                    zoom: 11
                },
                layers: {
                    baselayers: {
                        googleRoadmap: {
                            name: 'Google Streets',
                            layerType: 'ROADMAP',
                            type: 'google'
                        },
                        googleTerrain: {
                            name: 'Google Terrain',
                            layerType: 'TERRAIN',
                            type: 'google'
                        },
                        googleHybrid: {
                            name: 'Google Hybrid',
                            layerType: 'HYBRID',
                            type: 'google'
                        }
                    }
                },
                defaults: {
                    scrollWheelZoom: false
                }
            });

            $scope.$watch(graphService.getGraph, function (newVal, oldVal)
            {
                if (newVal)
                    reloadGraph(newVal);
            });


            /*
             $scope.$on('leftFilterUpdate', function(evt, filter){
             //scope.filter = filter;
             if(getPosition(elem[0])=="left")
             {
             //updateMapFilter(filter);
             }
             });
             $scope.$on('rightFilterUpdate', function(evt, filter){
             //scope.filter = filter;
             if(getPosition(elem[0])=="right")
             {
             //updateMapFilter(filter);
             }
             });
             $scope.$on('selCasesUpdate', function(evt, selCases, requestModuleID)
             {
             if(requestModuleID!=uid)
             {
             setSelected(selCases);
             }
             });
             */

            var graph = graphService.getGraph();
            if (graph != null)
                reloadGraph(graph);


            function reloadGraph(newGraph)
            {
                var graph_data = {};
                angular.extend(graph_data, newGraph);

                var ndx = new crossfilter(graph_data.nodes);
                var zipDimension = ndx.dimension(function (d) {
                    var streetAddr = d.STREETADDRESS;

                    var zipregex = /(\d+)$/;
                    var zipmatch = zipregex.exec(streetAddr);
                    var zip = zipmatch[0];

                    return zip;
                });

                $scope.zipCounts = zipDimension.group().reduceCount().all();
                var minCount = 0;
                var maxCount = 0;
                for (var i = 0; i < $scope.zipCounts.length; i++)
                {
                    var currCount = $scope.zipCounts[i].value
                    if (currCount > maxCount)
                    {
                        maxCount = currCount;
                    }
                }
                var color = d3.scale.linear()
                        .domain([minCount, maxCount])
                        .range(["white", "red"]);

                // Get the countries geojson data from a JSON
                $http.get("data/KC_zip.geo.json").success(function (data, status) {
                    function style(feature)
                    {
                        var featureZip = feature.properties.ZIPCODE;
                        var matchingCounts = $scope.zipCounts.filter(function (entry) {
                            return entry.key == featureZip;
                        });

                        var zipCount = matchingCounts.length > 0 ? matchingCounts[0].value : 0;

                        return {
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.5,
                            fillColor: color(zipCount)
                        };
                    }
                    ;


                    angular.extend($scope, {
                        geojson: {
                            data: data,
                            style: style
                        }
                    });
                });
            }
            ;
        })
        // directive extension
        .directive('leaflet', function () {
            return {
                restrict: 'E',
                require: [
                    '?leaflet'
                ],
                scope: false,
                link: function (scope, iElm, iAttrs, controllers) {
                    scope.uid = iElm.uniqueId();
                    console.log("unique element id = " + scope.uid);

//                    scope.$on('resetUI', function (evt, filter) {
//                        cope.$evalAsync(attrs.resetui);
//                        reloadGraph(graphService.getGraph());
//                        
//                    });

                }

            };

        });

