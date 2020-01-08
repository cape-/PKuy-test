; {
  if (typeof PkuyApp === 'undefined' ||
    (typeof PkuyApp !== 'undefined' && typeof PkuyApp.keysSet === 'undefined'))
    throw new Error("Faltan Credenciales");

  PkuyApp.ver = '1.0';
  PkuyApp.author = 'laucape@gmail.com';
  PkuyApp.startUpTS = Date.now();
  PkuyApp.db = {};
  PkuyApp.logStorage = [];
  PkuyApp.localStorageName = 'PkuyDB'
  PkuyApp.defaultSheetRows = 10000;
  PkuyApp.defaultContactsPerCall = 1000;
  PkuyApp.consolaDiv = document.getElementById('consolaDiv');

  PkuyApp.updateSigninStatus = function (isSignedIn) {
    PkuyApp.gapiSignedIn = isSignedIn;
  };

  PkuyApp.handleAuthClick = function (event) {
    PkuyApp.log('PkuyApp -singin-');
    gapi.auth2.getAuthInstance().signIn();
  };

  PkuyApp.handleSignoutClick = function (event) {
    PkuyApp.log('PkuyApp -signout-');
    gapi.auth2.getAuthInstance().signOut();
  };

  PkuyApp.startPkuyDB = function (callback = function () { }) {
    PkuyApp.onLoaded = callback;
    gapi.load('client:auth2', PkuyApp.mainLoad);
  };

  PkuyApp.mainLoad = function () {

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

    initProm.catch((error) => PkuyApp.error('mainLoad' + JSON.stringify(error, null, 2)))

    initProm.then(function () {
      // Set GAPI Signing Status
      PkuyApp.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      gapi.auth2.getAuthInstance().isSignedIn.listen(PkuyApp.updateSigninStatus);

      // Cargar Current User
      PkuyApp.loadUserData(
        function (data) {
          PkuyApp.log('Cargando Datos del Usuario .currentUser');
          PkuyApp.currentUser = {};
          PkuyApp.currentUser.id = data.resourceName.split('/')[1];
          PkuyApp.currentUser.email = data.emailAddresses[0].value;
          PkuyApp.currentUser.nombre = data.names[0].givenName;
          PkuyApp.currentUser.nombreCompleto = data.names[0].displayName;
        });

      // Cargar Auth User
      PkuyApp.log('Cargando Datos del Usuario .authUser');
      PkuyApp.authUser = {};
      PkuyApp.authUser.id = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getId();
      PkuyApp.authUser.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
      PkuyApp.authUser.nombre = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName();
      PkuyApp.authUser.nombreCompleto = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();

      //  Determinar si hay backup en localStorage
      var localStorageDB = JSON.parse(window.localStorage.getItem('' + PkuyApp.localStorageName));

      if (localStorageDB && (localStorageDB.ts >= (Date.now() - 3600000))) {
        // Si hay y su TS < 1 hora >>> Recuperar DB desde localStorage
        PkuyApp.log('Recuperando PkuyDB desde localStorage');

        // Inicializar DB desde la data recolectada
        PkuyApp.initPkuyDB(localStorageDB);

        // EVENT???
        PkuyApp.maestroClientesLoaded();

      } else {

        // Descargar desde Google Sheets
        PkuyApp.log('Descargando PkuyDB desde Google Sheets');
        var PROMmaestroCli = PkuyApp.loadSheetTableToObj(cl_maestroClientes.sheetName());
        var PROMmaestroDir = PkuyApp.loadSheetTableToObj(cl_maestroDirecciones.sheetName());
        var PROMmaestroProd = PkuyApp.loadSheetTableToObj(cl_maestroProductos.sheetName());
        var PROMmaestroPed = PkuyApp.loadSheetTableToObj(cl_maestroPedidos.sheetName());
        var PROMmaestroAlm = PkuyApp.loadSheetTableToObj(cl_maestroAlmacenes.sheetName());
        var PROMmaestroPtoD = PkuyApp.loadSheetTableToObj(cl_maestroPtosDespacho.sheetName());
        var PROMmaestroMedP = PkuyApp.loadSheetTableToObj(cl_maestroMediosPago.sheetName());

        var tmpData = {};

        PROMmaestroCli.then((data) => { tmpData.maestroClientes = (data); PkuyApp.maestroClientesLoaded(); });
        PROMmaestroDir.then((data) => tmpData.direcciones = (data));
        PROMmaestroProd.then((data) => tmpData.maestroProductos = (data));
        PROMmaestroPed.then((data) => tmpData.maestroPedidos = (data));
        PROMmaestroAlm.then((data) => tmpData.maestroAlmacenes = (data));
        PROMmaestroPtoD.then((data) => tmpData.maestroPtosDespacho = (data));
        PROMmaestroMedP.then((data) => tmpData.mediosPago = (data));

        Promise.all([PROMmaestroCli, PROMmaestroDir, PROMmaestroProd, PROMmaestroPed, PROMmaestroAlm, PROMmaestroPtoD, PROMmaestroMedP])
          .then(function () {
            // Inicializar DB desde la data recolectada
            PkuyApp.initPkuyDB(tmpData);

            // Backup en localStorage
            PkuyApp.log("Backup to localStorage");
            PkuyApp.db.ts = Date.now();
            window.localStorage.setItem('' + PkuyApp.localStorageName, JSON.stringify(PkuyApp.db));

          });

      }
    });
  };

  PkuyApp.initPkuyDB = function (data) {
    if (data.maestroClientes) {
      PkuyApp.db.maestroClientes = new cl_maestroClientes(data);
      PkuyApp.log('.maestroClientes');
    } else {
      PkuyApp.log('(NO) .maestroClientes');
    }

    if (data.direcciones) {
      PkuyApp.db.direcciones = new cl_maestroDirecciones(data);
      PkuyApp.log('.direcciones');
    } else {
      PkuyApp.log('(NO) .direcciones');
    }

    if (data.maestroProductos) {
      PkuyApp.db.maestroProductos = new cl_maestroProductos(data);
      PkuyApp.log('.maestroProductos');
    } else {
      PkuyApp.log('(NO) .maestroProductos');
    }

    if (data.maestroPedidos) {
      PkuyApp.db.maestroPedidos = new cl_maestroPedidos(data);
      PkuyApp.log('.maestroPedidos');
    } else {
      PkuyApp.log('(NO) .maestroPedidos');
    }

    if (data.maestroAlmacenes) {
      PkuyApp.db.maestroAlmacenes = new cl_maestroAlmacenes(data);
      PkuyApp.log('.maestroAlmacenes');
    } else {
      PkuyApp.log('(NO) .maestroAlmacenes');
    }

    if (data.maestroPtosDespacho) {
      PkuyApp.db.maestroPtosDespacho = new cl_maestroPtosDespacho(data);
      PkuyApp.log('.maestroPtosDespacho');
    } else {
      PkuyApp.log('(NO) .maestroPtosDespacho');
    }

    if (data.mediosPago) {
      PkuyApp.db.mediosPago = new cl_maestroMediosPago(data);
      PkuyApp.log('.maestroMediosPago');
    } else {
      PkuyApp.log('(NO) .maestroMediosPago');
    }
  }

  PkuyApp.loadUserData = function (callback) {
    gapi.client.people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    }).then(function (response) {
      callback(response.result);
    }, function (error) {
      PkuyApp.error('loadUserData.get' + JSON.stringify(error, null, 2));
    });
  };


  PkuyApp.maestroClientesLoaded = function () {
    // Descarga Recursiva de Contactos de Google
    PkuyApp.contactos = [];
    PkuyApp.loadContactsToTable('', (data) => {
      PkuyApp.log('...descargando contactos');
      PkuyApp.contactos.push(...data.connections);
    }, () => {
      PkuyApp.log('Contactos descargados');

      PkuyApp.cruzarClientesContactos(PkuyApp.contactos, PkuyApp.db.maestroClientes);
      PkuyApp.log('Contactos Cruzados con Clientes');
      PkuyApp.onLoaded();
    });
  }

  PkuyApp.loadContactsToTable = function (nextPage, callback, onFinishedLoaded) {
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
  };

  PkuyApp.cruzarClientesContactos = function (contactos, maestroClientes) {
    // Match Contactos de Google con Clientes de PkuyApp
    for (let index = 0; index < maestroClientes.recordSet.length; index++) {
      const cliente = maestroClientes.recordSet[index];
      if (cliente.resourceName == '' || cliente.resourceName == undefined) continue;
      for (let index2 = 0; index2 < contactos.length; index2++) {
        const contacto = contactos[index2];
        if (contacto.resourceName == cliente.resourceName) {
          contacto.cliID = cliente.cliID;
        }
      }
    }
  };

  PkuyApp.loadSheetTableToObj = function (tableName, startRecord = 1, endRecord = null) {
    return new Promise((resolve, reject) => {
      var returnTable = new Array();
      var cab;

      if (startRecord < endRecord) return null;
      var tabRange = tableName + "!A" + (startRecord + 1) + ":ZZ" + ((endRecord == null ? PkuyApp.defaultSheetRows : endRecord) + 1);

      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tableName + '!A1:ZZ1',
        majorDimension: 'ROWS'
      }).then(function (responseHead) {
        // Puntero a Cabecera
        cab = responseHead.result.values[0];
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
            resolve(returnTable);
          } else {
            reject('[Warn] loadSheetTableToObj.get: No data found.');
          }
        }, function (error) {
          reject('[Error] loadSheetTableToObj.get: ' + JSON.stringify(error, null, 2));
        });
      }, function (error) {
        reject('[Error] loadSheetTableToObj.get.cab: ' + JSON.stringify(error, null, 2));

      });
    });
  };

  PkuyApp.updateObjToSheetTable = function (obj, tableName, callback) {
    var cab;

    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: PkuyApp.dbSpreadsheet,
      range: tableName + '!A1:ZZ1',
      majorDimension: 'ROWS'
    }).then(function (responseHead) {
      // Puntero a Cabecera
      cab = responseHead.result.values[0];
      recordValues = [];
      for (let i = 0; i < cab.length; i++) {
        if (obj[cab[i]] == undefined)
          recordValues.push(null);
        else
          recordValues.push(obj[cab[i]]);
      }
      console.debug('update http send');
      console.debug(obj.rowRange);
      console.debug(recordValues);
      gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: obj.rowRange,
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: 'true'
      }, { "values": [recordValues] }).then(
        function (response) {
          callback(response.result.updatedData);
        }, function (error) {
          PkuyApp.error('updateObjToSheetTable.update: ' + JSON.stringify(error, null, 2));
        });
    }, function (error) {
      PkuyApp.error('updateObjToSheetTable.get: ' + JSON.stringify(error, null, 2));
    });
  };

  PkuyApp.appendObjToSheetTable = function (obj, tableName, autoGetNewID = false, callback) {
    var cab;

    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: PkuyApp.dbSpreadsheet,
      range: tableName + '!A1:ZZ1',
      majorDimension: 'ROWS'
    }).then(function (responseHead) {
      // Puntero a Cabecera
      cab = responseHead.result.values[0];
      recordValues = [];
      for (let i = 0; i < cab.length; i++) {
        if (obj[cab[i]] == undefined)
          recordValues.push(null);
        else
          recordValues.push(obj[cab[i]]);
      }
      if (autoGetNewID) {
        recordValues[0] = '=INDIRECT("R[-1]C[0]",FALSE)+1';
      }
      console.debug('append http send');
      console.debug(recordValues);
      gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: PkuyApp.dbSpreadsheet,
        range: tableName + '!A2:ZZ' + PkuyApp.defaultSheetRows,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: "INSERT_ROWS",
        includeValuesInResponse: 'false',
        resource: {
          "majorDimension": "ROWS",
          "values": [recordValues]
        }
      }).then(
        function (response) {
          if (response.result.updates.updatedRange != undefined) {
            obj.rowRange = response.result.updates.updatedRange.replace(/:[A-Z]{0,2}([0-9]{0,5})$/, ':ZZ$1');
            obj.TS = new Date().toISOString();
            obj.usuario = PkuyApp.authUser.email;
            PkuyApp.updateObjToSheetTable(obj, tableName, callback);
          }
        }, function (error) {
          PkuyApp.error('appendObjToSheetTable.put: ' + JSON.stringify(error, null, 2));
        });
    }, function (error) {
      PkuyApp.error('appendObjToSheetTable.get: ' + JSON.stringify(error, null, 2));
    });
  };

  PkuyApp.listarContactos = function (start, end) {
    if (start == undefined) start = 0;
    if (end == undefined || end > PkuyApp.contactos.length) end = PkuyApp.contactos.length;
    let intermediateDiv = document.createElement('div');
    for (let i = start; i < end; i++) {
      if (PkuyApp.contactos[i].names !== undefined && PkuyApp.contactos[i].names[0].displayName !== undefined) {
        console.debug(i + '/' + PkuyApp.contactos[i].names[0].displayName);
        let newDiv;
        newDiv = document.createElement('div');
        newDiv.appendChild(document.createTextNode(i + ''));
        newDiv.appendChild(document.createElement('br'));
        newDiv.appendChild(document.createTextNode('' + PkuyApp.contactos[i].names[0].displayName));
        newDiv.setAttribute("class", "contacto")
        if (i % 3)
          newDiv.setAttribute("style", "background-color: darkcyan;")
        else
          newDiv.setAttribute("style", "background-color: coral;")
        intermediateDiv.appendChild(newDiv);
      }
    }
    intermediateDiv.setAttribute("style", "width: max-content;")
    contentDiv = document.getElementById('content');
    contentDiv.appendChild(intermediateDiv);
  };

  PkuyApp.consola = function () {
    if (console._log != undefined) return;
    if (typeof console != undefined)
      if (typeof console.log != undefined)
        console._log = console.log;
      else
        console._log = function () { };

    console.log = function (message) {
      console._log(message);
      var consolaDiv = document.getElementById('consolaDiv');
      consolaDiv.insertBefore(document.createElement('br'), consolaDiv.firstChild);
      consolaDiv.insertBefore(document.createTextNode(message), consolaDiv.firstChild);
      // consolaDiv.appendChild(document.createTextNode(message));

      // consolaDiv.appendChild(document.createElement("br"));
    };
    console.error = console.debug = console.info = console.log;
  };

  PkuyApp.log = function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'OK');
    console.log(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  };

  PkuyApp.error = function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'Error');
    console.error(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  };

  PkuyApp.warn = function (message) {
    var msgObj = PkuyApp.constructMsgObj(message, 'Cuidado');
    console.warn(msgObj.presentar());
    PkuyApp.logStorage.push(msgObj);
    PkuyApp.logView(msgObj);
  };

  PkuyApp.constructMsgObj = function (message, msgType) {
    return {
      time: Date.now() - PkuyApp.startUpTS,
      type: msgType,
      msg: message,
      presentar: function () { return '[' + this.time + '] ' + this.type + ' > ' + this.msg }
    }
  };

  PkuyApp.logView = function (msgObj) {
    var span = document.createElement("span");
    var text = document.createTextNode(msgObj.presentar());
    span.appendChild(text);
    if (msgObj.type === 'Error')
      span.classList.add('error');
    if (msgObj.type === 'Cuidado')
      span.classList.add('warn');
    PkuyApp.consolaDiv.insertBefore(span, PkuyApp.consolaDiv.firstChild);

  };

  // TODO: Borrar!
  PkuyApp.testMode = true;

}
