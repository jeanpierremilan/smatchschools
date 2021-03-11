


function url_base64_decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }
    if (!window.atob) {
        window.atob = function(str) {
            return Base64.decode(str);
        }
    }
    return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}

var API_URL = 'https://api.smatchfe.club/public/index.php?_url='//'http://localhost:8082/public/index.php?_url=' //
var APP_URL = 'https://centroestivo.smatchfe.club' //'http://localhost:82' //
var debug = false

var ngapp = angular.module('ngapp', ['ngRoute','ui.bootstrap', 'dialogs.main', 'dialogs.default-translations']);


ngapp.config(function($locationProvider, $routeProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider
            .when('/iscrizione', {
                controller: 'pageController',
                templateUrl: 'app/partials/iscrizione.html'
            })
			.when('/summervillage', {
                controller: 'ceController',
                templateUrl: 'app/partials/summervillage.html'
            })
            .when('/pagamento', {
                controller: 'payController',
                templateUrl: 'app/partials/pagamenti.html'
            })
            .when('/confermapagamento', {
                //controller: 'payController',
                templateUrl: 'app/partials/okpagamento.html'
            })
			.when('/pagamentoce', {
                controller: 'payController',
                templateUrl: 'app/partials/pagamenti.html'
            })
            .when('/confermapagamentoce', {
                //controller: 'payController',
                templateUrl: 'app/partials/okpagamento.html'
            })
			.otherwise({
                    redirectTo: '/summervillage'
            });
});

ngapp.directive('typeahead', ['$timeout', function($timeout) {
        return {
            restrict: 'AEC',
            scope: {
                items: '=',
                prompt: '@',
                title: '@',
                subtitle: '@',
                model: '=',
                onSelect: '&'
            },
            link: function(scope, elem, attrs) {
                scope.handleSelection = function(selectedItem) {
                    scope.model = selectedItem;
                    scope.current = 0;
                    scope.selected = true;
                    $timeout(function() {
                        scope.onSelect();
                    }, 200);
                };
                scope.current = 0;
                scope.selected = true;
                scope.isCurrent = function(index) {
                    return scope.current == index;
                };
                scope.setCurrent = function(index) {
                    scope.current = index;
                };
            },
            templateUrl: 'app/partials/templates/templateurl.html'
        }
    }]);

ngapp.controller('pageController', ['$scope', '$route','$rootScope','$http', '$window','$location','$timeout','dialogs', function($scope,$route,$rootScope, $http, $window ,$location,$timeout, dialogs) {
    
	var opt = {size:'sm'};
	var _progress = 33;
	$scope.tipocorso = 0;
	var _fakeWaitProgress = function() {
            $timeout(function() {
                if (_progress < 100) {
                    _progress += 33;
                    $rootScope.$broadcast('dialogs.wait.progress', {'progress': _progress});
                    _fakeWaitProgress();
                } else {
                    $rootScope.$broadcast('dialogs.wait.complete');
                }
            }, 1000);
        };
	
	
		$scope.dates = [
					{
						"id":"1",
						"day":"LUNEDI",
						"desc":"DAL 10-04 AL 26-06"
					},
					{
						"id":"2",
						"day":"MARTEDI",
						"desc":"DAL 11-04 AL 20-06"
					},
					{
						"id":"3",
						"day":"MERCOLEDI",
						"desc":"DAL 12-04 AL 14-06"
					},
					{
						"id":"4",
						"day":"GIOVEDI",
						"desc":"DAL 13-04 AL 15-06"
					},
					{
						"id":"5",
						"day":"VENERDI",
						"desc":"DAL 14-04 AL 23-06"
					}
				];
		  
		$scope.tesserato = false;  
		
		$scope.pref = false;
		$scope.dayweek = 0;
		
		$scope.userdata;
		$scope.setpref = function(pref) {
			$scope.pref = true;
			$scope.dayweek = pref;
		}
		
		$scope.insert = function(userdata) {
			
			
			
			if(userdata && (userdata.name != null && userdata.lastname != null && userdata.mobile != null && userdata.email != null) ) {
				userdata.amount = (userdata.tipocorso == 0 || userdata.tipocorso == 1) ? 150 : 200;
				userdata.dayweek = $scope.dayweek;
				var data = {userdata: userdata};
				
				var dlg = dialogs.wait('Inserimento dati', 'Attendere prego', _progress, opt);
				var req = $http({
						url: API_URL + '/api/mng/corsoadulti/create',
						data: data,
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$window.sessionStorage.type 	= 0;
							$window.sessionStorage.cost 	= deco.caecorsi.amount;
							$window.sessionStorage.email 	= deco.caeiscrizione.email;
							$window.sessionStorage.name 	= deco.caeiscrizione.name;
							$window.sessionStorage.lastname = deco.caeiscrizione.lastname;
							$window.sessionStorage.mobile 	= deco.caeiscrizione.mobile;
							$window.sessionStorage.token 	= data[0].token;
							$window.sessionStorage.id 		= deco.caeiscrizione.id;
							$window.sessionStorage.return	= API_URL + '/api/payment/cae/paypal';
							$window.sessionStorage.cancel_return	= APP_URL + '/corso-adulti.html#/pagamento';
							
							$window.location.href 			= "/corso-adulti.html#/pagamento";
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
					});

			} else {
				 var dlg1 = dialogs.error('Campi obbligatori mancanti', 'Attenzione, verifica i dati inseriti.',opt);
			}
			
		
		}
			
		
	
	}
]);
ngapp.controller('payController', ['$scope','$rootScope', '$http', '$window','$timeout','dialogs', function($scope, $rootScope,$http, $window,$timeout, dialogs) {
		var opt = {size:'sm'};
		var _progress = 33;
		var _fakeWaitProgress = function() {
                $timeout(function() {
                    if (_progress < 100) {
                        _progress += 33;
                        $rootScope.$broadcast('dialogs.wait.progress', {'progress': _progress});
                        _fakeWaitProgress();
                    } else {
                        $rootScope.$broadcast('dialogs.wait.complete');
                    }
                }, 1000);
			};
		
		$scope.token = $window.sessionStorage.token; 
			var encodedToken = $scope.token.split('.')[1];
			var deco = JSON.parse(url_base64_decode(encodedToken));
		$scope.type				 = $window.sessionStorage.type;
		$scope.tesserato 		 = $window.sessionStorage.tesseraali != 'N' ? true : false;	
		$scope.multiIscritti	 = deco.ceiscrizioneMulti;		
		$scope.amount			 = $window.sessionStorage.cost;
		$scope.idce				 = $window.sessionStorage.id;
		$scope.idweek			 = $window.sessionStorage.idweeks;
		$scope.weeks			 = deco.ceweeks;
		//alert($scope.weeks);
		$scope.name				 = '';
		$scope.email			 = $window.sessionStorage.email;
		$scope.lastname			 = '';
		$scope.mobile			 = $window.sessionStorage.mobile;
		$scope.datauser			 = $window.sessionStorage.id + '|' + $window.sessionStorage.email + '|' + $window.sessionStorage.mobile + '|' + $window.sessionStorage.name + '|' + $window.sessionStorage.lastname ;
		if($scope.type != undefined)
			$scope.datauser			 = $window.sessionStorage.id + '|' + $window.sessionStorage.idweeks + '|' + $window.sessionStorage.email + '|' + $window.sessionStorage.mobile + '|' + '' + '|' + '' ;
		
		$window.sessionStorage.datauser = $scope.datauser;
		$scope.return			 = $window.sessionStorage.return;
		$scope.cancel_return	 = $window.sessionStorage.cancel_return;
		$scope.weekamount		 = $window.sessionStorage.weekamount;
		$scope.desc				 = $window.sessionStorage.id;
		
		$scope.sendConfirmation = function() {
			var encodedToken = $scope.token.split('.')[1];
			var deco = JSON.parse(url_base64_decode(encodedToken));
			
			console.log(deco);
			$scope.receiver_id 	= deco.receipt_id;
			$scope.b_id 		= deco.b_id;
			$scope.item_name 	= deco.item_name;
			$scope.first_name	= deco.first_name;
			$scope.last_name 	= deco.last_name;
			$scope.email	 	= deco.email;
			$scope.phone	 	= deco.phone;
			$scope.payment_date = deco.created;
			$scope.mc_gross 	= deco.mc_gross;		
			
			var data = {token: $scope.token};
			var req = $http({
                    url: API_URL + '/api/payment/ce/receipt',
                    data: data,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                //'Content-Type': 'application/json'
                    }
                });
                req.success(function(data, status, headers, config) {
                    if (data[0].status != '200') {
                        if (debug)
                            console.log(data[0].message);
                    } else {
                        var encodedToken = data[0].token.split('.')[1];
                        var deco = JSON.parse(url_base64_decode(encodedToken));
                        
			          }
                });
                req.error(function(data, status, headers, config) {
                    if (debug)
                        console.log('error call api');
                    $scope.userdata = def;
                });
		
		}

		$scope.setbook = function(data) {
            var data = {token: $window.sessionStorage.token, data: data, databook: $scope.databook, bookid:$scope.book_id};
            var req = '';
                    req = $http({
                        url: API_URL + '/api/payment/ce/newpaypal',
                        data: data,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                    //'Content-Type': 'application/json'
                        }
					});
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							$scope.token=data[0].token;
							$window.sessionStorage.token = $scope.token;
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							
							console.log(deco);
							$email 	= deco.email;
							$mc_gross 	= deco.name;

							
							$window.location.href 			= "/summervillage.html#/confermapagamento";
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
					});
			
					
        } 
	}
]);
ngapp.controller('ceController', ['$scope', '$route','$rootScope','$http', '$window','$location','$timeout','dialogs', function($scope,$route,$rootScope, $http, $window ,$location,$timeout, dialogs) 
{
    
	var opt = {size:'sm'};
	var _progress = 33;
	
	var _fakeWaitProgress = function() 
	{
            $timeout(function() {
                if (_progress < 100) {
                    _progress += 33;
                    $rootScope.$broadcast('dialogs.wait.progress', {'progress': _progress});
                    _fakeWaitProgress();
                } else {
                    $rootScope.$broadcast('dialogs.wait.complete');
                }
            }, 1000);
    };
	
		$scope.numweek=0;
		$scope.tesserato=false;
		$scope.dates = [
					{
						"id":"1",
						"week":"1",
						"desc":"DAL 12-06 AL 16-06"
					},
					{
						"id":"2",
						"week":"2",
						"desc":"DAL 19-06 AL 23-06"
					},
					{
						"id":"3",
						"week":"3",
						"desc":"DAL 26-06 AL 30-06"
					},
					{
						"id":"4",
						"week":"4",
						"desc":"DAL 03-07 AL 07-07"
					},
					{
						"id":"5",
						"week":"5",
						"desc":"DAL 10-07 AL 14-07"
					},
					{
						"id":"6",
						"week":"6",
						"desc":"DAL 17-07 AL 21-07"
					},
					{
						"id":"7",
						"week":"7",
						"desc":"DAL 24-07 AL 28-07"
					},
					{
						"id":"8",
						"week":"8",
						"desc":"DAL 31-07 AL 04-08"
					},
					{
						"id":"9",
						"week":"9",
						"desc":"DAL 28-08 AL 01-09"
					},
					{
						"id":"10",
						"week":"10",
						"desc":"DAL 04-09 AL 08-09"
					}
				];
		  
		$scope.cedescweeks = '';  
		$scope.tesserato = false;  
		
		$scope.pref = false;
		$scope.dayweek = 0;
		
		$scope.dateweek = '';
		
		$scope.userdata;
		$scope.conf = false;
		
		$scope.iscritti = 1;
		
		$scope.setConf = function(status) {
			$scope.conf=status;
		}
		$scope.addIscritti = function()
		{
			if($scope.iscritti < 3)
				$scope.iscritti = +$scope.iscritti + +1;
		}
		$scope.flags = [
			{
				'id': 'Y',
				'desc':'SI'
			},
			{
				'id': 'N',
				'desc': 'NO'
			}
		];
		$scope.setWeek = function(index,week) {
				if(index && $scope.dateweek !== '')
					$scope.dateweek = $scope.dateweek + ',' + week; 
				else if(index && $scope.dateweek === '')
					$scope.dateweek = week; 
				else if($scope.dateweek !== ''){
					var arr = JSON.parse("[" + $scope.dateweek + "]");
					var index = arr.indexOf(week);
					if (index > -1) {
						arr.splice(index, 1);
						$scope.dateweek = arr.toString();
					}
				}
		}
		
		$scope.init = function() {
			var req = $http({
						url: API_URL + '/api/mng/cedescweeks',
						data: '',
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$scope.cedescweeks 	= deco.cedescweeks;
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 
					});
		}
		$scope.setpref = function(pref) {
			$scope.pref = true;
			$scope.dayweek = pref;
		}
		
		$scope.insert = function(userdata,date) {
						
			if(userdata && (userdata.name != null && userdata.lastname != null && userdata.mobile != null && userdata.email != null) ) {
				userdata.amount = $scope.numweek == 0 ? 120 : $scope.numweek == 1 ? 100 : 90;
				userdata.idweek=date;
				
				var data = {userdata: userdata};
				
				var dlg = dialogs.wait('Inserimento dati', 'Attendere prego', _progress, opt);
				var req = $http({
						url: API_URL + '/api/mng/summervillage/create',
						data: data,
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
							 var dlg1 = dialogs.error('Errore inserimento dati', data[0].message,opt);							
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$window.sessionStorage.type 	= 1;
							$window.sessionStorage.cost 	= deco.ceweeks.amount;
							$window.sessionStorage.email 	= deco.ceiscrizione.email;
							$window.sessionStorage.name 	= deco.ceiscrizione.name;
							$window.sessionStorage.lastname = deco.ceiscrizione.lastname;
							$window.sessionStorage.mobile 	= deco.ceiscrizione.mobile;
							$window.sessionStorage.token 	= data[0].token;
							$window.sessionStorage.id		= deco.ceweeks.idce;
							$window.sessionStorage.idweek	= deco.ceweeks.idweek;
							$window.sessionStorage.desc		= deco.cedescweek.description;
							$window.sessionStorage.weekamount	= deco.ceweeks.amount;
							$window.sessionStorage.return	= API_URL + '/api/payment/ce/paypal';
							$window.sessionStorage.cancel_return	= APP_URL + '/summervillage.html#/pagamento';
							$window.location.href 			= "/summervillage.html#/pagamento";
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
					});

			} else {
				 var dlg1 = dialogs.error('Campi obbligatori mancanti', 'Attenzione, verifica i dati inseriti.',opt);
			}
		}
			
		$scope.insertFirstWeek = function(userdata) {
						
			if(userdata && (userdata.name != null && userdata.lastname != null && userdata.mobile != null && userdata.email != null && $scope.dateweek !== '') ) {
				
				dtweek = JSON.parse("[" + $scope.dateweek + "]");
				
				userdata.amount = +120;
				
				userdata.intestataa = userdata.intestataa + ' - ' + userdata.cfali;

				if(dtweek.length > 1)
					dtweek = $scope.dateweek.split(',');
				if(dtweek.length == 2)
					userdata.amount = +220;
				
				if(dtweek.length > 2 )
					userdata.amount = !$scope.tesserato ? +120 + +100 + +30*(dtweek.length-2) : +120 + +100 + +90*(dtweek.length-2);
				
				userdata.idweek=dtweek;
				var data = {userdata: userdata};
				var dlg2 = dialogs.confirm('REGOLAMENTO GENERALE CENTRO ESTIVO  - MOMY SUMMER VILLAGE', 
											'<html><body><div><ol><li>Il prezzo settimanale del centro estivo è di €110 la prima settimana e €100 la seconda</li>' +
											'<li>La prima iscrizione prevede una quota assicurativa di €10</li>' +
											'<li>Dalla terza settimana frequentata il prezzo settimanale è di €90</li>' +
											'<li>L\'agevolazione FAMIGLIA prevede uno quota agevolata per fratelli/sorelle equivalente al 10% a partire dalla seconda settimana frequentata</li>' +
											'<li>L\'agevolazione FAMIGLIA e l\'agevolazione a partire dalla terza settimana frequentata non sono cumulabili</li>' +
											'<li>L\'iscrizione on-line prevede il pagamento per intero per le prime due settimane frequentate, dalla terza settimana prevede un acconto di €30<br />' +
											'Il saldo delle settimane prenotate con acconto va regolarizzato in segreteria presso il MOMY SPORT VILLAGE entro e non oltre il termine <br />' + 
											'dell\'ultima settimana frequentata (ES. Paolo frequenta la prima e la seconda settimana, ha versato €30 di acconto per la quinta settimana: il<br />' + 
											'saldo della quinta settimana va regolarizzato entro il termine della seconda settimana frequentata)</li>' +
											'<li>In caso di mancato saldo, nei termini previsti, delle settimane prenotate con acconto, la direzione non prenderà in considerazione l\'iscrizione<br />' + 
											'e l\'acconto (€30) verrà trattenuto. Per ulteriori info contattare la segreteria via mail momycentriestivi@gmail.com</li>' +
											'<li>Raggiunto il limite settimanale di iscritti il sistema on line non accetterà ulteriori adesioni<br />' + 
											'Chi fosse interessato ad essere inserito in un lista d\'attesa può comunicarlo all\'indirizzo mail segnalato in precedenza e verrà contattato per tempo<br />' + 
											'solo in caso di disponibilità</li>' +
											'<li>Al momento dell\'inserimento al centro estivo si prega di consegnare una copia della mail ricevuta in seguito ad iscrizione a pagamento on line</li></ol>' + 
											'<h3>Accetti il regolamento e l\'informativa sulla <a href="https://portal.smatchfe.club/privacy.html" target="_blank">privacy?</a></h3></div></body></html>',opt);
				dlg2.result.then(function(btn)
				{
					var dlg = dialogs.wait('Inserimento dati', 'Attendere prego', _progress, opt);
				
					var req = $http({
						url: API_URL + '/api/mng/summervillage/createmulti',
						data: data,
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
							var dlg1 = dialogs.error('Errore inserimento dati', data[0].message,opt);
							_fakeWaitProgress();
		
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$window.sessionStorage.token 	= data[0].token;
							$window.sessionStorage.type 	= 0;
							$window.sessionStorage.cost 	= userdata.amount;
							$window.sessionStorage.email 	= deco.ceiscrizione.email;
							$window.sessionStorage.name 	= deco.ceiscrizione.name;
							$window.sessionStorage.lastname = deco.ceiscrizione.lastname;
							$window.sessionStorage.mobile 	= deco.ceiscrizione.mobile;
							$window.sessionStorage.tesseraali 	= deco.ceiscrizione.tesseraali;
							$window.sessionStorage.id		= deco.ceiscrizione.id;
							$window.sessionStorage.idweeks		= $scope.dateweek;
							$window.sessionStorage.weekamount	= deco.ceweeks.amount;
							$window.sessionStorage.return	= API_URL + '/api/payment/ce/paypal';
							$window.sessionStorage.cancel_return	= APP_URL + '/summervillage.html#/pagamento';
							$window.location.href 			= "/summervillage.html#/pagamento";
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
					});
				},function(btn){
					var dlg1 = dialogs.error('Non è possibile andare avanti', 'Accettazione regolamento necessaria.',opt);
				});
				
			} else {
				 var dlg1 = dialogs.error('Campi obbligatori mancanti o errati', 'Attenzione, verifica i dati inseriti.',opt);
			}
		}
		
		$scope.insertFirstWeekMulti = function(userdata) {
			
			if( (($scope.iscritti == 1 && userdata.name != undefined && userdata.lastname != undefined && userdata.cf != undefined) ||
				($scope.iscritti == 2 && userdata.name2 != undefined && userdata.lastname2 != undefined && userdata.cf2 != undefined && userdata.lastname === userdata.lastname2) ||
				($scope.iscritti == 3 && userdata.name3 != undefined && userdata.lastname3 != undefined && userdata.cf3 != undefined && userdata.lastname === userdata.lastname2 && userdata.lastname === userdata.lastname3) )
				&& userdata.mobile != null && userdata.email != null && $scope.dateweek !== '') 
			{
				
				dtweek = JSON.parse("[" + $scope.dateweek + "]");
				
				userdata.amount = +120;
				userdata.intestataa = userdata.intestataa + ' - ' + userdata.cfali;
				
				if(dtweek.length > 1)
					dtweek = $scope.dateweek.split(',');
				if(dtweek.length == 2)
					userdata.amount = +210;
				
				if(dtweek.length > 2)
					userdata.amount = !$scope.tesserato ? +120 + +90 + +30*(dtweek.length-2) : +120 + +90 + +90*(dtweek.length-2);
					
				
				userdata.amount = +userdata.amount * +$scope.iscritti;
				userdata.idweek=dtweek;
				userdata.iscritti = $scope.iscritti;
				
				var data = {userdata: userdata};
				var dlg2 = dialogs.confirm('REGOLAMENTO GENERALE CENTRO ESTIVO  - MOMY SUMMER VILLAGE', 
											'<html><body><div><ol><li>Il prezzo settimanale del centro estivo è di €110 la prima settimana e €100 la seconda</li>' +
											'<li>La prima iscrizione prevede una quota assicurativa di €10</li>' +
											'<li>Dalla terza settimana frequentata il prezzo settimanale è di €90</li>' +
											'<li>L\'agevolazione FAMIGLIA prevede uno quota agevolata per fratelli/sorelle equivalente al 10% a partire dalla seconda settimana frequentata</li>' +
											'<li>L\'agevolazione FAMIGLIA e l\'agevolazione a partire dalla terza settimana frequentata non sono cumulabili</li>' +
											'<li>L\'iscrizione on-line prevede il pagamento per intero per le prime due settimane frequentate, dalla terza settimana prevede un acconto di €30<br />' +
											'Il saldo delle settimane prenotate con acconto va regolarizzato in segreteria presso il MOMY SPORT VILLAGE entro e non oltre il termine <br />' + 
											'dell\'ultima settimana frequentata (ES. Paolo frequenta la prima e la seconda settimana, ha versato €30 di acconto per la quinta settimana: il<br />' + 
											'saldo della quinta settimana va regolarizzato entro il termine della seconda settimana frequentata)</li>' +
											'<li>In caso di mancato saldo, nei termini previsti, delle settimane prenotate con acconto, la direzione non prenderà in considerazione l\'iscrizione<br />' + 
											'e l\'acconto (€30) verrà trattenuto. Per ulteriori info contattare la segreteria via mail momycentriestivi@gmail.com</li>' +
											'<li>Raggiunto il limite settimanale di iscritti il sistema on line non accetterà ulteriori adesioni<br />' + 
											'Chi fosse interessato ad essere inserito in un lista d\'attesa può comunicarlo all\'indirizzo mail segnalato in precedenza e verrà contattato per tempo<br />' + 
											'solo in caso di disponibilità</li>' +
											'<li>Al momento dell\'inserimento al centro estivo si prega di consegnare una copia della mail ricevuta in seguito ad iscrizione a pagamento on line</li></ol>' + 
											'<h3>Accetti il regolamento e l\'informativa sulla <a href="https://portal.smatchfe.club/privacy.html" target="_blank">privacy?</a></h3></div></body></html>',opt);
				dlg2.result.then(function(btn)
				{

					var dlg = dialogs.wait('Inserimento dati', 'Attendere prego', _progress, opt);
					var req = $http({
							url: API_URL + '/api/mng/summervillage/createmultiiscritti',
							data: data,
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
										//'Content-Type': 'application/json'
							}
						});
						req.success(function(data, status, headers, config) {
							if (data[0].status != '200') {
								if (debug)
									console.log(data[0].message);
								 var dlg1 = dialogs.error('Errore inserimento dati', data[0].message,opt);
								 _fakeWaitProgress();
							} else {
								_fakeWaitProgress();
						
								var encodedToken = data[0].token.split('.')[1];
								var deco = JSON.parse(url_base64_decode(encodedToken));
								$window.sessionStorage.token 	= data[0].token;
								$window.sessionStorage.type 	= 4;
								$window.sessionStorage.name 	= '';
								$window.sessionStorage.cost 	= userdata.amount;
								$window.sessionStorage.id		= deco.ceids.toString();
								$window.sessionStorage.idweeks	= $scope.dateweek;
								$window.sessionStorage.email 	= userdata.email;
								$window.sessionStorage.mobile 	= userdata.mobile;
								$window.sessionStorage.tesseraali 	= $scope.tesserato ? 'Y' : 'N';
								$window.sessionStorage.return	= API_URL + '/api/payment/ce/paypal';
								$window.sessionStorage.cancel_return	= APP_URL + '/summervillage.html#/pagamento';
								$window.location.href 			= "/summervillage.html#/pagamento";
							  }
						});
						req.error(function(data, status, headers, config) {
							if (debug)
								console.log('error call api');
								 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
						});
				},function(btn){
						var dlg1 = dialogs.error('Non è possibile andare avanti', 'Accettazione regolamento necessaria.',opt);
					});
		
			} else {
				 var dlg1 = dialogs.error('Campi obbligatori mancanti o errati', 'Attenzione, i fratelli e/o sorelle devono avere lo stesso cognome.',opt);
			}
		}
		
		$scope.getPayments = function(cf) {
			var req = $http({
						url: API_URL + '/api/mng/centroestivo/payments',
						data: {cf:cf},
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							
							if(deco.ceweeks != undefined)
							{
								$scope.idce = deco.idce;
								$scope.dapagare = deco.dapagare;
								$scope.ceweeksbycf 	= deco.ceweeks;
								console.log($scope.ceweeksbycf);
								console.log($scope.dapagare);
								$scope.conf = $scope.ceweeksbycf.length > 0 ? true : false;
								$scope.privacy = deco.privacy;
								$scope.message= !$scope.conf ? 'Codice Fiscale Sbagliato o Iscrizione Cancellata' : null;
							} else
								$scope.message= !$scope.conf ? 'Codice Fiscale Sbagliato o Iscrizione Cancellata' : null;
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 
					});
		
		}
		
		$scope.getPrivacy = function(cf) {
			var req = $http({
						url: API_URL + '/api/mng/centroestivo/getprivacy/' + cf,
						data: '',
						method: 'PUT',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							
							if(deco.ceweeks != undefined)
							{
								$scope.ceweeksbycf 	= deco.ceweeks;
								$scope.conf = $scope.ceweeksbycf.length > 0 ? true : false;
								$scope.privacy = deco.privacy;
								$scope.message= !$scope.conf ? 'Codice Fiscale Sbagliato o Iscrizione Cancellata' : null;
							} else
								$scope.message= !$scope.conf ? 'Codice Fiscale Sbagliato o Iscrizione Cancellata' : null;
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 
					});
		
		}

		$scope.setPrivacyDropOff = function(privacy) {
			var dlg2 = dialogs.confirm('Attenzione operazione irreversibile','Sei proprio sicuro di chiudere il tuo profilo?',opt);
			dlg2.result.then(function(btn){
				var data = {token: $window.sessionStorage.token, privacy: privacy, dropoff:'y'};
				if (debug)
					console.log(userdata);

				var req = $http({
					url: API_URL + '/api/mng/centroestivo/setprivacy/' + privacy.idce,
					data: data,
					method: 'PUT',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
								//'Content-Type': 'application/json'
					}
				});
				req.success(function(data, status, headers, config) {
					if (data[0].status != '200') {
						if (debug)
							console.log(data[0].message);
						var dlg2 = dialogs.error('Ops aggiornamento non riuscito');
					}
					else {
						var dlg2 = dialogs.notify('Aggiornamento riuscito', 'Abbiamo aggiornato la tua privacy come richiesto', opt);
						
					}
				});

				req.error(function(data, status, headers, config) {
					if (debug)
						console.log(data.message);
				});
			},function(btn){
				dialogs.notify('Attenzione operazione irreversibile','Hai scelto di non aggiornare',opt);
			});    
			
		}

		$scope.setPrivacy = function(privacy) {
				var data = {token: $window.sessionStorage.token, privacy: privacy};
				if (debug)
					console.log(userdata);

				var req = $http({
					url: API_URL + '/api/mng/centroestivo/setprivacy/' + privacy.idce,
					data: data,
					method: 'PUT',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
								//'Content-Type': 'application/json'
					}
				});
				req.success(function(data, status, headers, config) {
					if (data[0].status != '200') {
						if (debug)
							console.log(data[0].message);
						var dlg2 = dialogs.error('Ops aggiornamento non riuscito');
					}
					else {
						var dlg2 = dialogs.notify('Aggiornamento riuscito', 'Abbiamo aggiornato la tua privacy come richiesto', opt);
						
					}
				});

				req.error(function(data, status, headers, config) {
					if (debug)
						console.log(data.message);
				});
		}

		$scope.checkcf = function(cf) {
			var req = $http({
						url: API_URL + '/api/mng/centroestivo/checkcf/' + cf,
						data: '',
						method: 'PUT',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].message);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$scope.ceweeksbycf 	= deco.ceweeks;
							$scope.conf = $scope.ceweeksbycf.length > 0 ? true : false;
							$scope.message= !$scope.conf ? 'Codice Fiscale Sbagliato o Iscrizione Cancellata' : null;
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 
					});
		
		}
	
		$scope.insertMoreWeek = function(cf,date, weeks) {
			if(cf != null && date != null ) {
				
				var amount = $scope.numweek == 0 ? 120 : ($scope.numweek == 1 || weeks == 1 )? 100 : 90;
				var data = {userdata: {cf:cf,idweek:date,amount:amount}};
				
				var dlg = dialogs.wait('Inserimento dati', 'Attendere prego', _progress, opt);
				var req = $http({
						url: API_URL + '/api/mng/summervillage/createmore',
						data: data,
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									//'Content-Type': 'application/json'
						}
					});
					_fakeWaitProgress();
					req.success(function(data, status, headers, config) {
						if (data[0].status != '200') {
							if (debug)
								console.log(data[0].exception);
							var dlg1 = dialogs.error('Errore inserimento dati', data[0].exception,opt);
						} else {
							var encodedToken = data[0].token.split('.')[1];
							var deco = JSON.parse(url_base64_decode(encodedToken));
							$window.sessionStorage.type 	= 2;
							$window.sessionStorage.cost 	= deco.ceweeks.amount;
							$window.sessionStorage.email 	= deco.ceiscrizione.email;
							$window.sessionStorage.name 	= deco.ceiscrizione.name;
							$window.sessionStorage.lastname = deco.ceiscrizione.lastname;
							$window.sessionStorage.mobile 	= deco.ceiscrizione.mobile;
							$window.sessionStorage.token 	= data[0].token;
							$window.sessionStorage.id		= deco.ceweeks.idce;
							$window.sessionStorage.tesseraali 	= $scope.tesserato ? 'Y' : 'N';
							$window.sessionStorage.idweeks	= +deco.ceweeks.idweek - 1;
							$window.sessionStorage.weekamount	= deco.ceweeks.amount;
							$window.sessionStorage.desc 	= deco.cedescweek.description;
							$window.sessionStorage.return	= API_URL + '/api/payment/ce/paypal';
							$window.sessionStorage.cancel_return	= APP_URL + '/summervillage.html#/pagamento';
							$window.location.href 			= "/summervillage.html#/pagamento";
						  }
					});
					req.error(function(data, status, headers, config) {
						if (debug)
							console.log('error call api');
							 var dlg1 = dialogs.error('Errore inserimento dati', 'Si prega di riprovare pi&ugrave tardi',opt);
					});

			} else {
				 var dlg1 = dialogs.error('Campi obbligatori mancanti', 'Attenzione, verifica i dati inseriti.',opt);
			}
		}
}
]);
