/**
 * CÓDIGO PARA GOOGLE APPS SCRIPT (v2 - Hojas Individuales)
 * 
 * Instrucciones:
 * 1. Abre tu Google Sheet.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Borra todo y pega este código.
 * 4. Dale a 'Implementar' > 'Nueva implementación'.
 * 5. Tipo: 'Aplicación web', Acceso: 'Cualquier persona'.
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const tipo = data.tipo;
        const empleado = data.empleado;

        if (!empleado) return resError("Falta el email del empleado");

        // Buscamos o creamos la hoja del empleado
        let sheet = SS.getSheetByName(empleado);

        // Si es un registro nuevo o la hoja no existe, la creamos
        if (!sheet) {
            sheet = SS.insertSheet(empleado);
            // Añadimos cabeceras
            sheet.appendRow(["TIPO", "FECHA", "HORA", "DESCRIPCIÓN/DETALLES", "OTRO/ESTADO", "LAT", "LNG", "FIRMA/EXTRA"]);
            sheet.getRange(1, 1, 1, 8).setBackground("#87CEEB").setFontWeight("bold");
        }

        if (tipo === 'registro') {
            return resSuccess("Usuario registrado/hoja confirmada");
        }

        // Lógica para guardar datos según el tipo
        const now = new Date();
        const rows = [];

        if (tipo === 'entrada') {
            rows.push(['Entrada', data.fecha, data.hora_entrada, 'Fichaje de entrada', '', data.lat, data.lng, '']);
        }
        else if (tipo === 'salida') {
            rows.push(['Salida', '', data.hora_salida, 'Fichaje de salida', `Total: ${data.total_horas}`, data.lat, data.lng, '']);
        }
        else if (tipo === 'vacaciones') {
            rows.push(['Vacaciones', '', '', `Desde ${data.start_date} hasta ${data.end_date}`, data.status, '', '', data.comments]);
        }
        else if (tipo === 'incidencia') {
            rows.push(['Incidencia', '', '', data.incident_type, data.description, '', '', '']);
        }
        else if (tipo === 'conforme') {
            rows.push(['Conforme', data.date, '', `Cliente: ${data.client_name} - ${data.description}`, 'Guardado', '', '', data.signature]);
        }

        if (rows.length > 0) {
            rows.forEach(row => sheet.appendRow(row));
        }

        return resSuccess("Datos guardados en hoja individual");

    } catch (error) {
        return resError(error.toString());
    }
}

function doGet(e) {
    try {
        const empleado = e.parameter.empleado;
        if (!empleado) return resError("Falta parámetro empleado");

        // Si es ADMIN_ALL, devolvemos lo que tengamos (aquí podrías consolidar hojas)
        if (empleado === 'ADMIN_ALL') {
            return ContentService.createTextOutput(JSON.stringify([{ tipo: 'info', empleado: 'Admin', description: 'Vista global no implementada aún en modo individual' }])).setMimeType(ContentService.MimeType.JSON);
        }

        const sheet = SS.getSheetByName(empleado);
        if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);

        const data = sheet.getDataRange().getValues();
        const headers = data.shift();

        // Convertimos las filas en objetos para el frontend
        const result = data.map(row => {
            const type = (row[0] || '').toString().toLowerCase();
            // Mapeo básico para que el frontend lo entienda
            return {
                tipo: type === 'entrada' || type === 'salida' ? 'fichaje' : type,
                action: row[0],
                empleado: empleado,
                fecha: row[1] || '',
                hora_entrada: type === 'entrada' ? row[2] : '',
                hora_salida: type === 'salida' ? row[2] : '',
                total_horas: type === 'salida' ? (row[4] || '').toString().replace('Total: ', '') : '',
                description: row[3],
                status: row[4],
                timestamp: row[1] ? new Date(row[1]).toISOString() : new Date().toISOString(),
                signature: row[7],
                // Mapeos adicionales
                start_date: type === 'vacaciones' ? (row[3] || '').toString().split(' ')[1] : '',
                end_date: type === 'vacaciones' ? (row[3] || '').toString().split(' ')[3] : '',
                incident_type: type === 'incidencia' ? row[3] : '',
                client_name: type === 'conforme' ? (row[3] || '').toString().split(' - ')[0].replace('Cliente: ', '') : ''
            };
        });

        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return resError(error.toString());
    }
}

function resSuccess(msg) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: msg })).setMimeType(ContentService.MimeType.JSON);
}

function resError(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error })).setMimeType(ContentService.MimeType.JSON);
}
