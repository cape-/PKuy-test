------------------------------------
Upgrades y mejoras para PkuyApp v1.1
------------------------------------
# Modularizar un backend como una API independiente (p.ej.: pkuyApp.com/do).
    Se puede reformular el pkuyAppCore para que funciones como API dedicada a E/S de datos a la pkuyCloud
    Se puede plantear como un modulos node.js
# Posibilidad de seleccionar proveedor de Cotización
    Mecanismo de fallback para obtener cotización de otro prveedor en caso de no poder del principal
# Optimizaciones
    PkuyApp.getCabOfTable() debería implementar cache para todas las cabeceras de tabla (dato no variable) [LISTO]


    # get AutoID del prod modelo
    # INPUT para prodID
    # INPUT para mlUrl
    # UPLOAD imagenes [EN CURSO]
    # tipo de precio modelo = costo ¿¿¿???
    # cargar precios [LISTO]
    # widgets de botones accesos rápidos a funciones corrientes (en pantalla principal)
    # OCULTAR WIDGETS mientras PkuyLoading, luego hacerlos aparecer con un fade-in uno por uno con un defasaje de 100ms

    BUGS
    # Revisar actualización de cotizaciones nuevas (cotización hoy 30/3 y en la db ultima registrada del 28/3)
