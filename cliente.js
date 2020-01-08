angular.module('PkuyApp', ['ngMaterial'])

  .controller('main', function ($scope, $mdDialog, $mdBottomSheet) {
    console.debug(".controller('cliente')");

    $scope.onLoaded = function () {
      // Actualizar Vista
      $scope.pkuyLoading = false;
      $scope.$apply();
    }

    $scope.pkuyLoading = true;

    PkuyApp.startPkuyDB($scope.onLoaded);

    $scope.appMenu = [{
      titulo: '0.Sistema',
      entradas: [
        { titulo: 'Acceder y autorizar', do: function () { PkuyApp.handleAuthClick() } },
        { titulo: 'Desconectar', do: function () { PkuyApp.handleSignoutClick() } },
        { titulo: 'Iniciar PkuyApp', do: function () { PkuyApp.startPkuyDB() } }
      ]
    },
    {
      titulo: '1.Consultas',
      entradas: [
        { titulo: 'Cargar Contactos', do: function () { PkuyApp.listarContactos() } },
        { titulo: 'Listado de Contactos', do: function ($event) { $scope.showListadoClientes($event) } },
        { titulo: 'Gritar', do: function () { alert('ahhhhhhhh!!!') } }
      ]
    },
    {
      titulo: 'X.Admin',
      entradas: [
        { titulo: 'Borrar localStorage', do: function () { localStorage.clear() } }
      ]
    }
    ]

    $scope.showPrompt = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt()
        .title('Bienvenidx!')
        .textContent('Contanos como te sentís hoy ' + PkuyApp.currentUser.nombre)
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

    $scope.showListadoClientes = function (ev) {
      $mdDialog.show({
        controller: 'dialogController',
        templateUrl: 'listadoClientes.tmpl.html',
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

  .controller('dialogController', function ($scope, $mdDialog) {
    console.debug(".controller('DialogController')");

    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };


    //TODO: Pasar a PKuy.js!
    $scope.importarContactos = function (contactos) {
      selContactos = contactos.filter(contacto => contacto.selected && !contacto.cliID);
      if (!selContactos.length) {
        alert('No se seleccionaron Contactos');
        return;
      }
      const contacto = selContactos.shift();
      let nuevaDireccion = new cl_direccion({
        tel: contacto.telefono,
        email: contacto.email
      });
      PkuyApp.appendObjToSheetTable(nuevaDireccion, cl_maestroDirecciones.sheetName(), true, function (dirUpdatedData) {
        // importarContactos.appendDir.callback
        let nuevoCliente = new cl_cliente({
          nombre: contacto.nombre,
          dirID: dirUpdatedData.values[0][0],
          resourceName: contacto.resourceName
        });
        PkuyApp.appendObjToSheetTable(nuevoCliente, cl_maestroClientes.sheetName(), true, function (cliUpdatedData) {
          // importarContactos.appendCli.callback
          PkuyApp.log('Cliente Nro.' + cliUpdatedData.values[0][0] + ' creado con dirección ' + dirUpdatedData.values[0][0]);
          if (selContactos.length)
            $scope.importarContactos(selContactos);
          else {
            PkuyApp.log("Importación de Clientes desde Google Contactos: Finalizada")
            $mdDialog.hide();
          }
        })
      });
    }


    $scope.toggleSelectAll = function () {
      $scope.contactos.forEach(element => {
        element.selected = !element.selected;
      });
    }

    $scope.mode = 'Visualizando';
    $scope.titulo = 'Importar Clientes';
    $scope.currentUser = PkuyApp.currentUser;
    $scope.contactos = [];

    // PkuyApp.contactos.forEach(function (contacto, index)
    for (let index = 0; index < PkuyApp.contactos.length; index++) {
      const contacto = PkuyApp.contactos[index];
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
      if (PkuyApp.testMode && $scope.contactos.length > 20) break; // TEST!!!
    };

  });