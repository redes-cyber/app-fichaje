// ============================================================
// Script receptor de fichajes - Limpieza Balear Mallorca
// Columnas: Empleado | Acción | Fecha | Hora_entrada | hora_salida | Total de horas
// ============================================================

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var data = JSON.parse(e.postData.contents);
        var tipo = data.tipo; // "entrada" o "salida"

        if (tipo === "entrada") {
            // Crear nueva fila con la hora de entrada
            sheet.appendRow([
                data.empleado || "",
                data.accion || "Jornada",
                data.fecha || "",
                data.hora_entrada || "",
                "",   // hora_salida vacía por ahora
                ""    // total_horas vacío por ahora
            ]);

            return ok("Entrada registrada");

        } else if (tipo === "salida") {
            // Buscar la última fila del empleado con salida vacía y actualizar
            var lastRow = sheet.getLastRow();
            var empleado = data.empleado;
            var found = false;

            for (var i = lastRow; i >= 2; i--) {
                var rowEmpleado = sheet.getRange(i, 1).getValue();
                var rowSalida = sheet.getRange(i, 5).getValue();

                if (rowEmpleado === empleado && rowSalida === "") {
                    sheet.getRange(i, 5).setValue(data.hora_salida);
                    sheet.getRange(i, 6).setValue(data.total_horas);
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Si no hay una entrada abierta, crear fila completa
                sheet.appendRow([
                    data.empleado || "",
                    data.accion || "Jornada",
                    data.fecha || "",
                    "",
                    data.hora_salida || "",
                    data.total_horas || ""
                ]);
            }

            return ok("Salida registrada");
        }

        return ok("Acción desconocida");

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ result: "ERROR", error: err.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function ok(msg) {
    return ContentService
        .createTextOutput(JSON.stringify({ result: "OK", message: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Función de prueba
function testEntrada() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow(["Juan Pérez", "Jornada", "27/02/2026", "09:00", "", ""]);
}
