/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/

angular.module('obiUiApp')
        .controller("CaseTableCtrl", function ($scope, $timeout) {
            $scope.uid;
            $scope.gridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableRowHeaderSelection: true,
                selectionRowHeaderWidth: 35,
                useExternalSorting: false,
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
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, $scope.rowSelectionChanged);
                    $scope.gridApi.core.on.sortChanged($scope, function (grid, sortCol) {
                        if ($scope.gridOptions.useExternalSorting)
                        {
                            $scope.gridOptions.data = grid.options.data;
                            grid.refresh();
                            $timeout(function () {
                                grid.resetColumnSorting();
                                $scope.gridOptions.useExternalSorting = false;
                            }, 100);
                        }

                    });
                }
            };
  

//            $scope.rowSelectionChanged = function (row)
//            {
//
//                var selRows = $scope.gridApi.selection.getSelectedRows();
//                if (eventService.getUIMode() == 'multiselect')
//                {
//                    if (selRows.length > 0)
//                        eventService.setSelCases(selRows, row.uid);
//
//                    else
//                        eventService.setSelCases([], row.uid);
//                }
//                else if (eventService.getUIMode() == 'select')
//                {
//                    if (row.isSelected)
//                        eventService.setSelCases([row.entity], row.uid);
//
//                    else
//                        eventService.setSelCases([], row.uid);
//                }
//            };
//
//            $scope.gridOptions.columnDefs = displayService.getCaseInfoFieldsGrid();
//            angular.forEach($scope.gridOptions.columnDefs, function (value, key) {
//                if (value.type && value.type === 'date')
//                {
//                    value.sortingAlgorithm = function (a, b) {
//                        var nulls = $scope.gridApi.core.sortHandleNulls(a, b);
//                        if (nulls !== null) {
//                            return nulls;
//                        } else {
//                            var aDT = new Date(a);
//                            var bDT = new Date(b);
//                            if (aDT < bDT)
//                                return  -1;
//                            if (aDT > bDT)
//                                return  1;
//                            else
//                                return 0;
//                        }
//                    };
//                }
//                ;
//            });

//            // data
//            $scope.cases = filterService.getFilteredCases();
//            if ($scope.cases != null)
////            if (graphService.getGraph())
//            {
//                reloadTable($scope.cases);
//                $timeout(function () {
//                    var selCases = {};
//                    selCases.nodes = eventService.getSelCases()
//                    if (selCases.nodes && selCases.nodes.length > 0)
//                        $scope.selectRow();
//
//                });
//            }

//            $scope.$watch(graphService.getGraph, function (newVal, oldVal)
//            {
//                var selCases = {};
//                selCases.nodes = eventService.getSelCases();
//                if (selCases.nodes && selCases.nodes.length > 0)
//                    $timeout(function () {
//                        $scope.selectRow();
//                    });
//                else if (newVal !== oldVal)
//                    reloadTable(filterService.getFilteredCases());
//
//            });
//
//            $scope.resetUI = function ()
//            {
//                reloadTable(graphService.getGraph().nodes);
//                $scope.gridApi.selection.clearSelectedRows();
//            };
//
//
//            $scope.updateAllFilters = function (filterTimeline)
//            {
//                removeDownloadLink();
//                reloadTable(filterService.getFilteredCases(filterTimeline));
//                $timeout(function () {
//                    $scope.selectRow();
//                });
//            }
////
////            $scope.updateFilter = function ()
////            {
////
////                updateAllFilters();
////            };
//
//            $scope.selectRow = function ()
//            {
//                removeDownloadLink();
//
//                $scope.gridApi.suppressEvents($scope.rowSelectionChanged, function () {
//                    $scope.gridApi.selection.clearSelectedRows();
//                });
//                var selCases = {};
//                selCases.nodes = eventService.getSelCases();
//                selectTable(selCases.nodes);
//            };
//
//            $scope.sortSelected = function (data)
//            {
//                $scope.gridOptions.data = data;
//            };
//
//            function removeDownloadLink()
//            {
//                // remove download link if any
//                var targetElm = $scope.gridOptions.exporterCsvLinkElement;
//                if ((targetElm[0]) && (angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')))) {
//                    angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')).remove();
//                }
//            }
//
//            function selectTable(graphdata)
//            {
//                angular.forEach(graphdata, function (data, gindex) {
//
//                    for (var i = 0; i < $scope.gridOptions.data.length; i++) {
//                        if ($scope.gridOptions.data[i].dbid === data.dbid) {
//
//                            if ($scope.gridApi != undefined)
//                                $scope.gridApi.suppressEvents($scope.rowSelectionChanged, function () {
//                                    $scope.gridApi.selection.selectRow($scope.gridOptions.data[i]);
//                                });
//
//                        }
//                    }
//                    ;
//
//                });
//            }
//
//
//            function reloadTable(newGraph)
//            {
//                var graph_data = [];
//                angular.copy(newGraph, graph_data);
//
//                $scope.cases = graph_data;
//                {
//                    $scope.gridOptions.data = graph_data;
//                }
//            }

        }
        )
        .directive('casetableVis', function ($timeout, publishSubscribeService, graphService, eventService, displayService, filterService) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var uid = elem.uniqueId();
                    scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
                    {
                         selectRow();
                        if (requestModuleID !== uid)
                        {
                            publishSubscribeService.publish(evt.currentScope.gridApi.grid.id);
                        }
                      
                    });

                    scope.$on('leftFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) === "left")
                        {
                            updateAllFilters(getPosition(elem[0]));
                        }
                    });

                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) === "right")
                        {
                            updateAllFilters(getPosition(elem[0]));
                        }
                    });

                    scope.$on('resetUI', function (evt, filter) {
                        //scope.$evalAsync(attrs.resetui);
                        resetUI();
                    });

                    scope.$on('filterUpdate', function (evt, filter, value)
                    {
                        updateAllFilters(getPosition(elem[0]));
                    });

                    scope.rowSelectionChanged = function (row)
                    {

                        var selRows = scope.gridApi.selection.getSelectedRows();
                        if (eventService.getUIMode() == 'multiselect')
                        {
                            if (selRows.length > 0)
                                eventService.setSelCases(selRows, uid);

                            else
                                eventService.setSelCases([], uid);
                        }
                        else if (eventService.getUIMode() == 'select')
                        {
                            if (row.isSelected)
                                eventService.setSelCases([row.entity], uid);

                            else
                                eventService.setSelCases([], uid);
                        }
                    };

                    scope.gridOptions.columnDefs = displayService.getCaseInfoFieldsGrid();
                    angular.forEach(scope.gridOptions.columnDefs, function (value, key) {
                        if (value.type && value.type === 'date')
                        {
                            value.sortingAlgorithm = function (a, b) {
                                var nulls = scope.gridApi.core.sortHandleNulls(a, b);
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
                    scope.cases = filterService.getFilteredCases(getPosition(elem[0]));
                    if (scope.cases != null)
//            if (graphService.getGraph())
                    {
                        reloadTable(scope.cases);
                        $timeout(function () {
                            var selCases = {};
                            selCases.nodes = eventService.getSelCases()
                            if (selCases.nodes && selCases.nodes.length > 0)
                                 selectRow();

                        });
                    }

                    scope.$watch(graphService.getGraph, function (newVal, oldVal)
                    {
                        var selCases = {};
                        selCases.nodes = eventService.getSelCases();
                        if (selCases.nodes && selCases.nodes.length > 0)
                            $timeout(function () {
                                 selectRow();
                            });
                        else if (newVal !== oldVal)
                            reloadTable(filterService.getFilteredCases(getPosition(elem[0])));

                    });

                    function resetUI()
                    {
                        reloadTable(graphService.getGraph().nodes);
                        scope.gridApi.selection.clearSelectedRows();
                    }
                    ;


                    function updateAllFilters(filterTimeline)
                    {
                        removeDownloadLink();
                        reloadTable(filterService.getFilteredCases(filterTimeline));
                        $timeout(function () {
                           selectRow();
                        });
                    }
//
//            scope.updateFilter = function ()
//            {
//
//                updateAllFilters();
//            };

                    function selectRow   ()
                    {
                        removeDownloadLink();

                        scope.gridApi.suppressEvents(scope.rowSelectionChanged, function () {
                            scope.gridApi.selection.clearSelectedRows();
                        });
                        var selCases = {};
                        selCases.nodes = eventService.getSelCases();
                        selectTable(selCases.nodes);
                        
                    };

                    scope.sortSelected = function (data)
                    {
                        scope.gridOptions.data = data;
                    };

                    function removeDownloadLink()
                    {
                        // remove download link if any
                        var targetElm = scope.gridOptions.exporterCsvLinkElement;
                        if ((targetElm[0]) && (angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')))) {
                            angular.element(targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')).remove();
                        }
                    }

                    function selectTable(graphdata)
                    {
                        angular.forEach(graphdata, function (data, gindex) {

                            for (var i = 0; i < scope.gridOptions.data.length; i++) {
                                if (scope.gridOptions.data[i].dbid === data.dbid) {

                                    if (scope.gridApi != undefined)
                                        scope.gridApi.suppressEvents(scope.rowSelectionChanged, function () {
                                            scope.gridApi.selection.selectRow(scope.gridOptions.data[i]);
                                        });

                                }
                            }
                            ;

                        });
                         
                    }


                    function reloadTable(newGraph)
                    {
                        var graph_data = [];
                        angular.copy(newGraph, graph_data);

                        scope.cases = graph_data;
                        {
                            scope.gridOptions.data = graph_data;
                        }
                    }


                }
            };
        })

        .directive('uiGridSelectionSelectAllButtons', ['uiGridSelectionService','publishSubscribeService',
            function (uiGridSelectionService, publishSubscribeService) {
                return {
                    replace: true,
                    restrict: 'E',
                    priority: 100,
                    //     template: $templateCache.get('ui-grid/selectionSelectAllButtons'),
                    //template :  "<div class=\"ui-grid-selection-row-header-buttons ui-grid-icon-ok\" ng-class=\"{'ui-grid-all-selected': grid.selection.selectAll}\" ng-click=\"headerButtonClick2($event)\">&nbsp;</div>",

                    scope: true,
                    link: function ($scope, $elm, $attrs, uiGridCtrl) {
                        var self = $scope.col.grid;
                        
                         function selectRows()
                        {
                             var selectedRows = uiGridSelectionService.getSelectedRows(self);
                            if (selectedRows.length > 0) {
//                                $scope.$evalAsync(function (self) {
                                self.options.data.sort(function (a, b) {
                                    var filteredCaseA = selectedRows.filter(function (cif) {

                                        return (cif.entity.dbid === a.dbid);
                                    });
                                    var filteredCaseB = selectedRows.filter(function (cif) {
                                        return (cif.entity.dbid === b.dbid);
                                    });
                                    if ((filteredCaseA.length > 0) && (a.dbid > b.dbid))
                                        return b.dbid - a.dbid;
                                    else if ((filteredCaseB.length > 0) && (a.dbid < b.dbid))
                                        return b.dbid - a.dbid;
                                    else
                                        return    a.dbid - b.dbid;
                                });
                            }
//                                )
                            self.resetColumnSorting();
                            self.options.useExternalSorting = true;
                            self.api.core.raise.sortChanged(self, self.getColumnSorting());
                        };
                        $scope.headerButtonClick = function (row, evt) {
                             selectRows();
                        };
                        
                        publishSubscribeService.subscribe($scope.col.grid.id,selectRows);
                        
                    }
                };
            }]);




