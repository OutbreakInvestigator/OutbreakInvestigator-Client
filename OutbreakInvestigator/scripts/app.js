'use strict';

angular.module('obiUiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'leaflet-directive',
  'ui.grid', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.autoResize', 'ui.grid.exporter'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve:{
            'DisplayServiceData':function(displayService){
                return displayService.promise;
            }
        }
      })
        /*
        .when('/network', {
            templateUrl: 'views/network.html',
            controller: 'NetworkCtrl'
        })*/
      .otherwise({
        redirectTo: '/'
      });
  });
