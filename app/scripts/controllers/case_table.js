/**
 * Created by detwiler on 9/15/14.
 */


angular.module('obiUiApp')
        .controller("CaseTableCtrl", function ($scope, $http, graphService, displayService, eventService, timelineService) {
            $scope.uid;
            //$scope.columns = [];
            $scope.gridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableRowHeaderSelection: false,
                enableGridMenu: true,
//                exporterLinkLabel: 'get your csv here',
                exporterPdfDefaultStyle: {fontSize: 8},
                exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
                exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 500,
                exporterLinkTemplate: "<span class=\"ui-grid-exporter-csv-link-span\" ><a    download=\"OutbreakInvestigator.csv\" href=\"data:text/csv;charset=UTF-8,CSV_CONTENT\" target=\"_blank\" >LINK_LABEL</a></span>",
                exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
               
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };
            $scope.gridOptions.columnDefs = displayService.getCaseInfoFieldsGrid();
            angular.forEach($scope.gridOptions.columnDefs, function (value, key) {
                if (value.type && value.type === 'date')
                {
                    value.sortingAlgorithm = function (a, b) {
                        var nulls = $scope.gridApi.core.sortHandleNulls(a, b);
                        if (nulls !== null) {
                            return nulls;
                        } else {
                            var aDT = new Date(a);
                            var bDT = new Date(b);
                            if (aDT < bDT)
                                return  -1;
                            if (aDT > bDT)
                                return  1;
                            else
                                return 0;
                        }
                    };
                }
                ;

            });



            // data
            $scope.cases = [];
            if (graphService.getGraph())
                reloadGraph(graphService.getGraph());

            $scope.$watch(graphService.getGraph, function (newVal, oldVal)
            {
                var selCases = {};
                selCases.nodes = eventService.getSelCases(); //graphService.getSelectedGraph();
                if (selCases.nodes && selCases.nodes.length > 0)
                    reloadGraph(selCases);
                else if (newVal !== oldVal)
                    reloadGraph(newVal);
            });

            $scope.selectRow = function ()
            {
                removeDownloadLink();

                var selCases = {};
                selCases.nodes = eventService.getSelCases(); //graphService.getSelectedGraph();
                if (selCases.nodes && selCases.nodes.length > 0)
                    reloadGraph(selCases);
                else
                {
                    reloadGraph(graphService.getGraph());
                }

            };


            function removeDownloadLink()
            {
                // remove download link if any
                var targetElm = $scope.gridOptions.exporterCsvLinkElement;
                if ((targetElm[0]) && (angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')))) {
                    angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')).remove();
                }
            }

            function reloadGraph(newGraph)
            {
                var graph_data = {};
                angular.copy(newGraph, graph_data);

                var timeline = timelineService.getTimeline();
                if (timeline)
                {
                    var filters = timeline.filters()[0];
                    if (filters)
                    {
                        var filteredCase = {};
                        filteredCase.nodes = graph_data.nodes.filter(function (cif) {
                            return ((new Date(cif.REPORT_DT)).getTime() >= filters[0].getTime() &&
                                    (new Date(cif.REPORT_DT)).getTime() <= filters[1].getTime());
                        });
                        angular.copy(filteredCase, graph_data);
                    }
                }
                $scope.cases = graph_data.nodes;
                $scope.gridOptions.data = graph_data.nodes;
            }

        })
        .directive('casetableVis', function ($window, $document, graphService, eventService, displayService) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var uid = elem.uniqueId();
                    scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
                    {
                        if (requestModuleID !== uid)
                        {
                            scope.$evalAsync(attrs.select);
                        }
                    });

                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        scope.$evalAsync(attrs.select);
                    });
                }
            };
        });
        
