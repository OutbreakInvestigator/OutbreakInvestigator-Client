/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/

angular.module('obiUiApp')
        .controller("FiltersCtrl", function ($scope, $http, $timeout, customFilter, graphService, displayService, eventService, filterService) {
            $scope.uid;
            $scope.gender;
            $scope.rangeStart;
            $scope.rangerEnd;
            $scope.customFilter = customFilter;
            $scope.filters = [];

            $scope.multiSelect = {};
            $scope.multiSelect.data = [];
            $scope.slider = {};
            $scope.slider.modelMin = [];
            $scope.slider.modelMax = [];
            $scope.slider.min = [];
            $scope.slider.max = [];

//
//            $(function () {
//                $("#slider-range").slider({
//                    range: true,
//                    min: 0,
//                    max: 100,
//                    values: [0, 100],
//                    stop: function (event, ui) {
//                        $("#age").val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
//                        $scope.rangeStart = ui.values[ 0 ];
//                        $scope.rangerEnd = ui.values[ 1 ];
//                        filterService.setAge($scope.rangeStart, $scope.rangerEnd);
//                    }
//                });
//
//            });
            $scope.$on('resetUI', function (evt, filter) {
//                $("#age").val($("#slider-range").slider("option", "min") + " - " + $("#slider-range").slider("option", "max"));
//                $("#slider-range").slider("values", 0, $("#slider-range").slider("option", "min"));
//                $("#slider-range").slider("values", 1, $("#slider-range").slider("option", "max"));
//                filterService.setAge($("#slider-range").slider("option", "min"), $("#slider-range").slider("option", "max"));
//                $("label[btn-radio=\"'Both'\"]").addClass('active');
//                $("label[btn-radio=\"'Male'\"]").removeClass('active');
//                $("label[btn-radio=\"'Female'\"]").removeClass('active');
//                $scope.rangeStart = {};
//                $scope.rangerEnd = {};
//                filterService.setGender('Both');

                filterService.resetAllFilters();

                $timeout(function () {
                    $scope.customFilter.removeAll();
                    $scope.myFilter = {};
                    $scope.filters = [];
                });


            });
            $scope.gender = 'Both';
            $scope.loaded = function () {
                return graphService.getGraph() !== undefined;
            };


            $scope.changeSelection = function (index, item)
            {
                $scope.customFilter.updateFilter(index, null, null, $scope.multiSelect.data[index]);
            };
            $scope.addItem = function () {

                $scope.customFilter.add(
                        $scope.myFilter
                        );
                if (filterService.getFilterType($scope.myFilter) === "slider")
                {
                    $scope.slider.modelMin[$scope.customFilter.getFilters().length - 1] = Math.min.apply(null, filterService.getAllFilterValues($scope.myFilter));
                    $scope.slider.modelMax[$scope.customFilter.getFilters().length - 1] = Math.max.apply(null, filterService.getAllFilterValues($scope.myFilter));
                    $scope.slider.min[$scope.customFilter.getFilters().length - 1] = $scope.slider.modelMin[$scope.customFilter.getFilters().length - 1] ;
                    $scope.slider.max[$scope.customFilter.getFilters().length - 1] = $scope.slider.modelMax[$scope.customFilter.getFilters().length - 1];
                }
                $scope.myFilter = {};
            };


            $scope.deleteItem = function (name, index) {
                $scope.customFilter.remove(name, index);
                $scope.multiSelect.data[index] = {};
            };
            $scope.toggleMultiSelect = function (name, index) {

                $scope.customFilter.show(name, index, 'multiselect');
            };
            $scope.toggleRadio = function (name, index) {
                $scope.customFilter.show(name, index, 'radio');
            };
            $scope.toggleSlider = function (name, index) {
                $scope.customFilter.show(name, index, 'slider');
                $scope.slider.modelMin[index] = Math.min.apply(null, filterService.getAllFilterValues(name));
                $scope.slider.modelMax[index] = Math.max.apply(null, filterService.getAllFilterValues(name));
                $scope.slider.min[$scope.customFilter.getFilters().length - 1] = $scope.slider.modelMin[index];
                $scope.slider.max[$scope.customFilter.getFilters().length - 1] = $scope.slider.modelMax[index];
                
                $scope.customFilter.checkNumeric(name);
            };
            $scope.updateSlider = function (slidertype, index, value)
            {
                if (value !== '')
                {
                    if ((slidertype === 'max'))
                        $scope.slider.modelMax[index] = value;
                    if ((slidertype === 'min'))
                        $scope.slider.modelMin[index] = value;

                    $scope.customFilter.updateFilter(index, $scope.slider.modelMin[index], $scope.slider.modelMax[index], null);
                }
            };

            // called by directive
            this.changeSlider = function (slidertype, index, value)
            {
//                if (($scope.slider.modelMin[index] <= value) && (slidertype === 'max'))
                $scope.updateSlider(slidertype, index, value);
            };


        })
//        .directive('genderCheck', ['graphService', 'filterService', function (graphService, filterService) {
//                return {
//                    restrict: 'A',
//                    link: function (scope, element, attrs, ngModel) {
//                        scope.updatefilter = function (evt)
//                        {
//                            filterService.setGender(scope.gender);
//                        }
//
//                    }
//                }
//            }])
//        .directive('ageCheck', ['eventService', 'graphService', function (eventService, graphService) {
//                return {
//                    restrict: 'A',
//                    scope: true,
//                    link: function (scope, element, attrs, ngModel) {
//                        scope.updatefilter = function (evt)
//                        {
//                            // graphService.filterGender(scope.gender);
//                            eventService.rebroadcastFilterUpdate('gender', scope.gender);
//                        }
//                    }
//                }
//            }])
//        .directive('inputCheck', ['eventService', 'graphService', function (eventService, graphService) {
//                return {
//                    restrict: 'A',
//                    require: 'ngModel',
//                    link: function (scope, element, attrs, ngModel) {
//                        element.bind('blur', function (e) {
//                            if (!ngModel || !element.val())
//                                return;
//                            var keyProperty = scope.$eval(attrs.wcUnique);
//                            var currentValue = element.val();
//                            console.log(keyProperty + ' ' + currentValue);
//                            //scope.updateFilter();
//
//                            scope.$evalAsync(attrs.updatefilter);
//
//                            scope.updatefilter = function (evt)
//                            {
//                                graphService.filterGender(scope.gender);
//                            }
//
//                        });
//                    }
//                }
//            }])

        .directive('buttonsRadio', function (filterService) {
            return {
                restrict: 'E',
                scope: {model: '=', options: '='},
                //require: 'ngModel',
                controller: function ($scope) {
                    $scope.activate = function (option) {
                        $scope.model = option;
                        filterService.toggleFilter($scope.$parent.item.title, $scope.model === 'All' ? null : $scope.model);
                    };
                    // $scope.model = 'All';
                    $scope.options = filterService.getAllFilterValues($scope.$parent.item.title);
                    //  $scope.options.splice(0, 0, 'All');
                },
//                template: "<button type='checkbox' class='btn btn-primary' " +
//                        "ng-class='{active: option == model }'" +
//                        "ng-repeat='option in options' " +
////                         "ng-attr-name={{item.title}}"+
//
//                        "ng-click='activate(option)'>{{option}} " +
//                        "</button>"
                template: "<label  class='btn btn-primary'  ng-repeat='option in options' ng-click='activate(option)' >" +
                        "<input type='checkbox' autocomplete='off'" +
//                        "ng-class='{active: option == model }'" +

//                         "ng-attr-name={{item.title}}"+

//                        "ng-click='activate(option)'"+
                        ">{{option}} " +
                        "</label>"
//              ,
//              link: function (scope, element, attrs, ngModel) {
//                        element.bind('blur', function (e) {
//                            if (!ngModel || !element.val())
//                                return;
//                            var keyProperty = scope.$eval(attrs.wcUnique);
//                            var currentValue = element.val();
//                            console.log(keyProperty + ' ' + currentValue);
//                            //scope.updateFilter();
//
//                            scope.$evalAsync(attrs.updatefilter);
//
//                            scope.updatefilter = function (evt)
//                            {
//                                graphService.filterGender(scope.gender);
//                            }

//                            dataService.checkUniqueValue(keyProperty.key, keyProperty.property, currentValue)
//                                    .then(function (unique) {
//                                        //Ensure value that being checked hasn't changed
//                                        //since the Ajax call was made
//                                        if (currentValue == element.val()) {
//                                            ngModel.$setValidity('unique', unique);
//                                        }
//                                    }, function () {
//                                        //Probably want a more robust way to handle an error
//                                        //For this demo we'll set unique to true though
//                                        ngModel.$setValidity('unique', true);
//                                    });
//                        });
//                    }
            };
        })
        .directive('onChange', function () {
            return {
                restrict: 'A',
                require: "^ngController",
                scope: {'onChange': '=',
                    index: '@',
                    slidertype: '@'
                },
                link: function (scope, elm, attrs, filterCrl) {
                    scope.$watch('onChange', function (nVal) {
                        elm.val(nVal);
                    });
                    elm.bind('blur', function () {
                        var currentValue = elm.val();
                        if (scope.onChange !== currentValue) {
                            scope.$apply(function () {
                                filterCrl.changeSlider(scope.slidertype, scope.index, currentValue);
                                scope.onChange = currentValue;

                            });
                        }
                    });
                }
            };
        });


        