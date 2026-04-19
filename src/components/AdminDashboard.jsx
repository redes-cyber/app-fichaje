import React, { useState, useEffect } from 'react';
import { getItems, updateItem } from '../lib/storage';
import { Users, Clock, Calendar as CalendarIcon, AlertTriangle, FileSignature, Printer, Download, CheckCircle, XCircle } from 'lucide-react';

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
            let table = '';
            if (activeSegment === 'fichajes') table = 'fichajes';
            else if (activeSegment === 'vacaciones') table = 'vacaciones';
            else if (activeSegment === 'incidencias') table = 'incidencias';
            else if (activeSegment === 'conformes') table = 'conformes';

            const localData = await getItems(table);
            localData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setData(localData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateVacation = async (id, newStatus) => {
        await updateItem('vacaciones', id, { status: newStatus });
        fetchData(); // Recargar datos para ver el cambio instantáneo
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES');
        } catch (e) {
            return dateStr;
        }
    };

    const handleDownloadCSV = () => {
        if (!data || data.length === 0) return;

        let csvContent = "";
        
        // Determinar cabeceras según el tipo
        if (activeSegment === 'fichajes') {
            csvContent += "Empleado,Fecha,Hora Entrada,Hora Salida,Total Horas\n";
            data.forEach(row => {
                csvContent += `${row.empleado || ''},${row.fecha || ''},${row.hora_entrada || ''},${row.hora_salida || ''},${row.total_horas || ''}\n`;
            });
        } else if (activeSegment === 'conformes') {
            csvContent += "Usuario/Email,Nombre Empleado,Cliente,Fecha,Descripción,Observación,Fecha Creación\n";
            data.forEach(row => {
                const desc = (row.description || '').replace(/(\r\n|\n|\r)/gm, " "); // quitar saltos de línea para csv
                const obs = (row.observation || '').replace(/(\r\n|\n|\r)/gm, " ");
                csvContent += `${row.empleado || ''},${row.employee_name || ''},${row.client_name || ''},${row.date || ''},${desc},${obs},${row.created_at || ''}\n`;
            });
        } else if (activeSegment === 'vacaciones') {
            csvContent += "Empleado,Inicio,Fin,Comentarios,Estado\n";
            data.forEach(row => {
                const comm = (row.comments || '').replace(/(\r\n|\n|\r)/gm, " ");
                csvContent += `${row.empleado || ''},${row.start_date || ''},${row.end_date || ''},${comm},${row.status || ''}\n`;
            });
        } else if (activeSegment === 'incidencias') {
            csvContent += "Empleado,Tipo,Descripción,Fecha\n";
            data.forEach(row => {
                const desc = (row.description || '').replace(/(\r\n|\n|\r)/gm, " ");
                csvContent += `${row.empleado || ''},${row.incident_type || ''},${desc},${row.timestamp || row.created_at || ''}\n`;
            });
        }

        // Crear Blob y descargar
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_${activeSegment}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                  <img src="${window.location.origin}/logo.png" alt="Logo" style="max-height: 80px; margin-bottom: 10px;" onerror="this.style.display='none'"/>
                  <h1 class="company">LIMPIEZA BALEAR</h1>
                  <p class="title">CONFORME DE TRABAJO</p>
                </div>
                <div class="details">
                  <p><span class="label">Fecha del servicio:</span> ${formatDate(conforme.date)}</p>
                  <p><span class="label">Cliente:</span> ${conforme.client_name}</p>
                  <p><span class="label">Empleado/a asignado/a:</span> ${conforme.employee_name || conforme.empleado}</p>
                  <br/>
                  <p><span class="label">Descripción del trabajo realizado:</span></p>
                  <p style="background: #f9f9f9; padding: 10px; border-radius: 4px; min-height: 80px;">
                    ${(conforme.description || '').replace(/\n/g, '<br/>')}
                  </p>
                  ${conforme.observation ? `
                  <br/>
                  <p><span class="label">Observaciones:</span></p>
                  <p style="background: #fdfdfd; padding: 10px; border-radius: 4px; border-left: 3px solid #ccc;">
                    ${conforme.observation.replace(/\n/g, '<br/>')}
                  </p>
                  ` : ''}
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="section-title mb-0">
                        <Users className="section-icon" /> Dashboard Administrador
                    </h2>
                    <button 
                        onClick={handleDownloadCSV} 
                        className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors"
                        disabled={loading || data.length === 0}
                    >
                        <Download size={16} />
                        Descargar CSV
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando datos...</div>
                ) : (
                    <div className="list-container">
                        {data.length === 0 ? (
                            <div className="empty-state">No hay registros de {activeSegment} en el sistema.</div>
                        ) : null}

                        {activeSegment === 'fichajes' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="font-semibold">{item.empleado}</div>
                                <div className="text-sm text-gray-600 flex justify-between">
                                    <span>{item.is_open ? 'En curso' : 'Completado'}</span>
                                    <span>{item.fecha} {item.hora_entrada} {item.hora_salida ? `- ${item.hora_salida}` : ''}</span>
                                </div>
                                {!item.is_open && item.total_horas && (
                                    <div className="text-xs text-sky-600 font-semibold mt-1">
                                        Total: {item.total_horas}h
                                    </div>
                                )}
                            </div>
                        ))}

                        {activeSegment === 'vacaciones' && data.map((item, idx) => (
                            <div key={idx} className="list-item">
                                <div className="flex justify-between">
                                    <div className="font-semibold">{item.empleado}</div>
                                    <span className={`status-badge status-${(item.status || 'Pendiente').toLowerCase()}`}>{item.status || 'Pendiente'}</span>
                                </div>
                                <div className="text-sm mt-1">{formatDate(item.start_date)} - {formatDate(item.end_date)}</div>
                                {item.comments && <div className="text-sm italic mt-1 text-gray-500">"{item.comments}"</div>}
                                
                                {item.status === 'Pendiente' && (
                                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleUpdateVacation(item.id, 'Aprobado')}
                                            className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={14} /> Aprobar
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateVacation(item.id, 'Rechazado')}
                                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={14} /> Rechazar
                                        </button>
                                    </div>
                                )}
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
                                    Fecha: {formatDate(item.date)} | Empleado: {item.employee_name || item.empleado}
                                </div>
                                <div className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</div>
                                {item.observation && <div className="text-xs text-gray-500 italic mt-1 pb-1">Obs: {item.observation}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
