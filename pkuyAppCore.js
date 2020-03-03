var PkuyApp = {
  ver: '1.0',
  author: 'laucape@gmail.com',
  startUpTS: Date.now(),
  db: {},
  logStorage: [],
  contactos: [],
  cabs: [],
  localStorageName: 'PkuyDB',
  defaultSheetRows: 10000,
  defaultContactsPerCall: 1000,
  icon: "pkuy-icon-1x.png",
  consolaDiv: document.getElementById('consolaDiv'),
  dbBackupNombre: 'PkuyDB_backup_',
  descuentos: ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90"],

  updateSigninStatus: function (isSignedIn) {
    PkuyApp.gapiSignedIn = isSignedIn;
  },

  handleAuthClick: function (event) {
    PkuyApp.log('PkuyApp -singin-');
    gapi.auth2.getAuthInstance().signIn();
  },

  handleSignoutClick: function (event) {
    PkuyApp.log('PkuyApp -signout-');
    gapi.auth2.getAuthInstance().signOut();
  },

  startPkuyDB: function (callback = function () { }) {
    PkuyApp.onLoaded = callback;

    new Promise(function (resolve) {
      gapi.load('client:auth2', function () { resolve(); });
    }).then(function () {
      PkuyApp.mainLoad()
    });
  },

  mainLoad: function () {

    var initProm = new Promise(function (resolve, reject) {
      gapi.client.init(PkuyApp.gapiClientParams)
        .then(
          function () {
            resolve();
          },
          function (error) {
            reject(error);
          })
    });

    initProm.catch((error) => PkuyApp.error('Error en gapi.client.init! ' + JSON.stringify(error, null, 2)))

    initProm.then(async function () {
      // Set GAPI Signing Status
      PkuyApp.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      gapi.auth2.getAuthInstance().isSignedIn.listen(PkuyApp.updateSigninStatus);

      if (PkuyApp.gapiSignedIn === false) {
        PkuyApp.error('PkuyApp no está conectado a tu cuenta de Google.'
          + ' Conectalo desde el menú 0.Sistema > Conectar con Google')
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

      if (localStorageDB && (localStorageDB.ts >= (Date.now() - 3600000))) {
        // Si hay y su TS < 1 hora >>> Recuperar DB desde localStorage
        PkuyApp.log('Recuperando PkuyDB desde localStorage');

        // Inicializar DB desde la data recolectada
        PkuyApp.initPkuyDB(localStorageDB);

        await PROMuserData;

        // EVENT???
        PkuyApp.onLoaded();

      } else {

        // Descargar desde Google Sheets
        PkuyApp.log('Descargando PkuyDB desde Google Sheets');

        var tmpData = {};
        tmpData.maestroClientes = {};
        tmpData.maestroPedidos = {};
        tmpData.statusPedidos = {};
        tmpData.tiposStatusPedido = {};
        tmpData.maestroAlmacenes = {};
        tmpData.maestroPtosDespacho = {};
        tmpData.maestroMediosPago = {};
        tmpData.maestroProductos = {};
        tmpData.maestroPrecios = {};
        tmpData.tiposPrecios = {};
        tmpData.maestroMovimientos = {};
        tmpData.tiposMovimiento = {};
        tmpData.maestroCalculosStock = {};
        tmpData.maestroDirecciones = {};

        // 01 cl_maestroClientes
        var PROMmaestroClientes = PkuyApp.loadSheetTableToObj(cl_maestroClientes.sheetName())
          .then((data) => { tmpData.maestroClientes.recordSet = (data); PkuyApp.log('maestroClientes Descargado') })
          .catch((error) => { PkuyApp.error('maestroClientes > ' + JSON.stringify(error)) });

        // 02 cl_maestroPedidos
        var PROMmaestroPedidos = PkuyApp.loadSheetTableToObj(cl_maestroPedidos.sheetName())
          .then((data) => { tmpData.maestroPedidos.recordSet = (data); PkuyApp.log('maestroPedidos Descargado') })
          .catch((error) => { PkuyApp.error('maestroPedidos > ' + JSON.stringify(error)) });

        // 03 cl_statusPedidos
        var PROMstatusPedidos = PkuyApp.loadSheetTableToObj(cl_statusPedidos.sheetName())
          .then((data) => { tmpData.statusPedidos.recordSet = (data); PkuyApp.log('statusPedidos Descargado') })
          .catch((error) => { PkuyApp.error('statusPedidos > ' + JSON.stringify(error)) });

        // 04 cl_tiposStatusPedido
        var PROMtiposStatusPedido = PkuyApp.loadSheetTableToObj(cl_tiposStatusPedido.sheetName())
          .then((data) => { tmpData.tiposStatusPedido.recordSet = (data); PkuyApp.log('tiposStatusPedido Descargado') })
          .catch((error) => { PkuyApp.error('tiposStatusPedido > ' + JSON.stringify(error)) });

        // 05 cl_maestroAlmacenes
        var PROMmaestroAlmacenes = PkuyApp.loadSheetTableToObj(cl_maestroAlmacenes.sheetName())
          .then((data) => { tmpData.maestroAlmacenes.recordSet = (data); PkuyApp.log('maestroAlmacenes Descargado') })
          .catch((error) => { PkuyApp.error('maestroAlmacenes > ' + JSON.stringify(error)) });

        // 06 cl_maestroPtosDespacho
        var PROMmaestroPtosDespacho = PkuyApp.loadSheetTableToObj(cl_maestroPtosDespacho.sheetName())
          .then((data) => { tmpData.maestroPtosDespacho.recordSet = (data); PkuyApp.log('maestroPtosDespacho Descargado') })
          .catch((error) => { PkuyApp.error('maestroPtosDespacho > ' + JSON.stringify(error)) });

        // 07 cl_maestroMediosPago
        var PROMmaestroMediosPago = PkuyApp.loadSheetTableToObj(cl_maestroMediosPago.sheetName())
          .then((data) => { tmpData.maestroMediosPago.recordSet = (data); PkuyApp.log('mediosPago Descargado') })
          .catch((error) => { PkuyApp.error('mediosPago > ' + JSON.stringify(error)) });

        // 08 cl_maestroProductos
        var PROMmaestroProductos = PkuyApp.loadSheetTableToObj(cl_maestroProductos.sheetName())
          .then((data) => { tmpData.maestroProductos.recordSet = (data); PkuyApp.log('maestroProductos Descargado') })
          .catch((error) => { PkuyApp.error('maestroProductos > ' + JSON.stringify(error)) });

        // 09 cl_maestroPrecios
        var PROMmaestroPrecios = PkuyApp.loadSheetTableToObj(cl_maestroPrecios.sheetName())
          .then((data) => { tmpData.maestroPrecios.recordSet = (data); PkuyApp.log('maestroPrecios Descargado') })
          .catch((error) => { PkuyApp.error('maestroPrecios > ' + JSON.stringify(error)) });

        // 10 cl_tiposPrecios
        var PROMtiposPrecios = PkuyApp.loadSheetTableToObj(cl_tiposPrecios.sheetName())
          .then((data) => { tmpData.tiposPrecios.recordSet = (data); PkuyApp.log('tiposPrecios Descargado') })
          .catch((error) => { PkuyApp.error('tiposPrecios > ' + JSON.stringify(error)) });

        // 11 cl_maestroMovimientos
        var PROMmaestroMovimientos = PkuyApp.loadSheetTableToObj(cl_maestroMovimientos.sheetName())
          .then((data) => { tmpData.maestroMovimientos.recordSet = (data); PkuyApp.log('maestroMovimientos Descargado') })
          .catch((error) => { PkuyApp.error('maestroMovimientos > ' + JSON.stringify(error)) });

        // 12 cl_tiposMovimiento
        var PROMtiposMovimiento = PkuyApp.loadSheetTableToObj(cl_tiposMovimiento.sheetName())
          .then((data) => { tmpData.tiposMovimiento.recordSet = (data); PkuyApp.log('tiposMovimiento Descargado') })
          .catch((error) => { PkuyApp.error('cl_tiposMovimiento > ' + JSON.stringify(error)) });

        // 13 cl_maestroCalculosStock
        var PROMmaestroCalculosStock = PkuyApp.loadSheetTableToObj(cl_maestroCalculosStock.sheetName())
          .then((data) => { tmpData.maestroCalculosStock.recordSet = (data); PkuyApp.log('maestroCalculosStock Descargado') })
          .catch((error) => { PkuyApp.error('maestroCalculosStock > ' + JSON.stringify(error)) });

        // 14 cl_maestroDirecciones
        var PROMmaestroDirecciones = PkuyApp.loadSheetTableToObj(cl_maestroDirecciones.sheetName())
          .then((data) => { tmpData.maestroDirecciones.recordSet = (data); PkuyApp.log('direcciones Descargado') })
          .catch((error) => { PkuyApp.error('direcciones > ' + JSON.stringify(error)) });

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
        ];

        Promise.all(startupPROMS)
          .then(function () {
            // Inicializar DB desde la data recolectada
            PkuyApp.initPkuyDB(tmpData);

            // Backup en localStorage
            PkuyApp.log("Backup to localStorage");
            PkuyApp.db.ts = Date.now();
            PkuyApp.saveLocalDB();

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

      if (startRecord > endRecord)
        reject();

      var returnTable = new Array();

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
          return resolve(returnTable);

        } else {
          reject('[Warn] loadSheetTableToObj.get: No data found.');
        }
      }, function (error) {
        reject('[Error] loadSheetTableToObj.get: ' + JSON.stringify(error, null, 2));
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

  appendObjToSheetTable: async function (obj, tableName, autoGetNewID = false, callback = function () { }) {

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

    // Primer campo como ID
    if (autoGetNewID) {
      recordValues[0] = '=INDIRECT("R[-1]C[0]",FALSE)+1';
    }

    console.debug('append http send');
    console.debug(recordValues);

    await new Promise(function (resolve, reject) {
      gapi.client.sheets.spreadsheets.values.append({
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
              callback(response.result.updates.updatedData.values[0][0]);
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

    console.debug('update http send');
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
    console.debug("nuevoCliente called")
    await PkuyApp.appendObjToSheetTable(nuevaDireccion, cl_maestroDirecciones.sheetName(), true,
      (newID) => nuevaDireccion.dirID = nuevoCliente.dirID = newID);

    await PkuyApp.appendObjToSheetTable(nuevoCliente, cl_maestroClientes.sheetName(), true,
      (newID) => nuevoCliente.cliID = newID);

    PkuyApp.db.maestroClientes.add(nuevoCliente);
    PkuyApp.db.maestroDirecciones.add(nuevaDireccion);
    PkuyApp.saveLocalDB();

    PkuyApp.notificacion('Cliente Creado', false, 'El Cliente ' + nuevoCliente.cliID
      + ' (' + nuevoCliente.nombre + ' ' + nuevoCliente.apellido + ') ha sido creado correctamente!\n'
      + 'Su dirección es la número ' + nuevoCliente.dirID + '.');
    PkuyApp.log('Cliente Nro.' + nuevoCliente.cliID + ' creado con dirección ' + nuevoCliente.dirID);
    return nuevoCliente;

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
    console.debug("notificacion");
    new Notification(titulo, {
      "body": cuerpo,
      "tag": "PkuyNotif_" + PkuyApp.upTime(),
      "icon": PkuyApp.icon,
      "renotify": 'false',
      "requireInteraction": esperarCierre ? 'true' : 'false'
    });
  },

  // TODO: Borrar!
  testMode: true

};

// Cargar Credenciales
if (typeof PkuyAppKeys === 'undefined')
  throw new Error("Faltan Credenciales");
else
  Object.assign(PkuyApp, PkuyAppKeys);

