/**
 * CÓDIGO PARA GOOGLE APPS SCRIPT (v3 - Resumen Admin y Emails)
 * 
 * Instrucciones:
 * 1. Abre tu Google Sheet de Limpieza Balear.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Sustituye todo el código por este.
 * 4. IMPORTANTE: Cambia el 'EMAIL_ADMIN' abajo por tu correo real.
 * 5. Implementa de nuevo (Nueva versión).
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const EMAIL_ADMIN = "limpiezabalear@gmail.com"; // <-- CAMBIA ESTO

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const tipo = data.tipo;
        const empleado = data.empleado || data.email;

        if (!empleado) return resError("Falta el email del empleado");

        // 1. Gestión de Hoja Individual
        let sheet = SS.getSheetByName(empleado);
        if (!sheet) {
            sheet = SS.insertSheet(empleado);
            sheet.appendRow(["TIPO", "FECHA", "HORA", "DESCRIPCIÓN/DETALLES", "OTRO/ESTADO", "LAT", "LNG", "FIRMA/EXTRA"]);
            sheet.getRange(1, 1, 1, 8).setBackground("#87CEEB").setFontWeight("bold");
        }

        if (tipo === 'registro') return resSuccess("Usuario registrado");

        // 2. Gestión de Hoja Resumen (ADMIN)
        let summarySheet = SS.getSheetByName("RESUMEN_GENERAL");
        if (!summarySheet) {
            summarySheet = SS.insertSheet("RESUMEN_GENERAL");
            summarySheet.appendRow(["FECHA_REGISTRO", "EMAIL", "TIPO_EVENTO", "DETALLE", "TOTAL_HORAS", "ENLACE_HOJA"]);
            summarySheet.getRange(1, 1, 1, 6).setBackground("#2F4F4F").setFontColor("white").setFontWeight("bold");
        }

        const now = new Date();
        const timestampStr = now.toLocaleString();
        const rows = [];
        let summaryRow = [timestampStr, empleado, tipo.toUpperCase()];

        if (tipo === 'entrada') {
            const row = ['Entrada', data.fecha, data.hora_entrada, 'Fichaje de entrada', '', data.lat, data.lng, ''];
            sheet.appendRow(row);
            summaryRow.push("Inició jornada", "", "Ver hoja: " + empleado);
        }
        else if (tipo === 'salida') {
            const row = ['Salida', '', data.hora_salida, 'Fichaje de salida', `Total: ${data.total_horas}`, data.lat, data.lng, ''];
            sheet.appendRow(row);
            summaryRow.push("Terminó jornada", data.total_horas, "Ver hoja: " + empleado);
        }
        else if (tipo === 'vacaciones') {
            const row = ['Vacaciones', '', '', `Desde ${data.start_date} hasta ${data.end_date}`, data.status, '', '', data.comments];
            sheet.appendRow(row);
            summaryRow.push(`Solicitud Vacaciones: ${data.start_date}`, "", data.comments);
            enviarEmailNotificacion("Nueva Solicitud de Vacaciones", `El empleado ${empleado} ha solicitado vacaciones del ${data.start_date} al ${data.end_date}.\nComentarios: ${data.comments}`);
        }
        else if (tipo === 'incidencia') {
            const row = ['Incidencia', '', '', data.incident_type, data.description, '', '', ''];
            sheet.appendRow(row);
            summaryRow.push(`INCIDENCIA: ${data.incident_type}`, "", data.description);
            enviarEmailNotificacion("ALERTA: Nueva Incidencia Reportada", `El empleado ${empleado} ha reportado una incidencia de tipo: ${data.incident_type}.\nDescripción: ${data.description}`);
        }
        else if (tipo === 'conforme') {
            const row = ['Conforme', data.date, '', `Cliente: ${data.client_name} - ${data.description}`, 'Guardado', '', '', data.signature];
            sheet.appendRow(row);
            summaryRow.push(`Conforme Trabajo: ${data.client_name}`, "", "Firma guardada en hoja");
        }

        summarySheet.appendRow(summaryRow);
        return resSuccess("Datos guardados y resumen actualizado");

    } catch (error) {
        return resError(error.toString());
    }
}

function doGet(e) {
    try {
        const empleado = e.parameter.empleado;
        if (!empleado) return resError("Falta parámetro empleado");

        // Modo Admin: Devuelve el resumen general
        if (empleado === 'ADMIN_ALL') {
            const summarySheet = SS.getSheetByName("RESUMEN_GENERAL");
            if (!summarySheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
            const data = summarySheet.getDataRange().getValues();
            data.shift(); // quitar headers
            return ContentService.createTextOutput(JSON.stringify(data.map(r => ({
                timestamp: r[0],
                empleado: r[1],
                tipo: r[2],
                detalle: r[3],
                total_horas: r[4]
            })))).setMimeType(ContentService.MimeType.JSON);
        }

        const sheet = SS.getSheetByName(empleado);
        if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);

        const data = sheet.getDataRange().getValues();
        data.shift();
        const result = data.map(row => ({
            action: row[0],
            fecha: row[1],
            hora: row[2],
            description: row[3],
            extra: row[4],
            signature: row[7],
            timestamp: row[1] ? new Date(row[1]).toISOString() : new Date().toISOString()
        }));

        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return resError(error.toString());
    }
}

function enviarEmailNotificacion(asunto, mensaje) {
    try {
        MailApp.sendEmail(EMAIL_ADMIN, asunto, mensaje);
    } catch (e) {
        Logger.log("Error enviando email: " + e.toString());
    }
}

function resSuccess(msg) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: msg })).setMimeType(ContentService.MimeType.JSON);
}

function resError(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error })).setMimeType(ContentService.MimeType.JSON);
}
