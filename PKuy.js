; {
  var PkuyApp = {};
  PkuyApp.ver = '1.0';
  PkuyApp.author = 'laucape@gmail.com';
  PkuyApp.tipos = {};
  PkuyApp.gapiClientParams = {
    "client_id": "299062314670-1g1rv86a1tcibkurn42ma93oco3ou6ul.apps.googleusercontent.com",
    "project_id": "quickstart-1574510515702",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "redirect_uris": ["http://localhost:8000"],
    "javascript_origins": ["http://localhost:8000"],
    "discoveryDocs": ["https://sheets.googleapis.com/$discovery/rest?version=v4", "https://people.googleapis.com/$discovery/rest?version=v1"],
    "scope": "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/contacts"
  };
  PkuyApp.dbSpreadsheet = '1O8y6zq7qmCtiWmg3Sj4VqTXlO7NQHorNWZjO3oSRlDg';
  PkuyApp.defaultSheetRows = 10000;
  PkuyApp.defaultContactsPerCall = 1000;

  PkuyApp.updateSigninStatus = function (isSignedIn) {
    return isSignedIn;
  };

  PkuyApp.handleAuthClick = function (event) {
    console.log('[Ok] PkuyApp -singin-');
    gapi.auth2.getAuthInstance().signIn();
  };

  PkuyApp.handleSignoutClick = function (event) {
    console.log('[Ok] PkuyApp -signout-');
    gapi.auth2.getAuthInstance().signOut();
  };

  PkuyApp.startPkuyDB = function (onLoaded) {
    PkuyApp.onLoaded = onLoaded;
    gapi.load('client:auth2', PkuyApp.mainLoad);
  };

  PkuyApp.mainLoad = function () {
    gapi.client.init(PkuyApp.gapiClientParams)
      .then(
        function () {
          PkuyApp.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          gapi.auth2.getAuthInstance().isSignedIn.listen(PkuyApp.updateSigninStatus);
        },
        function (error) {
          console.log('[Error] mainLoad' + JSON.stringify(error, null, 2));
          return;
        })
      .then(
        function () {
          console.log('[Ok] Cargando Datos del Usuario .currentUser');
          PkuyApp.loadUserData(
            function (data) {
              PkuyApp.currentUser = {};
              PkuyApp.currentUser.id = data.resourceName.split('/')[1];
              PkuyApp.currentUser.email = data.emailAddresses[0].value;
              PkuyApp.currentUser.nombre = data.names[0].givenName;
              PkuyApp.currentUser.nombreCompleto = data.names[0].displayName;
            });

          console.log('[Ok] Cargando Datos del Usuario .authUser');
          PkuyApp.authUser = {};
          PkuyApp.authUser.id = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getId();
          PkuyApp.authUser.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
          PkuyApp.authUser.nombre = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName();
          PkuyApp.authUser.nombreCompleto = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();

          // Descarga de la BD
          console.log('[Ok] Descargando PKuyDB');
          PkuyApp.loadSheetTableToObj(cl_maestroClientes.sheetName(),
            (data) => { PkuyApp.maestroClientes = new cl_maestroClientes(data); console.log('[Ok] .maestroClientes'); PkuyApp.maestroClientesLoaded(); });
          PkuyApp.loadSheetTableToObj(cl_maestroDirecciones.sheetName(),
            (data) => { PkuyApp.direcciones = new cl_maestroDirecciones(data); console.log('[Ok] .direcciones'); });
          PkuyApp.loadSheetTableToObj(cl_maestroProductos.sheetName(),
            (data) => { PkuyApp.maestroProductos = new cl_maestroProductos(data); console.log('[Ok] .maestroProducto'); });
          PkuyApp.loadSheetTableToObj(cl_maestroPedidos.sheetName(),
            (data) => { PkuyApp.maestroPedidos = new cl_maestroPedidos(data); console.log('[Ok] .maestroPedidos'); });
          PkuyApp.loadSheetTableToObj(cl_maestroAlmacenes.sheetName(),
            (data) => { PkuyApp.maestroAlmacenes = new cl_maestroAlmacenes(data); console.log('[Ok] .maestroAlmacenes'); });
          PkuyApp.loadSheetTableToObj(cl_maestroPtosDespacho.sheetName(),
            (data) => { PkuyApp.maestroPtosDespacho = new cl_maestroPtosDespacho(data); console.log('[Ok] .maestroPtosDespacho'); });
          PkuyApp.loadSheetTableToObj(cl_maestroMediosPago.sheetName(),
            (data) => { PkuyApp.tipos.mediosPago = new cl_maestroMediosPago(data); console.log('[Ok] .maestroMediosPago'); });
          // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });
          // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });

        });
  };

  PkuyApp.loadUserData = function (callback) {
    gapi.client.people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    }).then(function (response) {
      callback(response.result);
    }, function (error) {
      console.log('[Error] loadUserData.get' + JSON.stringify(error, null, 2));
    });
  };


  PkuyApp.maestroClientesLoaded = function () {
    // Descarga Recursiva de Contactos de Google
    console.log('[Ok] Descargando Contactos');
    PkuyApp.contactos = [];
    PkuyApp.loadContactsToTable('', (data) => {
      PkuyApp.contactos.push(...data.connections);
    }, () => {
      PkuyApp.cruzarClientesContactos(PkuyApp.contactos, PkuyApp.maestroClientes);
      console.log('[Ok] Contactos Cruzados con Clientes');
      PkuyApp.onLoaded();
    });
  }

  PkuyApp.loadContactsToTable = function (nextPage, callback, onLoaded) {
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
          PkuyApp.loadContactsToTable(nextPage, callback, onLoaded);
        } else {
          console.log('[Ok] Contactos Cargados!');
          onLoaded();
        }
      } else {
        console.log('[Warn] loadContactsToTable: No connections found.');
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

  PkuyApp.loadSheetTableToObj = function (tableName, callback, startRecord = 1, endRecord = null) {
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
        } else {
          console.log('[Warn] loadSheetTableToObj.get: No data found.');
        }
        callback(returnTable);
      }, function (error) {
        console.log('[Error] loadSheetTableToObj.get: ' + JSON.stringify(error, null, 2));
      });
    }, function (error) {
      console.log('[Error] loadSheetTableToObj.get.cab: ' + JSON.stringify(error, null, 2));
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
      console.log('update http send');
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
          console.log('[Error] updateObjToSheetTable.update: ' + JSON.stringify(error, null, 2));
        });
    }, function (error) {
      console.log('[Error] updateObjToSheetTable.get: ' + JSON.stringify(error, null, 2));
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
      console.log('append http send');
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
          console.log('[Error] appendObjToSheetTable.put: ' + JSON.stringify(error, null, 2));
        });
    }, function (error) {
      console.log('[Error] appendObjToSheetTable.get: ' + JSON.stringify(error, null, 2));
    });
  };



  PkuyApp.listarContactos = function (start, end) {
    if (start == undefined) start = 0;
    if (end == undefined || end > PkuyApp.contactos.length) end = PkuyApp.contactos.length;
    let intermediateDiv = document.createElement('div');
    for (let i = start; i < end; i++) {
      if (PkuyApp.contactos[i].names !== undefined && PkuyApp.contactos[i].names[0].displayName !== undefined) {
        console.log(i + '/' + PkuyApp.contactos[i].names[0].displayName);
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
  }

  PkuyApp.consola = function () {
    if (console.olog != undefined) return;
    if (typeof console != undefined)
      if (typeof console.log != undefined)
        console.olog = console.log;
      else
        console.olog = function () { };

    console.log = function (message) {
      console.olog(message);
      var consolaDiv = document.getElementById('consolaDiv');
      consolaDiv.insertBefore(document.createElement('br'), consolaDiv.firstChild);
      consolaDiv.insertBefore(document.createTextNode(message), consolaDiv.firstChild);
      // consolaDiv.appendChild(document.createTextNode(message));
      // consolaDiv.appendChild(document.createElement("br"));
    };
    console.error = console.debug = console.info = console.log;
  };

  PkuyApp.testMode = true;

}
