angular.module('PkuyApp', ['ngMaterial'])

  .controller('cliente', function ($scope, $mdDialog, $mdBottomSheet) {
    console.log(".controller('cliente')");

    $scope.onLoaded = function () {
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
          console.log("[Ok] Dialogo Cerrado = " + answer);
        }, function () {
          console.log("[Ok] Dialogo Cancelado");
        });
    };

    $scope.cargarConsola = function () {
      console.log("cargarConsola()");

      $mdBottomSheet.show({
        templateUrl: 'bottom-sheet-template.html',
        controller: 'bottomSheetCtrl',
        disableBackdrop: true,
        disableParentScroll: false,
        isLockedOpen: true
      }).then(function (clickedItem) {
        console.log(clickedItem['name'] + ' clicked!');
      }).catch(function (error) {
        console.log("User clicked outside or hit escape");
      });
    };

    $scope.cargarConsola();

  })

  .controller('dialogController', function ($scope, $mdDialog) {
    console.log(".controller('DialogController')");

    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };

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
        // console.log('importarContactos.appendDir.callback');
        // console.debug(dirUpdatedData);
        let nuevoCliente = new cl_cliente({
          nombre: contacto.nombre,
          dirID: dirUpdatedData.values[0][0],
          resourceName: contacto.resourceName
        });
        PkuyApp.appendObjToSheetTable(nuevoCliente, cl_maestroClientes.sheetName(), true, function (cliUpdatedData) {
          // console.log('importarContactos.appendCli.callback');
          console.log('[Ok] Cliente Nro.' + cliUpdatedData.values[0][0] + ' creado con dirección ' + dirUpdatedData.values[0][0]);
          if (selContactos.length)
            $scope.importarContactos(selContactos);
          else {
            console.log("[Ok] Importación de Clientes Finalizada")
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

  })
  .controller('bottomSheetCtrl', function ($scope, $mdBottomSheet) {
    PkuyApp.consola();

    $scope.hide = function () {
      $mdBottomSheet.hide();
    }
  })
