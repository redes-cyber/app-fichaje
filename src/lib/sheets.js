// URL del Google Apps Script - receptor de fichajes
export const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwFXluiWzQa6UssfyMyLhLmhglAs2nekW9SPM_Av18SuYh8Bi-Dcc8PHwENpOttCZAXtg/exec';

/**
 * Registra una entrada en Google Sheets
 */
export async function registrarEntrada({ empleado, fecha, hora_entrada }) {
    await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requiere no-cors para POST
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ tipo: 'entrada', empleado, fecha, hora_entrada }),
    });
}

/**
 * Registra una salida en Google Sheets
 */
export async function registrarSalida({ empleado, hora_salida, total_horas }) {
    await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ tipo: 'salida', empleado, hora_salida, total_horas }),
    });
}

/**
 * Obtiene los últimos registros de Google Sheets (solo lectura)
 */
export async function obtenerRegistros() {
    try {
        const res = await fetch(SHEETS_URL, { method: 'GET' });
        if (!res.ok) throw new Error('Error de red');
        const data = await res.json();
        // Invertir para mostrar los más recientes primero
        return data.reverse();
    } catch (err) {
        console.warn('No se pudo cargar el historial desde Google Sheets:', err.message);
        return [];
    }
}
