    var CLIENT_ID = '299062314670-le1i5q22g34g7pia51rg0979pgjsri03.apps.googleusercontent.com';
    var API_KEY = 'AIzaSyCqoOmM2Y4Ls9m_3fVeKAX3pF06DAma_x0';
    var SPREADSHEET = '1O8y6zq7qmCtiWmg3Sj4VqTXlO7NQHorNWZjO3oSRlDg';
    var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
    var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');

    var cli_01 = new Object();

    function handleClientLoad() {
      gapi.load('client:auth2', initClient);
    }

    function initClient() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(function () {
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      }, function (error) {
        divContentNewP(JSON.stringify(error, null, 2));
      }).then(function () {
        loadSheetTableToObj(cl_maestroClientes.sheetName(), (data) => { PkuyApp.maestroClientes = new cl_maestroClientes(data) });
        loadSheetTableToObj(cl_maestroDirecciones.sheetName(), (data) => { PkuyApp.direcciones = new cl_maestroDirecciones(data) });
        loadSheetTableToObj(cl_maestroProductos.sheetName(), (data) => { PkuyApp.maestroProductos = new cl_maestroProductos(data) });
        loadSheetTableToObj(cl_maestroPedidos.sheetName(), (data) => { PkuyApp.maestroPedidos = new cl_maestroPedidos(data) });
        loadSheetTableToObj(cl_maestroAlmacenes.sheetName(), (data) => { PkuyApp.maestroAlmacenes = new cl_maestroAlmacenes(data) });
        loadSheetTableToObj(cl_maestroPtosDespacho.sheetName(), (data) => { PkuyApp.maestroPtosDespacho = new cl_maestroPtosDespacho(data) });
        loadSheetTableToObj(cl_maestroAlmacenes.sheetName(), (data) => { PkuyApp.maestroAlmacenes = new cl_maestroAlmacenes(data) });
        loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipos.mediosPago = new cl_maestroMediosPago(data) });
        // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });
        // loadSheetTableToObj(cl_maestroMediosPago.sheetName(), (data) => { PkuyApp.tipo.mediosPago = new cl_maestroMediosPago(data) });
      });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
      } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
      }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
      gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
      gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
 * @param {string} message Text to be placed in pre element.
      */
    function divContentNewP(message) {
      var div = document.getElementById('content');
      var p = document.createElement('p');
      var textContent = document.createTextNode(message);
      p.appendChild(textContent);
      div.appendChild(p);
    }

    /**
     * Print the names and majors of students in a sample spreadsheet:
     * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     */
    /*
      PKuy_1_0-test
      https://docs.google.com/spreadsheets/d/1O8y6zq7qmCtiWmg3Sj4VqTXlO7NQHorNWZjO3oSRlDg/edit
    */
    function loadSheetTableToObj(tableName, callback, startRecord = 1, endRecord = null) {
      var returnTable = new Array();
      var cab;

      if (startRecord < endRecord) return null;

      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET,
        range: tableName + '!A1:ZZ1',
        majorDimension: 'ROWS'
      }).then(function (responseHead) {
        // Puntero a Cabecera
        cab = responseHead.result.values[0];
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET,
          range: tableName + '!A2:ZZ20',
          majorDimension: 'ROWS'
        }).then(function (response) {
          var range = response.result;
          console.log('dataload sheet:'+ tableName);
          console.debug(range);
          // Si tiene datos
          if (range.values.length > 0) {
            // Recorrer registros
            for (i = 0; i < range.values.length; i++) {
              var row = range.values[i];
              var tempObj = new Object;
              for (j = 0; j < row.length; j++) {
                tempObj[cab[j]] = row[j];
              }
              if (Object.values(tempObj)[0] !== '') {
                returnTable.push(tempObj);
              }
            }
          } else {
            divContentNewP('No data found.');
          }
          callback(returnTable);
        }, function (response) {
          divContentNewP('Error: ' + response.result.error.message);
        });
      }, function (response) {
        divContentNewP('Error: ' + response.result.error.message);
      });
      return returnTable;
    }
