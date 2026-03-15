import React, { useState, useEffect } from 'react';
import { obtenerRegistros } from '../lib/sheets';
import { Users, Clock, Calendar as CalendarIcon, AlertTriangle, FileSignature, Printer } from 'lucide-react';

export function AdminDashboard() {
    const [activeSegment, setActiveSegment] = useState('fichajes');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeSegment]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Para el modo Admin en Google Sheets, solemos pedir el historial completo
            // asumiendo que el script de Apps Script devuelve todo si enviamos un acceso especial
            const allData = await obtenerRegistros('ADMIN_ALL');

            if (activeSegment === 'fichajes') {
                setData(allData.filter(d => ['entrada', 'salida'].includes((d.action || '').toLowerCase())) || []);
            } else if (activeSegment === 'vacaciones') {
                setData(allData.filter(d => (d.action || d.tipo || '').toLowerCase() === 'vacaciones') || []);
            } else if (activeSegment === 'incidencias') {
                setData(allData.filter(d => (d.action || d.tipo || '').toLowerCase() === 'incidencia') || []);
            } else if (activeSegment === 'conformes') {
                setData(allData.filter(d => (d.action || d.tipo || '').toLowerCase() === 'conforme') || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES');
        } catch (e) {
            return dateStr;
        }
    };

    const handlePrint = (conforme) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Conforme de Trabajo - ${conforme.client_name}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .ticket { border: 1px solid #ddd; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #87CEEB; padding-bottom: 20px; margin-bottom: 20px; }
                .company { font-size: 24px; font-weight: bold; color: #87CEEB; margin: 0; }
                .title { font-size: 18px; color: #666; margin-top: 5px; }
                .details { margin-bottom: 30px; line-height: 1.6; }
                .label { font-weight: bold; color: #555; }
                .signature-box { border-top: 1px dashed #ccc; padding-top: 20px; text-align: center; }
                .signature-img { max-height: 100px; margin-top: 10px; border: 1px solid #eee; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
                @media print { body { padding: 0; } .ticket { border: none; } }
              </style>
            </head>
            <body>
              <div class="ticket">
                <div class="header">
                  <h1 class="company">LIMPIEZA BALEAR</h1>
                  <p class="title">CONFORME DE TRABAJO</p>
                </div>
                <div class="details">
                  <p><span class="label">Fecha del servicio:</span> ${formatDate(conforme.date)}</p>
                  <p><span class="label">Cliente:</span> ${conforme.client_name}</p>
                  <p><span class="label">Empleado/a asignado/a:</span> ${conforme.empleado}</p>
                  <br/>
                  <p><span class="label">Descripción del trabajo realizado:</span></p>
                  <p style="background: #f9f9f9; padding: 10px; border-radius: 4px; min-height: 80px;">
                    ${(conforme.description || '').replace(/\n/g, '<br/>')}
                  </p>
                </div>
                <div class="signature-box">
                  <p class="label">Firma del cliente (Conforme)</p>
                  <img src="${conforme.signature}" class="signature-img" alt="Firma del cliente" />
                  <p style="margin-top: 5px; font-size: 14px;">${conforme.client_name}</p>
                </div>
                <div class="footer">
                  <p>Documento digital firmado. Limpieza Balear Mallorca.</p>
                  <p>${conforme.created_at ? new Date(conforme.created_at).toLocaleString() : ''}</p>
                </div>
              </div>
              <script>
                window.onload = function() { setTimeout(function() { window.print(); }, 500); };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="tab-pane">
            <div className="admin-tabs flex mb-4 flex-wrap">
                <button
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeSegment === 'fichajes' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveSegment('fichajes')}
                >
                    <Clock size={16} className="inline mr-1" /> Fichajes
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeSegment === 'conformes' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveSegment('conformes')}
                >
                    <FileSignature size={16} className="inline mr-1" /> Conformes
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeSegment === 'vacaciones' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveSegment('vacaciones')}
                >
                    <CalendarIcon size={16} className="inline mr-1" /> Vacaciones
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeSegment === 'incidencias' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveSegment('incidencias')}
                >
                    <AlertTriangle size={16} className="inline mr-1" /> Incidencias
                </button>
            </div>

            <div className="glass-panel">
                <h2 className="section-title">
                    <Users className="section-icon" /> Dashboard Administrador (Sheets)
                </h2>

                {loading ? (
                    <div className="loading-state">Cargando datos...</div>
                ) : (
                    <div className="list-container">
                        {data.length === 0 ? (
                            <div className="empty-state">No hay registros de {activeSegment} en Google Sheets.</div>
                        ) : null}

                        {activeSegment === 'fichajes' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="font-semibold">{item.empleado}</div>
                                <div className="text-sm text-gray-600 flex justify-between">
                                    <span>{item.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span>
                                    <span>{item.fecha} {item.hora_entrada || item.hora_salida}</span>
                                </div>
                            </div>
                        ))}

                        {activeSegment === 'vacaciones' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="flex justify-between">
                                    <div className="font-semibold">{item.empleado}</div>
                                    <span className={`status-badge status-${(item.status || 'pendiente').toLowerCase()}`}>{item.status}</span>
                                </div>
                                <div className="text-sm mt-1">{formatDate(item.start_date)} - {formatDate(item.end_date)}</div>
                                {item.comments && <div className="text-sm italic mt-1 text-gray-500">"{item.comments}"</div>}
                            </div>
                        ))}

                        {activeSegment === 'incidencias' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="font-semibold flex justify-between">
                                    <span>{item.empleado}</span>
                                    <span className="text-xs font-normal text-gray-400">{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
                                </div>
                                <div className="text-sm font-semibold text-red-500 mt-1">{item.incident_type}</div>
                                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            </div>
                        ))}

                        {activeSegment === 'conformes' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="font-semibold flex justify-between items-center">
                                    <span className="text-sky-700">{item.client_name}</span>
                                    <button
                                        onClick={() => handlePrint(item)}
                                        className="flex items-center gap-1 text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100"
                                    >
                                        <Printer size={16} /> Imprimir
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Fecha: {formatDate(item.date)} | Empleado: {item.empleado}
                                </div>
                                <div className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
