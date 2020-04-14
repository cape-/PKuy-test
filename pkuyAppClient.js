angular.module('PkuyApp', ['ngMaterial', 'ngAnimate'])

  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('yellow')
      .dark();

    $mdThemingProvider.theme('altTheme')
      .primaryPalette('orange')
      .accentPalette('brown');
    // .dark();
  })

  .factory('PkuyLink', function () {
    return PkuyApp;
  })

  /**----------------------------------------------------- */
  /**                                                      */
  /** MAIN CONTROLLER                                      */
  /**                                                      */
  /**----------------------------------------------------- */
  .controller('main', function ($scope, $rootScope, $filter, $mdDialog, $http, PkuyLink) {

    // Loading
    $rootScope.lo = () => $rootScope.pkuyLoading = true;

    // Stop Loading
    $rootScope.slo = () => $rootScope.pkuyLoading = false;

    $scope.onDBLoaded = function () {
      // Actualizar Vista
      $rootScope.currentUser = PkuyLink.currentUser;
      $rootScope.thisTerminalID = PkuyLink.thisTerminalID;

      // Backup en localStorage
      PkuyLink.log("Backup to localStorage");
      // $interval(PkuyLink.saveLocalDB, 15 * 1000);
      PkuyLink.saveLocalDB();

      $rootScope.slo();
      $scope.$apply();
    }

    $scope.onCotizacionesLoaded = function () {
      $rootScope.dolar = PkuyLink.db.dolar;

      $scope.antiguedadActualizacion = {
        MinTot: Math.floor((Date.now() - $rootScope.dolar.blue.fecha) / 1000 / 60)
      }

      $scope.antiguedadActualizacion.fechaTxt = $filter('date')($rootScope.dolar.blue.fecha, "dd/MM/yy ' a las ' h:mma");
      $scope.antiguedadActualizacion.hh = Math.floor($scope.antiguedadActualizacion.MinTot / 60);
      $scope.antiguedadActualizacion.mm = $scope.antiguedadActualizacion.MinTot - $scope.antiguedadActualizacion.hh * 60

      if ($scope.antiguedadActualizacion.hh < 1) { // Menos de 1 hora
        $rootScope.dolarActualizadoTxt = "Cotización actualizada hace " + $scope.antiguedadActualizacion.mm + " minutos";

      } else if ($scope.antiguedadActualizacion.hh < 10) { // Entre 1 y 9 horas 
        $rootScope.dolarActualizadoTxt = "Cotización actualizada hace " + $scope.antiguedadActualizacion.hh
          + (($scope.antiguedadActualizacion.hh == 1) ? " hora" : " horas");

        if ($scope.antiguedadActualizacion.mm != 0)
          $rootScope.dolarActualizadoTxt += " y " + $scope.antiguedadActualizacion.mm
            + (($scope.antiguedadActualizacion.mm == 1) ? " minuto" : " minutos");

      } else { // Más de 10 horas de antiguedad
        $rootScope.dolarActualizadoTxt = "Cotización actualizada el " + $scope.antiguedadActualizacion.fechaTxt;

      }

      $scope.$apply();
    }

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
        templateUrl: '/templates/importarClientes.tmpl.html',
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
        templateUrl: '/templates/nuevoCliente.tmpl.html',
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
        templateUrl: '/templates/nuevoProducto.tmpl.html',
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

    $scope.offlineScreen = function () {

      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        autoWrap: false,
        parent: angular.element(document.body),
        templateUrl: 'templates/offlineScreen.tmpl.html'
      })
    }

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
        titulo: '1 . Consultas',
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
        titulo: '2 . Crear',
        entradas: [
          { titulo: 'Nuevo Cliente', do: function () { $scope.crearNuevoCliente() } },
          { titulo: 'Nuevo Producto', do: function () { $scope.crearNuevoProducto() } },
        ]
      },
      {
        titulo: '3 . Ayuda',
        entradas: [
          { titulo: 'Reportar un Error', do: function () { $scope.reportarBug() } },
        ]
      },
      {
        titulo: 'X . Admin',
        entradas: [
          { titulo: 'Borrar localStorage', do: function () { localStorage.clear() } },
          { titulo: 'Abrir PkuyDB', do: function () { window.open("https://docs.google.com/spreadsheets/d/" + PkuyLink.dbSpreadsheet) } },
          { titulo: 'BackUp PkuyDB', do: function () { PkuyLink.backupPkuyDB() } }
        ]
      }
    ];

    // Permiso para Notifiaciones
    Notification.requestPermission();

    // StartUp
    if (navigator.onLine) {
      $rootScope.lo();
      PkuyLink.startPkuyDB($scope.onDBLoaded, $scope.onCotizacionesLoaded, $http);
    } else {
      $scope.offlineScreen();
    }
  })

  /**----------------------------------------------------- */
  /**                                                      */
  /** Controlador del Diálogo para Impoartar Clientes      */
  /**                                                      */
  /**----------------------------------------------------- */
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

  /**----------------------------------------------------- */
  /**                                                      */
  /** Controlador del Diálogo para crear un Nuevo Cliente  */
  /**                                                      */
  /**----------------------------------------------------- */
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
        templateUrl: '/templates/cargarModeloCliente.tmpl.html'
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
        templateUrl: '/templates/guardarModeloCliente.tmpl.html'
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

  /**----------------------------------------------------- */
  /**                                                      */
  /** Controlador del Diálogo para crear un Nuevo Producto */
  /**                                                      */
  /**----------------------------------------------------- */
  .controller('dialogCrearNuevoProducto', function ($scope, PkuyLink, $timeout, $rootScope, $mdDialog) {
    /** Cerrar Diálogo */
    $scope.cancel = () => $mdDialog.cancel();

    $scope.agregarPresentacion = function () {
      let i = $scope.presentaciones.push(Object.assign({}, $scope.nuevaPresentacion));

      $scope.presentaciones[--i].denominacion =
        $scope.nuevoProducto.descripcion
        + ' x' + $scope.presentaciones[i].cantPresentacion
        + ' ' + $scope.nuevoProducto.UM;

      $scope.calcularPreciosPresentaciones();

      $scope.$watchCollection('presentaciones[' + i + ']',
        (despues, antes) => {
          if ((despues.valor !== antes.valor)
            || (despues.tipoPrecio !== antes.tipoPrecio)
            || (despues.redondeo !== antes.redondeo))
            $scope.calcularPreciosPresentaciones();
          if (despues.cantPresentacion !== antes.cantPresentacion)
            $scope.actualizarDenominaciones(despues.cantPresentacion, antes.cantPresentacion, i);
        })
    };

    $scope.quitarPresentacion = function () {
      if ($scope.presentaciones.length > 1)
        $scope.presentaciones.pop();
    };

    /** Clic en Crear */
    $scope.crearProducto = async function (nuevoProducto, presentaciones) {

      // Convierte la FileList en un array
      var filesArr = [];
      for (i = 0, l = $scope.nuevoProducto.files.length; i < l; i++) {
        var h = $scope.nuevoProducto.files[i];
        filesArr.push({
          "id": h.id,
          "thumbnailLink": h.thumbnailLink,
        });
      }

      // Mapeo Obj.local a DB Obj (cl_producto)
      var productosNuevos = [new cl_producto(
        {
          prodID: nuevoProducto.prodID,
          descripcion: nuevoProducto.descripcion,
          origen: nuevoProducto.origen,
          prodID_modelo: '',
          esModelo: true,
          cantPresentacion: 0,
          UM: nuevoProducto.UM,
          mlUrl: '',
          files: filesArr
        }
      )];

      var preciosNuevos = [];
      if (nuevoProducto.tipoPrecio)
        preciosNuevos.push(new cl_precioProducto(
          {
            prodID: nuevoProducto.prodID,
            tipoPrecio: nuevoProducto.tipoPrecio,
            inicioTS: Date.now(),
            valor: nuevoProducto.precioReferenciaUM,
            precioCalculado: nuevoProducto.precioReferenciaUM,
            moneda: nuevoProducto.moneda,
            cotizacionMoneda: nuevoProducto.cotizacionMoneda,
          })
        );

      // Mapeo Array Obj.locales a DB Obj (cl_producto)
      presentaciones.map((presentacion) => {
        productosNuevos.push(new cl_producto(
          {
            prodID: presentacion.prodID,
            descripcion: presentacion.denominacion,
            origen: nuevoProducto.origen,
            prodID_modelo: nuevoProducto.prodID,
            esModelo: false,
            cantPresentacion: presentacion.cantPresentacion,
            UM: nuevoProducto.UM,
            mlUrl: ''
          }
        ));
        preciosNuevos.push(new cl_precioProducto(
          {
            prodID: presentacion.prodID,
            tipoPrecio: presentacion.tipoPrecio,
            inicioTS: Date.now(),
            valor: presentacion.valor,
            precioCalculado: presentacion.precioCalculado,
            moneda: presentacion.moneda,
            cotizacionMoneda: nuevoProducto.cotizacionMoneda,
          })
        );

      });

      console.debug(nuevoProducto);
      console.debug(presentaciones);
      console.debug(productosNuevos);
      console.debug(preciosNuevos);

      $rootScope.lo();

      var productosCreados = [];
      var prodIDModelo;
      for (let i = 0; i < productosNuevos.length; i++) {
        const prodNuevo = productosNuevos[i];
        if (!prodNuevo.esModelo)  // Linkear presentaciones (Productos esModelo == false) a producto modelo
          prodNuevo.prodID_modelo = prodIDModelo;
        /* Grabar en BD */
        var prodCreado = await PkuyLink.nuevoProducto(prodNuevo);

        if (prodNuevo.esModelo)  // Almacenar prodID del producto modelo
          prodIDModelo = prodCreado.prodID;
        productosCreados.push(prodCreado);

      }
      var preciosCreados = [];
      for (let j = 0; j < productosCreados.length; j++) {
        const productoCreado = productosCreados[j];
        const precioNuevo = preciosNuevos[j];

        precioNuevo.prodID = productoCreado.prodID;
        var precioCreado = await PkuyLink.nuevoPrecio(precioNuevo);

        preciosCreados.push(precioCreado);
      }
      console.debug(productosCreados, preciosCreados);
      // var ProductoCreado = await PkuyLink.nuevoProducto
      $rootScope.slo();
      $mdDialog.hide();

    }

    $scope.browseFotos = function () {
      document.getElementById('fotosProducto').click();
    }

    $scope.updateFileList = function () {

      // Archivos seleccionados
      var files = document.getElementById('fotosProducto').files;

      // Salir si no hay archivos seleccionados
      if (!files.length)
        return;

      // Mensaje y timeout para upload
      $scope.status("" + files.length + " archivos seleccionados");
      $timeout(() => { $scope.uploadFotos(files) }, 1000);
    }

    /** Subir fotos del producto */
    $scope.uploadFotos = function (files) {

      /** Escalar Imagen */
      /** https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload */

      if (!files)
        var files = document.getElementById('fotosProducto').files;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.id)   // Evitar duplicación de uploads
          continue;

        var r = new FileReader();

        r.onloadend = function (e) {

          // DRIVE API Call
          var driveFileOptions = {
            'title': $scope.nuevoProducto.prodID
              + $scope.nuevoProducto.descripcion
              + '_' + $scope.nuevoProducto.origen, // Nombre Archivo
            'parents': [
              {
                "id": PkuyLink.driveParentFolders.imagenesProductos,  // Folder para imágenes
              }
            ],
          };
          $scope.status("Subiendo [" + file.name + "]");
          PkuyLink.insertFileToDrive(file, driveFileOptions, (drivefile) => {
            if (drivefile.error) {
              // Mostrar error
              $scope.status("Error: " + drivefile.error.code + " " + drivefile.error.message);


            } else {
              // Registrar ID de drivefile
              r.id = file.id = drivefile.id;
              file.thumbnailLink = drivefile.thumbnailLink;
              $scope.nuevoProducto.files.push(file);

              // Status
              $scope.status("Subido a GOOGLE DRIVE correctamente");

              // Insertar Thumbs
              var thumbFoto = document.createElement("img");
              thumbFoto.src = drivefile.thumbnailLink;
              var thumbDelete = document.createElement("i");
              thumbDelete.classList.add("material-icons");
              thumbDelete.innerText = 'delete';
              thumbDelete.onclick = () => {
                console.debug(this);
                thumbDiv.remove();  // Remover HTML DOM element
                $scope.nuevoProducto.files = $scope.nuevoProducto.files.filter((obj) => obj.id !== file.id); // Remover el item por ID

                PkuyLink.deleteFileFromDrive(file.id); // TODO: Eliminar file del drive
              };
              var thumbDiv = document.createElement("div");
              thumbDiv.id = file.id;
              thumbDiv.classList.add("thumbFoto");
              thumbDiv.appendChild(thumbDelete);
              thumbDiv.appendChild(thumbFoto);
              document.getElementById("divMiniaturas").appendChild(thumbDiv);
            }
          });

        }

        r.readAsBinaryString(file);

      }
    };

    $scope.status = function (s = "") {
      $scope.statusStr = s;
      $scope.$apply();
    };

    /** Calcular Precio de cada Presentación */
    $scope.calcularPreciosPresentaciones = function () {
      console.log("calcularPreciosPresentaciones called");

      for (let i = 0; i < $scope.presentaciones.length; i++) {

        presentacion = $scope.presentaciones[i];
        console.log(presentacion);

        var selectedTipoPrecio = $scope.tiposPrecio
          .find(tiposPrecio => tiposPrecio.tipoPrecio == presentacion.tipoPrecio);

        if (selectedTipoPrecio !== undefined)
          presentacion.moneda = selectedTipoPrecio.moneda;

        if (presentacion.tipoPrecio == 'PVP') // PVP: Precio fijo en AR$
          presentacion.precioCalculado = presentacion.valor;

        else if (presentacion.tipoPrecio == 'PVD') // PVD: Precio fijo en USD
          presentacion.precioCalculado = presentacion.valor;

        else if (presentacion.tipoPrecio == 'PAD') // Precio en USD convertido a AR$
          presentacion.precioCalculado = PkuyLink.convertUSDtoARS(presentacion.valor);

        else if (presentacion.tipoPrecio == 'PAB') // Precio en USD Blue convertido a AR$
          presentacion.precioCalculado = PkuyLink.convertUSDBtoARS(presentacion.valor);

        else if (presentacion.tipoPrecio == 'PPM')  // % del Precio Modelo U/M en/convertido a AR$
        {
          if ($scope.nuevoProducto.tipoPrecio == 'PMP') //PMP	Precio Modelo U/M AR$
            presentacion.precioCalculado = $scope.nuevoProducto.precioReferenciaUM * presentacion.valor / 100;

          else if ($scope.nuevoProducto.tipoPrecio == 'PMD') // PMD	Precio Modelo U/M (cotiz. USD)
            presentacion.precioCalculado = PkuyLink.convertUSDtoARS($scope.nuevoProducto.precioReferenciaUM) * presentacion.valor / 100;

          else if ($scope.nuevoProducto.tipoPrecio == 'PMB') // PMB	Precio Modelo U/M (cotiz. USD Blue)
            presentacion.precioCalculado = PkuyLink.convertUSDBtoARS($scope.nuevoProducto.precioReferenciaUM) * presentacion.valor / 100;

          else
            presentacion.precioCalculado = -1.00;
        }

        else
          presentacion.precioCalculado = -1.00;

        /* REDONDEO */
        if (presentacion.redondeo)
          presentacion.precioFinal = Math.ceil(presentacion.precioCalculado / presentacion.redondeo) * presentacion.redondeo;  // Redondear Precio

        else
          presentacion.precioFinal = presentacion.precioCalculado;   // Precio Exacto

      }
    }

    $scope.calcularPrecioProducto = function () {

      /* COTIZACIÓN MONEDA */
      if ($scope.nuevoProducto.moneda == 'ARS') // Peso Argentino
        $scope.nuevoProducto.cotizacionMoneda = 1.00;

      else if ($scope.nuevoProducto.moneda == 'USD') // Dólar
        $scope.nuevoProducto.cotizacionMoneda = $rootScope.dolar.oficial.venta;

      else if ($scope.nuevoProducto.moneda == 'USD-B') //Dolar Blue
        $scope.nuevoProducto.cotizacionMoneda = $rootScope.dolar.blue.venta;

      $scope.calcularPreciosPresentaciones()
    }

    $scope.actualizarDenominaciones = function (despues, antes, i = null) {

      if (despues === undefined)
        despues = "?";

      if (antes === undefined)
        antes = "?";

      if (i === null) {
        for (i = 0; i < $scope.presentaciones.length; i++) {
          const presentacion = $scope.presentaciones[i];
          presentacion.denominacion = presentacion.denominacion.replace(antes, despues);
        }
      }
      else {
        const presentacion = $scope.presentaciones[i];
        presentacion.denominacion = presentacion.denominacion.replace(antes, despues);
      }
    }

    $scope.redondearPrecio = (precio) => Math.ceil(precio / 5) * 5;

    $scope.$watchCollection('nuevoProducto',
      (despues, antes) => {
        // Sub Watch: Precio de Referencia o Tipo de Precio
        if ((despues.precioReferenciaUM !== antes.precioReferenciaUM)
          || (despues.tipoPrecio !== antes.tipoPrecio))
          // Calcular precios
          $scope.calcularPrecioProducto();

        // Sub Watch: Descripcion
        if (despues.descripcion !== antes.descripcion) {
          // Actualizar nombre producto
          $scope.actualizarDenominaciones(despues.descripcion, antes.descripcion);

          // Actualizar prod_ID

        }

        if (despues.prodID !== antes.prodID)
          $scope.presentaciones = $scope.presentaciones.map((presentacion, i) => {
            presentacion.prodID = despues.prodID.substr(0, (despues.prodID.length - 4)) + ('' + i).padStart(4, '0');
            return presentacion;
          });

      });

    /** Definiciones del Controller */
    $scope.titulo = "Alta nuevo Producto"

    $scope.tiposPrecio = PkuyLink.db.tiposPrecios.getAll();
    $scope.unidades = PkuyLink.db.unidadesMedida.getAll();

    $scope.nuevoProducto = {
      'descripcion': '',
      'origen': '',
      'UM': '',
      'tipoPrecio': '',
      'precioReferenciaUM': 1.00,
      'moneda': '',
      'cotizacionMoneda': 1.00,
      'files': []
    };

    $scope.nuevaPresentacion = {
      'denominacion': '',
      'cantPresentacion': 1.00,
      'UM': '',
      'valor': 100.00,
      'moneda': '',
      'tipoPrecio': 'PPM',
      'precioCalculado': 0.00,
      'precioFinal': 0.00,
      'redondeo': 0
    };

    $scope.presentaciones = [];
    // Inicializar Tabla de Presentaciones
    //$scope.agregarPresentacion();

  })