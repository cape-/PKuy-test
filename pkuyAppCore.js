var PkuyApp = {
  // PkuyApp Autoría
  ver: '1.0',
  author: 'laucape@gmail.com',
  authorName: 'Lautaro Capella',
  country: 'AR',

  // Inicialización
  db: {
    maestroClientes: {},
    maestroPedidos: {},
    statusPedidos: {},
    tiposStatusPedido: {},
    maestroAlmacenes: {},
    maestroPtosDespacho: {},
    maestroMediosPago: {},
    maestroProductos: {},
    maestroPrecios: {},
    tiposPrecios: {},
    maestroMovimientos: {},
    tiposMovimiento: {},
    maestroCalculosStock: {},
    maestroDirecciones: {},
    maestroCotizaciones: {},
    unidadesMedida: {},
    maestroTerminales: {},
    dolar: {
      oficial: {},
      blue: {}
    }
  },
  logStorage: [],
  contactos: [],
  cabs: [],
  startUpTS: Date.now(),
  consolaDiv: document.getElementById('consolaDiv'), // DOM element de la Consola

  // LocalStorage Params
  localStorageName: 'PkuyDB', // Nombre de la imagen de BD en LocalStorage
  localStorageTTL: 3600, // Duración (Segundos) de la imagen de BD en LocalStorage

  // Google APIs Params
  defaultSheetRows: 10000, // Numero (MAX) por defecto de registros a recuperar desde los Sheets
  defaultContactsPerCall: 1000, // Número de contactos a obtener en cada llamada a Google People API
  dbBackupNombre: 'PkuyDB_backup_', // Prefijo para BackUp de BD en drive
  httpRetriesDelay: 2500, // 2,5 seg
  httpRetriesAllowed: 48, // Max. 2 min
  driveParentFolders: {
    imagenesProductos: "169qYmK3noO6xXavMcqROjpt-_z678Wla"
  },

  // Otros Params
  icon: "resources/img/pkuy-icon-1x.png",
  iconBig: "resources/img/pkuy-icon-400px.png",
  descuentos: ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90"],


  updateSigninStatus: function (isSignedIn) {
    PkuyApp.gapiSignedIn = isSignedIn;
    if (isSignedIn)
      PkuyApp.log('Google Account: Logged In');
    else
      PkuyApp.error('Google Account: Logged Out');
  },

  handleAuthClick: function (event) {
    PkuyApp.log('PkuyApp -singin-');
    gapi.auth2.getAuthInstance().signIn();
  },

  handleSignoutClick: function (event) {
    PkuyApp.log('PkuyApp -signout-');
    gapi.auth2.getAuthInstance().signOut();
  },

  startPkuyDB: function (callback = function () { }, cotizacionCallback = function () { }, httpClient) {
    PkuyApp.onLoaded = callback;

    new Promise(function (resolve) {
      gapi.load('client:auth2', function () { resolve(); });
    }).then(function () {
      PkuyApp.mainLoad()
    });

    new Promise(function (resolve) {

      /* COTIZACION OFICIAL */
      var PROMdolarOficial = httpClient.get('https://mercados.ambito.com//dolar/oficial/variacion')
        .then(function (response) {
          // success
          var dataCotizacion = response.data;

          // Formato fecha = "DD/MM/YYYY - HH:MM"
          let fechaStr = dataCotizacion.fecha.split('-')[0].trim();
          let horaStr = dataCotizacion.fecha.split('-')[1].trim();
          let fechaISO = fechaStr.split('/')[1] + '/' + fechaStr.split('/')[0] + '/' + fechaStr.split('/')[2] + ' ' + horaStr;
          PkuyApp.db.dolar.oficial.fecha = Date.parse(fechaISO);
          PkuyApp.db.dolar.oficial.ts = Date.now();

          // Formato numeros = "99,01"
          PkuyApp.db.dolar.oficial.compra = Number(dataCotizacion.compra.replace(',', '.'));
          PkuyApp.db.dolar.oficial.venta = Number(dataCotizacion.venta.replace(',', '.'));

          var cotizacionUSDARS = new cl_cotizacion({
            cotizacionTS: PkuyApp.db.dolar.oficial.fecha,
            monedaDe: 'USD',
            monedaA: 'ARS',
            factor: PkuyApp.db.dolar.oficial.venta,
          });
          PkuyApp.nuevaCotizacion(cotizacionUSDARS);
          var cotizacionARSUSD = new cl_cotizacion({
            cotizacionTS: PkuyApp.db.dolar.oficial.fecha,
            monedaDe: 'ARS',
            monedaA: 'USD',
            factor: 1 / PkuyApp.db.dolar.oficial.venta,
          });
          PkuyApp.nuevaCotizacion(cotizacionARSUSD);

          PkuyApp.log('Cotización Dolar Oficial obtenida de Ambito.com')
        })
        .catch(function (response) {
          // error
          PkuyApp.warn('No se pudo obtener cotizacion Dolar Oficial (Ámbito.com) ' + JSON.stringify(response));
        });

      /* COTIZACION BLUE */
      var PROMdolarBlue = httpClient.get('https://mercados.ambito.com//dolar/informal/variacion')
        .then(function (response) {
          var dataCotizacion = response.data;

          // Formato fecha = "DD/MM/YYYY - HH:MM"
          let fechaStr = dataCotizacion.fecha.split('-')[0].trim();
          // success
          let horaStr = dataCotizacion.fecha.split('-')[1].trim();
          let fechaISO = fechaStr.split('/')[1] + '/' + fechaStr.split('/')[0] + '/' + fechaStr.split('/')[2] + ' ' + horaStr;
          PkuyApp.db.dolar.blue.fecha = Date.parse(fechaISO);
          PkuyApp.db.dolar.blue.ts = Date.now();

          // Formato numeros = "99,01"
          PkuyApp.db.dolar.blue.compra = Number(dataCotizacion.compra.replace(',', '.'));
          PkuyApp.db.dolar.blue.venta = Number(dataCotizacion.venta.replace(',', '.'));

          var cotizacionUSDBARS = new cl_cotizacion({
            cotizacionTS: PkuyApp.db.dolar.blue.fecha,
            monedaDe: 'USDB',
            monedaA: 'ARS',
            factor: PkuyApp.db.dolar.blue.venta,
          });
          PkuyApp.nuevaCotizacion(cotizacionUSDBARS);
          var cotizacionARSUSDB = new cl_cotizacion({
            cotizacionTS: PkuyApp.db.dolar.blue.fecha,
            monedaDe: 'ARS',
            monedaA: 'USDB',
            factor: 1 / PkuyApp.db.dolar.blue.venta,
          });
          PkuyApp.nuevaCotizacion(cotizacionARSUSDB);

          PkuyApp.log('Cotización Dolar Blue obtenida de Ambito.com')
        }, function (response) {
          // error
          PkuyApp.warn('No se pudo obtener cotizacion Dolar Blue (Ámbito.com) ' + JSON.stringify(response));
        });

      // Callback
      Promise.all([PROMdolarBlue, PROMdolarOficial])
        .then(cotizacionCallback);

    })
  },

  mainLoad: function () {

    var initProm = new Promise(function (resolve, reject) {
      gapi.client.init(PkuyApp.gapiClientParams)
        .then(resolve, reject);
    });

    initProm.catch((error) => PkuyApp.error('Error en gapi.client.init! ' + JSON.stringify(error, null, 2)))

    initProm.then(async function () {

      // Set GAPI Signing Status
      PkuyApp.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      gapi.auth2.getAuthInstance().isSignedIn.listen(PkuyApp.updateSigninStatus);

      if (PkuyApp.gapiSignedIn === false) {
        PkuyApp.error('PkuyApp no está conectado a tu cuenta de Google.'
          + ' Conectalo desde el menú 0.Sistema > Conectar con Google');
        PkuyApp.onLoaded();
        return;
      }

      // Cargar Current User
      var PROMuserData = PkuyApp.loadUserData()
        .then(function (data) {
          PkuyApp.log('Cargando Datos del Usuario .currentUser');
          PkuyApp.currentUser = {};
          PkuyApp.currentUser.id = data.resourceName.split('/')[1];
          PkuyApp.currentUser.email = data.emailAddresses[0].value;
          PkuyApp.currentUser.nombre = data.names[0].givenName;
          PkuyApp.currentUser.nombreCompleto = data.names[0].displayName;
        })
        .catch(function (error) {
          PkuyApp.error('loadUserData.get' + JSON.stringify(error, null, 2));
        })

      // Cargar Auth User
      PkuyApp.log('Cargando Datos del Usuario .authUser');
      PkuyApp.authUser = {};
      PkuyApp.authUser.id = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getId();
      PkuyApp.authUser.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
      PkuyApp.authUser.nombre = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName();
      PkuyApp.authUser.nombreCompleto = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();

      //  Determinar si hay backup en localStorage
      var localStorageDB = PkuyApp.loadLocalDB();

      if (localStorageDB && (localStorageDB.ts >= (Date.now() - (PkuyApp.localStorageTTL * 1000)))) {
        // Si hay y su TS < 1 hora >>> Recuperar DB desde localStorage
        PkuyApp.log('Recuperando PkuyDB desde localStorage');

        // Inicializar DB desde la data recolectada
        PkuyApp.initPkuyDB(localStorageDB);
        PkuyApp.db.ts = localStorageDB.ts;

        await PROMuserData;

        // EVENT???
        PkuyApp.onLoaded();

      } else {

        // Descargar desde Google Sheets
        PkuyApp.log('Descargando PkuyDB desde Google Sheets');

        var tmpData = { ...PkuyApp.db }; // Copia objeto Temporal

        // 01 cl_maestroClientes
        var PROMmaestroClientes = PkuyApp.loadSheetTableToObj(cl_maestroClientes.sheetName())
          .then((data) => { tmpData.maestroClientes.recordSet = (data); PkuyApp.log('maestroClientes Descargado') })
          .catch((error) => { PkuyApp.error('maestroClientes > ' + error.toString()) });

        // 02 cl_maestroPedidos
        var PROMmaestroPedidos = PkuyApp.loadSheetTableToObj(cl_maestroPedidos.sheetName())
          .then((data) => { tmpData.maestroPedidos.recordSet = (data); PkuyApp.log('maestroPedidos Descargado') })
          .catch((error) => { PkuyApp.error('maestroPedidos > ' + error.toString()) });

        // 03 cl_statusPedidos
        var PROMstatusPedidos = PkuyApp.loadSheetTableToObj(cl_statusPedidos.sheetName())
          .then((data) => { tmpData.statusPedidos.recordSet = (data); PkuyApp.log('statusPedidos Descargado') })
          .catch((error) => { PkuyApp.error('statusPedidos > ' + error.toString()) });

        // 04 cl_tiposStatusPedido
        var PROMtiposStatusPedido = PkuyApp.loadSheetTableToObj(cl_tiposStatusPedido.sheetName())
          .then((data) => { tmpData.tiposStatusPedido.recordSet = (data); PkuyApp.log('tiposStatusPedido Descargado') })
          .catch((error) => { PkuyApp.error('tiposStatusPedido > ' + error.toString()) });

        // 05 cl_maestroAlmacenes
        var PROMmaestroAlmacenes = PkuyApp.loadSheetTableToObj(cl_maestroAlmacenes.sheetName())
          .then((data) => { tmpData.maestroAlmacenes.recordSet = (data); PkuyApp.log('maestroAlmacenes Descargado') })
          .catch((error) => { PkuyApp.error('maestroAlmacenes > ' + error.toString()) });

        // 06 cl_maestroPtosDespacho
        var PROMmaestroPtosDespacho = PkuyApp.loadSheetTableToObj(cl_maestroPtosDespacho.sheetName())
          .then((data) => { tmpData.maestroPtosDespacho.recordSet = (data); PkuyApp.log('maestroPtosDespacho Descargado') })
          .catch((error) => { PkuyApp.error('maestroPtosDespacho > ' + error.toString()) });

        // 07 cl_maestroMediosPago
        var PROMmaestroMediosPago = PkuyApp.loadSheetTableToObj(cl_maestroMediosPago.sheetName())
          .then((data) => { tmpData.maestroMediosPago.recordSet = (data); PkuyApp.log('mediosPago Descargado') })
          .catch((error) => { PkuyApp.error('mediosPago > ' + error.toString()) });

        // 08 cl_maestroProductos
        var PROMmaestroProductos = PkuyApp.loadSheetTableToObj(cl_maestroProductos.sheetName())
          .then((data) => { tmpData.maestroProductos.recordSet = (data); PkuyApp.log('maestroProductos Descargado') })
          .catch((error) => { PkuyApp.error('maestroProductos > ' + error.toString()) });

        // 09 cl_maestroPrecios
        var PROMmaestroPrecios = PkuyApp.loadSheetTableToObj(cl_maestroPrecios.sheetName())
          .then((data) => { tmpData.maestroPrecios.recordSet = (data); PkuyApp.log('maestroPrecios Descargado') })
          .catch((error) => { PkuyApp.error('maestroPrecios > ' + error.toString()) });

        // 10 cl_tiposPrecios
        var PROMtiposPrecios = PkuyApp.loadSheetTableToObj(cl_tiposPrecios.sheetName())
          .then((data) => { tmpData.tiposPrecios.recordSet = (data); PkuyApp.log('tiposPrecios Descargado') })
          .catch((error) => { PkuyApp.error('tiposPrecios > ' + error.toString()) });

        // 11 cl_maestroMovimientos
        var PROMmaestroMovimientos = PkuyApp.loadSheetTableToObj(cl_maestroMovimientos.sheetName())
          .then((data) => { tmpData.maestroMovimientos.recordSet = (data); PkuyApp.log('maestroMovimientos Descargado') })
          .catch((error) => { PkuyApp.error('maestroMovimientos > ' + error.toString()) });

        // 12 cl_tiposMovimiento
        var PROMtiposMovimiento = PkuyApp.loadSheetTableToObj(cl_tiposMovimiento.sheetName())
          .then((data) => { tmpData.tiposMovimiento.recordSet = (data); PkuyApp.log('tiposMovimiento Descargado') })
          .catch((error) => { PkuyApp.error('cl_tiposMovimiento > ' + error.toString()) });

        // 13 cl_maestroCalculosStock
        var PROMmaestroCalculosStock = PkuyApp.loadSheetTableToObj(cl_maestroCalculosStock.sheetName())
          .then((data) => { tmpData.maestroCalculosStock.recordSet = (data); PkuyApp.log('maestroCalculosStock Descargado') })
          .catch((error) => { PkuyApp.error('maestroCalculosStock > ' + error.toString()) });

        // 14 cl_maestroDirecciones
        var PROMmaestroDirecciones = PkuyApp.loadSheetTableToObj(cl_maestroDirecciones.sheetName())
          .then((data) => { tmpData.maestroDirecciones.recordSet = (data); PkuyApp.log('direcciones Descargado') })
          .catch((error) => { PkuyApp.error('direcciones > ' + error.toString()) });

        // 15 cl_maestroCotizaciones
        var PROMmaestroCotizaciones = PkuyApp.loadSheetTableToObj(cl_maestroCotizaciones.sheetName())
          .then((data) => { tmpData.maestroCotizaciones.recordSet = (data); PkuyApp.log('maestroCotizaciones Descargado') })
          .catch((error) => { PkuyApp.error('maestroCotizaciones > ' + error.toString()) });

        // 16 cl_unidadesMedida
        var PROMunidadesMedida = PkuyApp.loadSheetTableToObj(cl_unidadesMedida.sheetName())
          .then((data) => { tmpData.unidadesMedida.recordSet = (data); PkuyApp.log('unidadesMedida Descargado') })
          .catch((error) => { PkuyApp.error('unidadesMedida > ' + error.toString()) });

        // 17 cl_maestroTerminales
        var PROMmaestroTerminales = PkuyApp.loadSheetTableToObj(cl_maestroTerminales.sheetName())
          .then((data) => { tmpData.maestroTerminales.recordSet = (data); PkuyApp.log('maestroTerminales Descargado') })
          .catch((error) => { PkuyApp.error('maestroTerminales > ' + error.toString()) });

        startupPROMS = [PROMmaestroClientes,
          PROMmaestroPedidos,
          PROMstatusPedidos,
          PROMtiposStatusPedido,
          PROMmaestroAlmacenes,
          PROMmaestroPtosDespacho,
          PROMmaestroMediosPago,
          PROMmaestroProductos,
          PROMmaestroPrecios,
          PROMtiposPrecios,
          PROMmaestroMovimientos,
          PROMtiposMovimiento,
          PROMmaestroCalculosStock,
          PROMmaestroDirecciones,
          PROMmaestroCotizaciones,
          PROMunidadesMedida,
          PROMmaestroTerminales,
        ];

        Promise.all(startupPROMS)
          .then(function () {
            // Inicializar DB desde la data recolectada
            PkuyApp.initPkuyDB(tmpData);
            PkuyApp.db.ts = Date.now();

            // AngularJS callback
            PkuyApp.onLoaded();

          });

      }
    });
  },

  saveLocalDB: async function () {
    window.localStorage.setItem('' + PkuyApp.localStorageName, JSON.stringify(PkuyApp.db));
  },

  loadLocalDB: function () {
    return JSON.parse(window.localStorage.getItem('' + PkuyApp.localStorageName));
  },

  initPkuyDB: function (data) {

    // 01 cl_maestroClientes
    if (data.maestroClientes)
      PkuyApp.db.maestroClientes = new cl_maestroClientes(data.maestroClientes.recordSet);

    // 02 cl_maestroPedidos
    if (data.maestroPedidos)
      PkuyApp.db.maestroPedidos = new cl_maestroPedidos(data.maestroPedidos.recordSet);

    // 03 cl_statusPedidos
    if (data.statusPedidos)
      PkuyApp.db.statusPedidos = new cl_statusPedidos(data.statusPedidos.recordSet);

    // 04 cl_tiposStatusPedido
    if (data.tiposStatusPedido)
      PkuyApp.db.tiposStatusPedido = new cl_tiposStatusPedido(data.tiposStatusPedido.recordSet);

    // 05 cl_maestroAlmacenes
    if (data.maestroAlmacenes)
      PkuyApp.db.maestroAlmacenes = new cl_maestroAlmacenes(data.maestroAlmacenes.recordSet);

    // 06 cl_maestroPtosDespacho
    if (data.maestroPtosDespacho)
      PkuyApp.db.maestroPtosDespacho = new cl_maestroPtosDespacho(data.maestroPtosDespacho.recordSet);

    // 07 cl_maestroMediosPago !!!!!
    if (data.maestroMediosPago)
      PkuyApp.db.maestroMediosPago = new cl_maestroMediosPago(data.maestroMediosPago.recordSet);

    // 08 cl_maestroProductos
    if (data.maestroProductos)
      PkuyApp.db.maestroProductos = new cl_maestroProductos(data.maestroProductos.recordSet);

    // 09 cl_maestroPrecios
    if (data.maestroPrecios)
      PkuyApp.db.maestroPrecios = new cl_maestroPrecios(data.maestroPrecios.recordSet);

    // 10 cl_tiposPrecios
    if (data.tiposPrecios)
      PkuyApp.db.tiposPrecios = new cl_tiposPrecios(data.tiposPrecios.recordSet);

    // 11 cl_maestroMovimientos
    if (data.maestroMovimientos)
      PkuyApp.db.maestroMovimientos = new cl_maestroMovimientos(data.maestroMovimientos.recordSet);

    // 12 cl_tiposMovimiento
    if (data.tiposMovimiento)
      PkuyApp.db.tiposMovimiento = new cl_tiposMovimiento(data.tiposMovimiento.recordSet);

    // 13 cl_maestroCalculosStock
    if (data.maestroCalculosStock)
      PkuyApp.db.maestroCalculosStock = new cl_maestroCalculosStock(data.maestroCalculosStock.recordSet);

    // 14 cl_maestroDirecciones !!!!!
    if (data.maestroDirecciones)
      PkuyApp.db.maestroDirecciones = new cl_maestroDirecciones(data.maestroDirecciones.recordSet);

    // 15 cl_maestroCotizaciones !!!!!
    if (data.maestroCotizaciones)
      PkuyApp.db.maestroCotizaciones = new cl_maestroCotizaciones(data.maestroCotizaciones.recordSet);

    // 16 unidadesMedida
    if (data.unidadesMedida)
      PkuyApp.db.unidadesMedida = new cl_unidadesMedida(data.unidadesMedida.recordSet);

    // 17 cl_maestroTerminales
    if (data.maestroTerminales)
      PkuyApp.db.maestroTerminales = new cl_maestroTerminales(data.maestroTerminales.recordSet);


  },

  loadUserData: function () {
    return new Promise(function (resolve, reject) {
      gapi.client.people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses',
      }).then(function (response) {
        resolve(response.result);
      }, function (error) {
        reject(error)
      });
    });
  },

  cargarContactosGoogle: async function (reload = false) {

    // Recargar
    if (reload === true)
      PkuyApp.contactos = [];

    if (PkuyApp.contactos.length !== 0)
      return;

    // Descarga Recursiva de Contactos de Google
    await new Promise(function (resolve) {
      PkuyApp.loadContactsToTable('', (data) => {
        PkuyApp.log('...descargando contactos');
        PkuyApp.contactos.push(...data.connections);
      }, () => {
        PkuyApp.log('Contactos descargados');

        PkuyApp.cruzarClientesContactos(PkuyApp.contactos, PkuyApp.db.maestroClientes);
        PkuyApp.log('Contactos de Google actualizados');
        resolve();
      });
    });

    return;
  },

  loadContactsToTable: function (nextPage, callback, onFinishedLoaded) {
    gapi.client.people.people.connections.list({
      'resourceName': 'people/me',
      'pageSize': PkuyApp.defaultContactsPerCall,
      'pageToken': nextPage,
      'personFields': 'names,emailAddresses,phoneNumbers',
    }).then(function (response) {
      var nextPage = response.result.nextPageToken;
      var connections = response.result.connections;
      if (connections.length > 0) {
        callback(response.result);
        if (nextPage !== undefined && nextPage != '') {
          // Recursive
          PkuyApp.loadContactsToTable(nextPage, callback, onFinishedLoaded);
        } else {
          PkuyApp.log('Contactos Cargados!');
          onFinishedLoaded();
        }
      } else {
        PkuyApp.warn('loadContactsToTable: No connections found.');
      }
    });
  },

  cruzarClientesContactos: function (contactos, maestroClientes) {
    // Match Contactos de Google con Clientes de PkuyApp
    listaClientes = maestroClientes.getClientes();

    for (let index = 0; index < listaClientes.length; index++) {
      const cliente = listaClientes[index];
      if (cliente.resourceName == '' || cliente.resourceName == undefined) continue;
      for (let index2 = 0; index2 < contactos.length; index2++) {
        const contacto = contactos[index2];
        if (contacto.resourceName == cliente.resourceName) {
          contacto.cliID = cliente.cliID;
        }
      }
    }
  },

  loadSheetTableToObj: function (tableName, tabRange = null, startRecord = 1, endRecord = PkuyApp.defaultSheetRows) {
    return new Promise(async function (resolve, reject) {

      if (startRecord > endRecord) {
        reject(new Error('startRecord > endRecord'));
        return;
      }

      var returnTable = [];

      var cab = await PkuyApp.getCabOfTable(tableName);

      if (!tabRange)
        tabRange = tableName
          + "!A" + (startRecord + 1)
          + ":ZZ" + (endRecord + 1);

      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tabRange,
        majorDimension: 'ROWS'
      }).then(function (response) {
        var range = response.result;

        if (!range.hasOwnProperty('values')) {
          reject(new Error('Tabla ' + tableName + ': no se recuperaron registros.'));
          return;
        }

        if (range.values.length > 0) {
          // Recorrer registros
          for (i = 0; i < range.values.length; i++) {
            var row = range.values[i];
            var tempObj = new Object;
            for (j = 0; j < row.length; j++) {
              tempObj[cab[j]] = row[j];

            }
            tempObj["rowRange"] = tableName + "!A" + (startRecord + 1 + i) + ":ZZ" + (startRecord + 1 + i)
            if (Object.values(tempObj)[0] != '') {
              returnTable.push(tempObj);
            }
          }
          resolve(returnTable);
          return;

        } else {
          reject(new Error('Tabla ' + tableName + ': no se recuperaron registros.'));
          return;
        }
      }, function (error) {
        reject(new Error('loadSheetTableToObj.get: ' + JSON.stringify(error, null, 2)));
        return;
      });
    });
  },

  //   PkuyApp.updateObjToSheetTable = async function (obj, tableName, callback) {

  //     var cab;

  //     await new promise(function (resolve, reject) {

  //       gapi.client.sheets.spreadsheets.values.get({
  //         spreadsheetId: PkuyApp.dbSpreadsheet,
  //         range: tableName + '!A1:ZZ1',
  //         majorDimension: 'ROWS'
  //       }).then(function (responseHead) {
  //         // Puntero a Cabecera
  //         cab = responseHead.result.values[0];
  //         resolve();
  //       }, function () {
  //         reject();
  //       });
  //     });

  //     recordValues = [];
  //     // Mapear objeto a recordValues
  //     for (let i = 0; i < cab.length; i++) {
  //       let field = cab[i];

  //       if (obj[cab[i]] === undefined)
  //         recordValues.push(null);
  //       else
  //         recordValues.push(obj[field]);
  //     }

  //     console.debug('update http send');
  //     console.debug(obj.rowRange);
  //     console.debug(recordValues);

  //     gapi.client.sheets.spreadsheets.values.update({
  //       spreadsheetId: PkuyApp.dbSpreadsheet,
  //       range: obj.rowRange,
  //       valueInputOption: 'USER_ENTERED',
  //       includeValuesInResponse: 'true'
  //     }, { "values": [recordValues] }).then(
  //       function (response) {
  //         callback(response.result.updatedData);
  //       }, function (error) {
  //         PkuyApp.error('updateObjToSheetTable.update: ' + JSON.stringify(error, null, 2));
  //       });
  //   }, function (error) {
  //     PkuyApp.error('updateObjToSheetTable.get: ' + JSON.stringify(error, null, 2));
  //   });
  // };

  appendObjToSheetTableRetries: 0,

  /**
   * Insertar un objeto genérico en una Tabla (Sheet)
   * @param {any} obj Objeto a insertar
   * @param {string} tableName Tabla (Sheet)
   * @param {boolean} autoGetNewID `True`: se obtiene nuevo ID autoincremental. Se llamará a `callback` al obtenerse el nuevo ID. `False`: sólo se inserta el objeto tal cual.
   * @param {function} callback Sólo si `autoGetNewID` es true. Al obtenerse el nuevo ID autoincremental se llama a `callback` con el nuevo ID como único parámetro para su asignación al objeto.
   */
  appendObjToSheetTable: async function (obj, tableName, autoGetNewID = false, callback = function () { }) {

    if (PkuyApp.appendObjToSheetTableRetries >= PkuyApp.httpRetriesAllowed)
      return;

    try {
      var sheetsAPI = gapi.client.sheets.spreadsheets;

    } catch (e) {
      if (e.name !== "TypeError")
        throw e;

      PkuyApp.appendObjToSheetTableRetries++;
      setTimeout(function () {
        PkuyApp.appendObjToSheetTable(obj, tableName, autoGetNewID, callback);
        console.log("Retry appendObjToSheetTable for Object:", obj);
      }, PkuyApp.httpRetriesDelay);
      return;
    }

    PkuyApp.appendObjToSheetTableRetries = 0;

    var cab = await PkuyApp.getCabOfTable(tableName);

    obj.TS = new Date().toISOString();
    obj.usuario = PkuyApp.authUser.email;

    recordValues = [];
    // Mapear objeto a recordValues
    for (let i = 0; i < cab.length; i++) {
      let field = cab[i];

      if (obj[field] === undefined) {
        recordValues.push(null);
      } else {
        if (typeof (obj[field]) === "object")
          recordValues.push(JSON.stringify(obj[field]));
        else
          recordValues.push(obj[field]);
      }
    }

    // Primer campo como ID
    if (autoGetNewID) {
      recordValues[0] = '=INDIRECT("R[-1]C[0]",FALSE)+1';
    }

    console.debug('DEBUG // payload http send');
    console.debug(recordValues);

    await new Promise(function (resolve, reject) {
      sheetsAPI.values.append({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tableName + '!A2:ZZ' + PkuyApp.defaultSheetRows,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: "INSERT_ROWS",
        includeValuesInResponse: 'true',
        resource: {
          "majorDimension": "ROWS",
          "values": [recordValues]
        }
      }).then(
        function (response) {
          if (response.result.updates.updatedRange != undefined) {
            obj.rowRange = response.result.updates.updatedRange.replace(/:[A-Z]{0,2}([0-9]{0,5})$/, ':ZZ$1');
            if (autoGetNewID) {
              callback(response.result.updates.updatedData.values[0][0]); // Send New ID for assignment
            }
            resolve();
          } else {
            reject();
          }
        },
        function (error) {
          PkuyApp.error('appendObjToSheetTable.put: ' + JSON.stringify(error, null, 2));
          reject();
        });
    });

    /* Registrar UPDATELOGS para las otras terminales */
    if (tableName !== 'updateLog') { // Evitar recursividad infinita
      for (let i = 0; i < PkuyApp.db.maestroTerminales.recordSet.length; i++) {
        const terminal = PkuyApp.db.maestroTerminales.recordSet[i];
        if (terminal.terminalID == PkuyApp.thisTerminalID) // No registrar UpdateLogs para esta terminal
          continue;
        var updateLog = new cl_updateLog({
          updTS: Date.now(),
          terminalID: terminal.terminalID,
          updRowRange: obj.rowRange // Rango Actualizado en la BD
        });
        PkuyApp.appendObjToSheetTable(updateLog, 'updateLog'); // Llamada recursiva
      }
    };

    return obj;
  },

  updateObjToSheetTable: async function (obj, tableName) {

    var cab = await PkuyApp.getCabOfTable(tableName);

    obj.TS = new Date().toISOString();
    obj.usuario = PkuyApp.authUser.email;

    recordValues = [];
    // Mapear objeto a recordValues
    for (let i = 0; i < cab.length; i++) {
      let field = cab[i];

      if (obj[cab[i]] === undefined)
        recordValues.push(null);
      else
        recordValues.push(obj[field]);
    }

    console.debug('DEBUG // update http send');
    console.debug(recordValues);

    await new Promise(function (resolve, reject) {
      gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tableName + obj.rowRange,
        valueInputOption: 'USER_ENTERED',
        resource: {
          "majorDimension": "ROWS",
          "values": [recordValues]
        }
      }).then(
        function (response) {
          if (response.result.updatedRows > 0)
            resolve();
          else
            reject();
        },
        function (error) {
          PkuyApp.error('appendObjToSheetTable.put: ' + JSON.stringify(error, null, 2));
          reject();
        });
    });

    return obj;
  },

  updateStockDiario: function () {
    // 1. Get stock corriente (tabla stock_01)
    // 2. Sumarizar por Producto/Depósito
    // 3. Insertar stock estadístico a las 00:00 del día de la fecha -u hora de ejecución- (tabla stock_stat)
    // 4. Copiar entradas stock corriente del punto 1 a stock histórico (tabla stock_hist)
    // 5. Borrar/Blanquear tabla stock corriente (tabla stock_01)
  },

  getStockProducto: function (prodID, almID = null) {
    // 1. Get stock estadístico -filtrado por prodID (y almID)- (tabla stock_stat)
    // 2. Get stock corriente -filtrado por prodID (y almID)-  (tabla stock_01)
    // 3. Sumarizar por Depósito
  },

  getStockDeposito: function (almID) {
    // 1. Get stock estadístico -filtrado por almID- (tabla stock_stat)
    // 2. Get stock corriente -filtrado por almID- (tabla stock_01)
    // 3. Sumarizar por Producto
  },

  getStockProductoMovimientos: function (prodID, almID) {
    // 1. Get stock estadístico -filtrado por prodID y almID- (tabla stock_stat)
    // 2. Get stock corriente -filtrado por almID y almID- (tabla stock_01)
    // 3. Recorrer tabla agregando un field más que sea sum = stock_stat + stock01(...)
  },

  checkStockDisponible: function (prodID, almID, cant) {
    // 1. PkuyApp.getStockProducto(prodID, almID)
    // 2. if(stock.cant >= cant) ok 
    // 3. else "cantidad no disponible"
  },

  nuevoMovimiento: function (prodID, almID, cant, claseMov, ordID) {
    // 1. if (claseMov = "Egreso") > PkuyApp.checkStockDisponible(prodID, almID, cant)
    // 2. new cl_movimiento(........) <<<--- CONSTRUCTOR DEBE VALIDAR claseMov, ordID CONTRA MAESTRO
    // 3. PkuyApp.appendObjToSheetTable(.....)
  },

  backupPkuyDB: function () {

    var newFile = PkuyApp.dbBackupNombre + PkuyApp.yyyymmdd();
    var request = gapi.client.drive.files.copy({
      'fileId': PkuyApp.dbSpreadsheet,
      'resource': { 'title': newFile }
    });
    request.execute(function (resp) {
      PkuyApp.log('PkuyDB backup realizado, archivo ' + newFile + ' (' + resp.id + ') creado en Google Drive');
      nuevoDBBackup = {
        'dbBackup': newFile,
        'dbBackupID': resp.id,
      };
      PkuyApp.appendObjToSheetTable(nuevoDBBackup, 'dbbackup_01', false)
    });
  },

  nuevoCliente: async function (nuevoCliente, nuevaDireccion) {

    try {
      /*------------------------------------------------------------------*/
      /*  Registrar dirección en DB obtenienndo newID */
      await PkuyApp.appendObjToSheetTable(nuevaDireccion, cl_maestroDirecciones.sheetName(), true,
        (newID) => nuevaDireccion.dirID = nuevoCliente.dirID = newID);

      /*  Registrar dirección localmente */
      PkuyApp.db.maestroDirecciones.add(nuevaDireccion);

      /*------------------------------------------------------------------*/
      /*  Registrar cliente en DB obtenienndo newID */
      await PkuyApp.appendObjToSheetTable(nuevoCliente, cl_maestroClientes.sheetName(), true,
        (newID) => nuevoCliente.cliID = newID);

      /*  Registrar cliente localmente */
      PkuyApp.db.maestroClientes.add(nuevoCliente);

      // Guardar Cambios
      PkuyApp.saveLocalDB();

      /*------------------------------------------------------------------*/
      /*  Error */
    } catch (e) {
      PkuyApp.error(e);
      return;
    }

    /*------------------------------------------------------------------*/
    /*  Notificar */
    PkuyApp.notificacion('Cliente Creado', false, 'El Cliente ' + nuevoCliente.cliID
      + ' (' + nuevoCliente.nombreCliente() + ') ha sido creado correctamente\n'
      + 'con dirección nro. ' + nuevoCliente.dirID + '.');
    PkuyApp.log('Cliente Nro.' + nuevoCliente.cliID + ' creado con dirección ' + nuevoCliente.dirID);
    return nuevoCliente;

  },

  nuevoProducto: async function (nuevoProducto) {

    try {
      /*------------------------------------------------------------------*/
      /*  Registrar Producto en DB obtenienndo newID */
      await PkuyApp.appendObjToSheetTable(nuevoProducto, cl_maestroProductos.sheetName(), true,
        (newID) => nuevoProducto.prodID = newID);

      /*  Registrar Producto localmente */
      PkuyApp.db.maestroProductos.add(nuevoProducto);

      // Guardar Cambios
      PkuyApp.saveLocalDB();

      /*------------------------------------------------------------------*/
      /*  Error */
    } catch (e) {
      PkuyApp.error(e);
      return;
    }

    /*------------------------------------------------------------------*/
    /*  Notificar */
    PkuyApp.notificacion('Producto Creado', false, 'El Producto ' + nuevoProducto.prodID
      + ' (' + nuevoProducto.descripcion + ') ha sido creado correctamente!');
    PkuyApp.log('Producto ' + nuevoProducto.prodID + ' (' + nuevoProducto.descripcion + ') creado');
    return nuevoProducto;

  },

  nuevaCotizacionRetries: 0,

  nuevaCotizacion: async function (nuevaCotizacion) {

    /*------------------------------------------------------------------*/
    /*  Control y Recursive async call */
    if (PkuyApp.nuevaCotizacionRetries >= PkuyApp.httpRetriesAllowed)
      return;

    /* Esperar a que se haya cargado la DB */
    if (JSON.stringify(PkuyApp.db.maestroCotizaciones) === '{}') {
      PkuyApp.nuevaCotizacionRetries++;
      setTimeout(() => { PkuyApp.nuevaCotizacion(nuevaCotizacion) }, PkuyApp.httpRetriesDelay);
      return;
    }
    PkuyApp.nuevaCotizacionRetries = 0;

    /*------------------------------------------------------------------*/
    /*  Registrar cotización localmente */
    try {
      PkuyApp.db.maestroCotizaciones.add(nuevaCotizacion);
      PkuyApp.saveLocalDB();

      /*------------------------------------------------------------------*/
      /*  Error */
    } catch (e) {
      PkuyApp.error(e);
      return;
    }

    /*------------------------------------------------------------------*/
    /*  Registrar cotización en DB */
    if (PkuyApp.db.maestroCotizaciones.getLast(nuevaCotizacion.monedaDe, nuevaCotizacion.monedaA).cotizacionTS < nuevaCotizacion.cotizacionTS) {
      /*  Si la cotización aún no fue registrada -> Registrar */
      PkuyApp.appendObjToSheetTable(nuevaCotizacion, cl_maestroCotizaciones.sheetName(), false);
    }

    /*------------------------------------------------------------------*/
    /*  Notificar */
    // PkuyApp.notificacion('Cotización registrada', false, 'Cotización de ' + nuevaCotizacion.monedaDe + ' a ' + nuevaCotizacion.monedaA + ' registrada correctamente');
    PkuyApp.log('Cotización de ' + nuevaCotizacion.monedaDe + ' a ' + nuevaCotizacion.monedaA + ' registrada correctamente');
    return nuevaCotizacion;

  },


  nuevoPrecio: async function (nuevoPrecio) {

    /*------------------------------------------------------------------*/
    /*  Registrar precio localmente */
    try {
      PkuyApp.db.maestroPrecios.add(nuevoPrecio);
      PkuyApp.saveLocalDB();

      /*------------------------------------------------------------------*/
      /*  Error */
    } catch (e) {
      PkuyApp.error(e);
      return;
    }

    /*------------------------------------------------------------------*/
    /*  Registrar precio en DB */
    PkuyApp.appendObjToSheetTable(nuevoPrecio, cl_maestroPrecios.sheetName(), false);


    /*------------------------------------------------------------------*/
    /*  Notificar */
    // PkuyApp.notificacion('Precio registrado', false, 'Precio ' + nuevoPrecio.tipoPrecio + ' para el producto ' + nuevoPrecio.prodID + ' registrado correctamente');
    PkuyApp.log('Precio ' + nuevoPrecio.tipoPrecio + ' para el producto ' + nuevoPrecio.prodID + ' registrado correctamente');
    return nuevoPrecio;

  },

  /**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
  insertFileToDrive: function (fileData, driveFileOptions, callback) {
    const boundary = '-------358329793846319265415';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {

      var contentType = fileData.type || 'application/octet-stream';

      var metadata = {
        'mimeType': contentType,
        'originalFilename': fileData.name,
      };

      // Copiar opciones de llamada
      Object.assign(metadata, driveFileOptions);

      // Último chequeo Title.
      metadata.title = metadata.title || fileData.name;

      var base64Data = btoa(reader.result);
      var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

      var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {
          'uploadType': 'multipart',
          'visibility': 'PRIVATE',
          'convert': false,
          'ocr': false
        },
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
      });

      var jumpCallback = function (driveFile) {
        console.log('DRIVE API CALL!!!!!');
        console.log('Sent', multipartRequestBody);
        console.log('Response', driveFile);
        if (callback)
          callback(driveFile)
      };

      request.execute(jumpCallback);
    }
  },

  deleteFileFromDrive: function (fileId) {
    var request = gapi.client.drive.files.delete({
      'fileId': fileId
    });
    request.execute((resp) => { });
  },

  log: function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'OK');
    console.log(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  },

  error: function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'Error');
    console.error(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  },

  warn: function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'Cuidado');
    console.warn(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  },

  upTime: function () {
    return Date.now() - PkuyApp.startUpTS;
  },

  constructMsgObj: function (message, msgType) {
    return {
      time: PkuyApp.upTime(),
      type: msgType,
      msg: message,
      presentar: function () { return '[' + this.time + '] ' + this.type + ' > ' + this.msg }
    }
  },

  logView: function (msgObj) {
    var span = document.createElement("span");
    var text = document.createTextNode(msgObj.presentar());
    span.appendChild(text);
    if (msgObj.type === 'Error')
      span.classList.add('error');
    if (msgObj.type === 'Cuidado')
      span.classList.add('warn');
    PkuyApp.consolaDiv.insertBefore(span, PkuyApp.consolaDiv.firstChild);

  },

  yyyymmdd: function () {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    return '' + y + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d;
  },

  getCabOfTable: async function (tableName) {

    if (PkuyApp.cabs[tableName] !== undefined)
      return PkuyApp.cabs[tableName];

    var cab = [];
    await new Promise(function (resolve, reject) {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tableName + '!A1:ZZ1',
        majorDimension: 'ROWS'
      }).then(function (responseHead) {
        // Puntero a Cabecera
        cab = responseHead.result.values[0];
        resolve();
      }, function () {
        reject();
      });
    });

    PkuyApp.cabs[tableName] = cab;
    return cab;
  },

  notificacion: async function (titulo, esperarCierre, cuerpo) {
    var n = new Notification(titulo, {
      "body": cuerpo,
      "tag": "PkuyNotif_" + PkuyApp.upTime(),
      "icon": PkuyApp.iconBig,
      // "image": PkuyApp.iconBig,
      "data": '->' + cuerpo,
      "renotify": 'false',
      actions: [
        {
          action: 'archive',
          title: 'Archivar'
        }
      ],
      "requireInteraction": esperarCierre ? 'true' : 'false'
    });
  },

  // Conversiones de monedas
  convertUSDtoARS: (valor) => valor * PkuyApp.db.dolar.oficial.venta,
  convertUSDBtoARS: (valor) => valor * PkuyApp.db.dolar.blue.venta,
  convertARStoUSD: (valor) => valor / PkuyApp.db.dolar.oficial.compra,
  convertARStoUSDB: (valor) => valor / PkuyApp.db.dolar.blue.compra,

  // TODO: Borrar!
  testMode: true


};

// Cargar Credenciales
if (typeof PkuyAppKeys === 'undefined')
  throw new Error("Faltan Credenciales");
else
  Object.assign(PkuyApp, PkuyAppKeys);

// Register service worker: PkuyApp Offline 
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//     .register('sw.js')
//     .then(function (reg) { console.debug('Service Worker Registered :', reg); });
// }
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}