angular.module('PkuyApp', ['ngMaterial'])

  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('yellow')
      .dark();
  })

  .factory('PkuyLink', function () {
    return PkuyApp;
  })

  .controller('main', function ($scope, $rootScope, $mdDialog, PkuyLink) {

    // Obtener Permiso para enviar Notifiaciones
    Notification.requestPermission();

    // Loading
    $rootScope.lo = () => $rootScope.pkuyLoading = true;

    // Stop Loading
    $rootScope.slo = () => $rootScope.pkuyLoading = false;

    $scope.onLoaded = function () {
      // Actualizar Vista
      $rootScope.currentUser = PkuyLink.currentUser;
      $rootScope.slo();
      $scope.$apply();
    }

    // StartUp
    $rootScope.lo();
    PkuyLink.startPkuyDB($scope.onLoaded);

    // Menus
    $scope.appMenu = [
      {
        titulo: '0.Sistema',
        entradas: [
          { titulo: 'Conectar con Google', do: function () { PkuyLink.handleAuthClick() } },
          { titulo: 'Desconectar', do: function () { PkuyLink.handleSignoutClick() } },
          { titulo: 'Reniciar PkuyApp', do: function () { PkuyLink.startPkuyDB() } }
        ]
      },
      {
        titulo: '1.Consultas',
        entradas: [
          { titulo: 'Actualizar Contactos Google', do: function () { PkuyLink.cargarContactosGoogle(true) } },
          { titulo: 'Importar Clientes desde Contactos Google', do: function ($event) { $scope.importarClientes($event) } },
          {
            titulo: 'Un submenu', subentradas: [
              { titulo: 'Loading', do: function () { } },
              { titulo: 'Stop Loading', do: function () { } },
            ]
          }
        ]
      },
      {
        titulo: '2.Crear',
        entradas: [
          { titulo: 'Nuevo Cliente', do: function () { $scope.crearNuevoCliente() } },
          { titulo: 'Nuevo Producto', do: function () { $scope.crearNuevoProducto() } },
        ]
      },
      {
        titulo: '3.Ayuda',
        entradas: [
          { titulo: 'Reportar un Error', do: function () { $scope.reportarBug() } },
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

    // TODO BORRAR
    $scope.reportarBug = function (ev) {
      var confirm = $mdDialog.prompt()
        .title('Bienvenidx!')
        .textContent('Describí lo mejor que puedas el Error, ' + PkuyLink.currentUser.nombre
          + '. Por favor, incluí los pasos que podrían llevarnos a reproducir el error.')
        .placeholder('Me ocurrió un error')
        .ariaLabel('Descripción del error')
        .targetEvent(ev)
        .required(true)
        .ok('Enviar')
        .cancel('Lo haré luego');

      $mdDialog.show(confirm).then(function (result) {
        $rootScope.lo();
        var emailReportBody = {
          "report": result,
          "db": PkuyLink.db
        };
        var emailReportBodyJSON = JSON.stringify(emailReportBody);
        // enviarMail(emailReportBodyJSON) 
        $rootScope.slo();
        PkuyApp.log("Reporte de Error Enviado!");
      }, function () { });
    };

    /** Abrir Dialogo para importar Clientes desde Google Contacts*/
    $scope.importarClientes = async function (ev) {

      $rootScope.lo();
      await PkuyLink.cargarContactosGoogle();

      $rootScope.slo();
      $mdDialog.show({
        controller: 'dialogImportarClientes',
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

    /** Abrir Diálogo para crear Nuevo Cliente */
    $scope.crearNuevoCliente = async function (ev) {
      $mdDialog.show({
        controller: 'dialogCrearNuevoCliente',
        templateUrl: 'nuevoCliente.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: false
      })
        .then(function (answer) {
        })
        .catch(function () {
        });

    }

    /** Abrir Diálogo para crear Nuevo Producto */
    $scope.crearNuevoProducto = async function (ev) {
      $mdDialog.show({
        controller: 'dialogCrearNuevoProducto',
        templateUrl: 'nuevoProducto.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: false
      })
        .then(function (answer) {
        })
        .catch(function () {
        });

    }

  })

  /** Controlador del Diálogo para Impoartar Clientes */
  .controller('dialogImportarClientes', function ($scope, $rootScope, $mdDialog, PkuyLink) {

    $scope.titulo = 'Importar Contactos de Google';
    $scope.contactos = [];

    /** Cerrar diálogo */
    $scope.cancel = () => $mdDialog.cancel();

    $scope.toggleSelectAll = function () {
      $scope.contactos.forEach(element => {
        element.selected = !element.selected;
      });
    }

    // Carga inicial de contactos
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

    /** Importación de Google Contacts a Clientes de PkuyApp */
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
      }

      PkuyLink.log("Importación de Clientes desde Google Contactos: Finalizada")

      $rootScope.slo();
      $mdDialog.hide();
    }
  })

  /** Controlador del Diálogo para crear un Nuevo Cliente */
  .controller('dialogCrearNuevoCliente', function ($scope, $rootScope, $mdDialog, PkuyLink) {
    $scope.titulo = "Crear nuevo Cliente"
    $scope.nuevoCliente = new cl_cliente();
    $scope.nuevaDireccion = new cl_direccion();
    $scope.maestroPtosDespacho = PkuyLink.db.maestroPtosDespacho.getAll();
    $scope.maestroMediosPago = PkuyLink.db.maestroMediosPago.getAll();
    $scope.descuentos = PkuyLink.descuentos;
    $scope.gruposClientes = [
      {
        "grCliID": "ML",
        "descripcion": "Clientes de MercadoLibre"
      },
      {
        "grCliID": "HIST",
        "descripcion": "Clientes históricos de Pacha Kuyuy"
      },
      {
        "grCliID": "RETIRA",
        "descripcion": "Clientes que retiran ellos mismos"
      },
    ];

    /** Cerrar Diálogo */
    $scope.cancel = () => $mdDialog.cancel();

    /** Clic en Crear */
    $scope.crearCliente = async function (nuevoCli, nuevaDir) {
      $rootScope.lo();
      var clienteCreado = await PkuyLink.nuevoCliente(nuevoCli, nuevaDir);
      $rootScope.slo();
      $mdDialog.hide();

    }

    /** Clic en Cargar Modelo */
    $scope.cargarModelo = function () {
      $mdDialog.show({
        controllerAs: 'dialogCtrl',
        controller: function ($scope, $mdDialog, PkuyLink) {
          $scope.titulo = "Cargar Modelo";
          $scope.modelos = PkuyLink.db.maestroClientes.getModelos();
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
          $scope.usarModelo = function (index) {
            $mdDialog.hide($scope.modelos[index]);
          };

        },
        preserveScope: true,
        autoWrap: true,
        multiple: true,
        templateUrl: 'cargarModeloCliente.tmpl.html'
      }).then(function (selCliente) {
        $scope.nuevoCliente = new cl_cliente();
        $scope.nuevaDireccion = new cl_direccion();
        Object.assign($scope.nuevoCliente, selCliente);
        $scope.nuevoCliente.$$hashKey = '';
        $scope.nuevoCliente.esModelo = '';
        Object.assign($scope.nuevaDireccion, selCliente.direccion());
      }).catch(() => { });
    };

    /** Clic en Guardar Modelo */
    $scope.guardarModelo = function () {
      console.log("GUARDAR MODELO");

      $mdDialog.show({
        controllerAs: 'dialogCtrl',
        controller: function ($scope, $mdDialog, PkuyLink) {
          $scope.titulo = "Guardar Modelo";
          $scope.nombreModelo = "";
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
          $scope.guardar = function () {
            $mdDialog.hide($scope.nombreModelo);
          };
        },
        preserveScope: true,
        autoWrap: true,
        multiple: true,
        templateUrl: 'guardarModeloCliente.tmpl.html'
      }).then(async function (nombreModelo) {
        $scope.nuevoCliente.esModelo = nombreModelo;
        $rootScope.lo();
        var clienteModelo = await PkuyLink.nuevoCliente($scope.nuevoCliente, $scope.nuevaDireccion);
        $rootScope.slo();
        $scope.nuevoCliente = new cl_cliente();
        $scope.nuevaDireccion = new cl_direccion();
      }).catch(() => { });
    };

  })

  /** Controlador del Diálogo para crear un Nuevo Producto */
  .controller('dialogCrearNuevoProducto', function ($scope, PkuyLink, $rootScope, $mdDialog) {
    $scope.titulo = "Alta nuevo Producto"
    $scope.nuevoProducto = new cl_producto();
    $scope.presentaciones = [{'denominacion':'nuevo'}];
    $scope.unidades = [{ "UM": "Un.", "descripcionUM": "Unidades" },
    { "UM": "Paq.", "descripcionUM": "Paquetes" },
    { "UM": "Kg", "descripcionUM": "Kilogramos" },
    { "UM": "Gr", "descripcionUM": "Gramos" },
    { "UM": "Ml", "descripcionUM": "Mililitros" },
    { "UM": "Lts", "descripcionUM": "Litros" }];
    /** Cerrar Diálogo */
    $scope.cancel = () => $mdDialog.cancel();

    $scope.agregarPresentacion = () => $scope.presentaciones.push(new Object());
    $scope.quitarPresentacion = () => $scope.presentaciones.shift();

    /** Clic en Crear */
    $scope.crearProducto = async function (nuevoCli, nuevaDir) {
      $rootScope.lo();
      var ProductoCreado = await PkuyLink.nuevoProducto(nuevoCli, nuevaDir);
      $rootScope.slo();
      $mdDialog.hide();

    }


  })