angular.module('PkuyApp', ['ngMaterial'])

  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('orange')
      .dark();
  })

  .factory('PkuyLink', function () {
    return PkuyApp;
  })

  .controller('main', function ($scope, $rootScope, $mdDialog, PkuyLink) {

    // StartUp
    $rootScope.pkuyLoading = true;
    
    $scope.onLoaded = function () {
      // Actualizar Vista
      $rootScope.pkuyLoading = false;
      $rootScope.currentUser = PkuyLink.currentUser;
      $scope.$apply();
    }
    PkuyLink.startPkuyDB($scope.onLoaded);

    // Menus
    $scope.appMenu = [
      {
        titulo: '0.Sistema',
        entradas: [
          { titulo: 'Conectar con Google', do: function () { PkuyLink.handleAuthClick() } },
          { titulo: 'Desconectar', do: function () { PkuyLink.handleSignoutClick() } },
          { titulo: 'Iniciar PkuyApp', do: function () { PkuyLink.startPkuyDB() } }
        ]
      },
      {
        titulo: '1.Consultas',
        entradas: [
          { titulo: 'Actualizar Contactos Google', do: function () { PkuyLink.cargarContactosGoogle(true) } },
          { titulo: 'Importar Clientes desde Contactos Google', do: function ($event) { $scope.dialogImportarClientes($event) } },
          {
            titulo: 'Un submenu', subentradas: [
              { titulo: 'Loading', do: function () { $rootScope.lo() } },
              { titulo: 'Stop Loading', do: function () { $rootScope.slo() } },
            ]
          }
        ]
      },
      {
        titulo: 'X.Admin',
        entradas: [
          { titulo: 'Borrar localStorage', do: function () { localStorage.clear() } },
          { titulo: 'BackUp PkuyDB', do: function () { PkuyLink.backupPkuyDB() } }
        ]
      }
    ];

    // Loading
    $rootScope.lo = function () {
      $rootScope.pkuyLoading = true;
      // $scope.$apply();
    };

    // Stop Loading
    $rootScope.slo = function () {
      $rootScope.pkuyLoading = false;
      // $scope.$apply();
    };

    $scope.showPrompt = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt()
        .title('Bienvenidx!')
        .textContent('Contanos como te sentís hoy ' + PkuyLink.currentUser.nombre)
        .placeholder('Hoy me siento')
        .ariaLabel('Hoy me siento')
        .targetEvent(ev)
        .required(true)
        .ok('Dale')
        .cancel('No me interesa');

      $mdDialog.show(confirm).then(function (result) {
        $scope.status = 'You decided to name your dog ' + result + '.';
      }, function () {
        $scope.status = 'You didn\'t name your dog.';
      });
    };

    $scope.dialogImportarClientes = async function (ev) {

      await PkuyLink.cargarContactosGoogle();

      $mdDialog.show({
        controller: 'dialogController',
        templateUrl: 'importarClientes.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: true
      })
        .then(function (answer) {
          // console.log("[Ok] Dialogo Cerrado = " + answer);
        }, function () {
          // console.log("[Ok] Dialogo Cancelado");
        });
    };

  })

  .controller('dialogController', function ($scope, $rootScope, $mdDialog, PkuyLink) {

    //TODO: Pasar a PKuy.js!
    $scope.importarContactos = async function (contactos) {
      selContactos = contactos.filter(contacto => contacto.selected && !contacto.cliID);
      if (!selContactos.length) {
        alert('No se seleccionaron Contactos');
        return;
      }
      $rootScope.lo();
      
      while (selContactos.length !== 0) {
        const contacto = selContactos.shift();
        
        let nuevoCliente = new cl_cliente({
          nombre: contacto.nombre,
          resourceName: contacto.resourceName
        });
        
        let nuevaDireccion = new cl_direccion({
          tel: contacto.telefono,
          email: contacto.email
        });
        
        var clienteCreado = await PkuyLink.nuevoCliente(nuevoCliente, nuevaDireccion);
        PkuyLink.log('Cliente Nro.' + clienteCreado.cliID + ' creado con dirección ' + clienteCreado.dirID);
      }
      
      PkuyLink.log("Importación de Clientes desde Google Contactos: Finalizada")
      
      $rootScope.slo();
      $mdDialog.hide();
    }
    
    $scope.mode = 'Contactos de Google';
    $scope.titulo = 'Importar Clientes';
    $scope.contactos = [];

    $scope.toggleSelectAll = function () {
      $scope.contactos.forEach(element => {
        element.selected = !element.selected;
      });
    }

    // PkuyLink.contactos.forEach(function (contacto, index)
    for (let index = 0; index < PkuyLink.contactos.length; index++) {
      const contacto = PkuyLink.contactos[index];
      let nuevoContacto = new Object();
      nuevoContacto.index = index;
      nuevoContacto.selected = false;
      nuevoContacto.resourceName = contacto.resourceName;
      nuevoContacto.nombre = contacto.names != undefined ? contacto.names[0].displayName : '';
      nuevoContacto.email = contacto.emailAddresses != undefined ? contacto.emailAddresses[0].value : '';
      nuevoContacto.telefono = contacto.phoneNumbers != undefined ? contacto.phoneNumbers[0].canonicalForm : '';
      nuevoContacto.cliID = contacto.cliID != undefined ? contacto.cliID : '';
      if ((nuevoContacto.nombre != '' && nuevoContacto.telefono == '' && nuevoContacto.email == '') ||
        (nuevoContacto.nombre == '' && nuevoContacto.telefono != '' && nuevoContacto.email == '') ||
        (nuevoContacto.nombre == '' && nuevoContacto.telefono == '' && nuevoContacto.email != '')) continue;
      $scope.contactos.push(nuevoContacto);
      if (PkuyLink.testMode && $scope.contactos.length > 20) break; // TODO TEST!!!
    };

  });