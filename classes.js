    /* CLASE CLIENTE */
    class cl_cliente {
        nombre;
        apellido;
        edad;
        es_ML;
  
        constructor(dataIn) {
          var attrib;
          for (attrib in dataIn) {
            this[attrib] = dataIn[attrib];
          }
        }
        nombreMostrar() {
          return this.apellido + ' ' + this.nombre;
        }
        getPedidosAbiertos() {
        }
        getPedidosCerrados() {
        }
      }
  
      /* CLASE MAESTRO DE CLIENTES */
      class cl_maestroClientes {
        constructor(data) {
          this.recordSet = new Array();
          var cliente_data;
          for (cliente_data in data) {
            this.recordSet.push(new cl_cliente(data[cliente_data]));
          }
        }
  
        getByApellido(queryApellido) {
          for (var i = 0; i < this.recordSet.length; i++) {
            if (this.recordSet[i] == undefined) continue;
            var cliente = new cl_cliente(this.recordSet[i]);
            if (cliente.apellido == queryApellido)
              return cliente;
          }
          return null;
        }
  
        getByEdad(queryEdad) {
          for (var i = 0; i < this.recordSet.length; i++) {
            if (this.recordSet[i] == undefined) continue;
            var cliente = new cl_cliente(this.recordSet[i]);
            if (cliente.edad == queryEdad)
              return cliente;
          }
          return null;
        }
      }
  