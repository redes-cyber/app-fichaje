// URL del Google Apps Script - receptor de datos para Limpieza Balear
export const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx3eVYChPjXJuTN4uCHgQwSd2NBght9OztSjGKAlTMaKV3NbM8hjwoFLKAFepsEBGehkQ/exec';

/**
 * Crea una hoja individual para el usuario si no existe
 */
export async function registrarUsuario(nombre) {
    try {
        await fetch(SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ tipo: 'registro', empleado: nombre }),
        });
        return true;
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        return false;
    }
}

/**
 * Registra una entrada en Google Sheets
 */
export async function registrarEntrada({ empleado, fecha, hora_entrada, lat, lng }) {
    await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            tipo: 'entrada',
            empleado,
            fecha,
            hora_entrada,
            lat,
            lng
        }),
    });
}

/**
 * Registra una salida en Google Sheets
 */
export async function registrarSalida({ empleado, hora_salida, total_horas, lat, lng }) {
    await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            tipo: 'salida',
            empleado,
            hora_salida,
            total_horas,
            lat,
            lng
        }),
    });
}

/**
 * Envía otros datos (Vacaciones, Incidencias, Conformes) a la hoja
 */
export async function enviarAシート(datos) {
    await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(datos),
    });
}

/**
 * Obtiene los registros del historial
 */
export async function obtenerRegistros(empleado) {
    try {
        const res = await fetch(`${SHEETS_URL}?empleado=${encodeURIComponent(empleado)}`, { method: 'GET' });
        if (!res.ok) throw new Error('Error de red');
        const data = await res.json();
        return Array.isArray(data) ? data.reverse() : [];
    } catch (err) {
        console.warn('No se pudo cargar el historial:', err.message);
        return [];
    }
}
