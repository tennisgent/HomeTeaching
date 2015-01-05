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

        .controller('ContactsController', ['$scope', '$firebase', 'Urls',
            function($scope, $firebase, urls){
                var ref = new Firebase(urls.firebase);
                var contacts = $firebase(ref.child('contacts'));

                this.contacts = contacts.$asObject();

                this.addContact = function(data){
                    contacts.$push(data).then(function(resp){
                        console.log('added contact', resp);
                    });
                };

            }
        ])

        .controller('CompanionshipsController', ['$scope', '$firebase', 'Urls',
            function($scope, $firebase, urls){
                var vm = this,
                    ref = new Firebase(urls.firebase),
                    contacts = $firebase(ref.child('contacts')),
                    comps = $firebase(ref.child('companionships'));

                vm.companionships = comps.$asArray();
                vm.contacts = contacts.$asArray();
                vm.contactsAsObject = {};

                vm.contacts.$loaded().then(function(data){
                    angular.forEach(data, function(contact){
                        if(typeof contact === 'object')
                            vm.contactsAsObject[contact.$id] = contact;
                    });
                    console.log(vm.contactsAsObject);
                });

                var baseComp = {comps: [], families: []};

                vm.newComp = angular.copy(baseComp);

                vm.onCompanionDrop = function(comp){
                    vm.newComp.comps.push(comp);
                };

                vm.saveCompanionship = function(){
                    var newComp = {comps: [], families: []};
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

            }
        ])

})();