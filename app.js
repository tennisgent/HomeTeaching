(function(){

    angular.module('HomeTeachingApp', ['firebase','ngRoute','ngDraggable'])

        .constant('Urls', {
            firebase: 'https://hometeaching.firebaseio.com',
            contacts: '/contacts',
            comps: '/companionships'
        })

        .config(['$routeProvider', 'Urls', function($routeProvider, urls){
            $routeProvider
                .when(urls.contacts, {
                    controller: 'ContactsController',
                    controllerAs: 'ctrl',
                    templateUrl: '/contacts.html'
                })
                .when(urls.comps, {
                    controller: 'CompanionshipsController',
                    controllerAs: 'ctrl',
                    templateUrl: '/companionships.html'
                })
                .otherwise({
                    redirectTo: urls.contacts
                })
        }])

        .factory('FirebaseRef', ['Urls', function(urls){
            return new Firebase(urls.firebase);
        }])

        .controller('ContactsController', ['$scope', '$firebase', 'Urls', 'FirebaseRef',
            function($scope, $firebase, urls, ref){
                var contacts = $firebase(ref.child('contacts'));

                this.contacts = contacts.$asObject();

                this.addContact = function(data){
                    contacts.$push(data).then(function(resp){
                        console.log('added contact', resp);
                    });
                };

            }
        ])

        .controller('CompanionshipsController', ['$scope', '$firebase', 'Urls', 'FirebaseRef', '$window',
            function($scope, $firebase, urls, ref, $window){
                var vm = this,
                    contacts = $firebase(ref.child('contacts')),
                    comps = $firebase(ref.child('companionships'));

                vm.companionships = comps.$asArray();
                vm.contacts = contacts.$asArray();
                vm.contactsAsObject = {};

                vm.contacts.$loaded().then(function(data){
                    angular.forEach(data, function(contact){
                        if(typeof contact === 'object'){
                            vm.contactsAsObject[contact.$id] = contact;
                        }
                    });
                });

                var baseComp = {comps: [], families: []};

                vm.newComp = angular.copy(baseComp);

                vm.onCompanionDrop = function onCompanionDrop(comp){
                    if(vm.isAssignedToFamily(comp)){
                        $window.alert(comp.firstName + ' ' + comp.lastName + ' is already assigned to a companionship.');
                    }else{
                        vm.newComp.comps.push(comp);
                    }
                };

                vm.saveCompanionship = function saveCompanionship(){
                    var newComp = angular.copy(baseComp);
                    angular.forEach(this.newComp.comps, function(comp){
                        newComp.comps.push(comp.$id);
                    });
                    angular.forEach(this.newComp.families, function(fam){
                        newComp.families.push(fam.$id);
                    });
                    comps.$push(newComp).then(function(){
                        vm.newComp = angular.copy(baseComp);
                    });
                };

                vm.isAssignedToFamily = function isAssignedToFamily(comp){
                    for(var i=0; i<vm.companionships.length; i++){
                        if(vm.companionships[i].comps.indexOf(comp.$id)){
                            return true;
                        }
                    }
                    return false;
                }

            }
        ])

})();