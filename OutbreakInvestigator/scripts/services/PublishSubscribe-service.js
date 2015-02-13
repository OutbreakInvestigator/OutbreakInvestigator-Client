/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .service('publishSubscribeService', function(){
            var selectionListeners={};
            
            return{
                publish: function(id,args)
                {
                    angular.forEach(Object.keys(selectionListeners),function(key)
                    {
                         if(key===(id+'')) 
                         {  
                             if(args !== undefined)
                                 selectionListeners[key](args);
                             else
                                selectionListeners[key]();
                            
                             return;
                         }                     
                    });
                },
                subscribe: function(id,listenerFunction)
                {
                    selectionListeners[id+'']=listenerFunction;
            
                }
            }
});


         