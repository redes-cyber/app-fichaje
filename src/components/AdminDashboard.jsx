import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Clock, Calendar as CalendarIcon, AlertTriangle, FileSignature, Printer } from 'lucide-react';

export function AdminDashboard() {
    const [activeSegment, setActiveSegment] = useState('fichajes');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData(activeSegment);
    }, [activeSegment]);

    const fetchData = async (segment) => {
        setLoading(true);
        try {
            if (segment === 'fichajes') {
                const { data: fichas, error } = await supabase
                    .from('fichajes')
                    .select('*, profiles(full_name, email)')
                    .order('timestamp', { ascending: false })
                    .limit(100);
                if (error) throw error;
                setData(fichas || []);
            } else if (segment === 'vacaciones') {
                const { data: vac, error } = await supabase
                    .from('vacaciones')
                    .select('*, profiles(full_name, email)')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setData(vac || []);
            } else if (segment === 'incidencias') {
                const { data: inc, error } = await supabase
                    .from('incidencias')
                    .select('*, profiles(full_name, email)')
                    .order('timestamp', { ascending: false });
                if (error) throw error;
                setData(inc || []);
            } else if (segment === 'conformes') {
                const { data: conf, error } = await supabase
                    .from('conformes')
                    .select('*, profiles(full_name, email)')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setData(conf || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateVacationStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('vacaciones')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
            fetchData('vacaciones');
        } catch (err) {
            alert("Error al actualizar la solicitud");
        }
    };

    const formatDateTime = (iso) => {
        return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-ES');
    };

    const handePrint = (conforme) => {
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
                  <p><span class="label">Fecha del servicio:</span> ${new Date(conforme.date).toLocaleDateString('es-ES')}</p>
                  <p><span class="label">Cliente:</span> ${conforme.client_name}</p>
                  <p><span class="label">Empleado/a asignado/a:</span> ${conforme.profiles?.full_name || conforme.profiles?.email}</p>
                  <br/>
                  <p><span class="label">Descripción del trabajo realizado:</span></p>
                  <p style="background: #f9f9f9; padding: 10px; border-radius: 4px; min-height: 80px;">
                    ${conforme.description.replace(/\n/g, '<br/>')}
                  </p>
                </div>
                <div class="signature-box">
                  <p class="label">Firma del cliente (Conforme)</p>
                  <img src="${conforme.signature}" class="signature-img" alt="Firma del cliente" />
                  <p style="margin-top: 5px; font-size: 14px;">${conforme.client_name}</p>
                </div>
                <div class="footer">
                  <p>Documento digital firmado. Limpieza Balear Mallorca.</p>
                  <p>${new Date(conforme.created_at).toLocaleString('es-ES')}</p>
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
                    <Users className="section-icon" /> Dashboard Administrador
                </h2>

                {loading ? (
                    <div className="loading-state">Cargando...</div>
                ) : (
                    <div className="list-container">
                        {data.length === 0 ? (
                            <div className="empty-state">No hay registros de {activeSegment}.</div>
                        ) : null}

                        {activeSegment === 'fichajes' && data.map(item => (
                            <div key={item.id} className="list-item">
                                <div className="font-semibold">{item.profiles?.full_name || item.profiles?.email}</div>
                                <div className="text-sm text-gray-600 flex justify-between">
                                    <span>{item.action}</span>
                                    <span>{formatDateTime(item.timestamp)}</span>
                                </div>
                            </div>
                        ))}

                        {activeSegment === 'vacaciones' && data.map(item => (
                            <div key={item.id} className="list-item">
                                <div className="flex justify-between">
                                    <div className="font-semibold">{item.profiles?.full_name || item.profiles?.email}</div>
                                    <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                                </div>
                                <div className="text-sm mt-1">{formatDate(item.start_date)} - {formatDate(item.end_date)}</div>
                                {item.comments && <div className="text-sm italic mt-1 text-gray-500">"{item.comments}"</div>}

                                {item.status === 'Pendiente' && (
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="btn btn-primary py-1 px-3 text-sm"
                                            onClick={() => updateVacationStatus(item.id, 'Aprobado')}
                                        >Aprobar</button>
                                        <button
                                            className="btn bg-[#FEE2E2] text-red-600 border border-red-200 py-1 px-3 text-sm"
                                            onClick={() => updateVacationStatus(item.id, 'Rechazado')}
                                        >Rechazar</button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {activeSegment === 'incidencias' && data.map(item => (
                            <div key={item.id} className="list-item">
                                <div className="font-semibold flex justify-between">
                                    <span>{item.profiles?.full_name || item.profiles?.email}</span>
                                    <span className="text-xs font-normal text-gray-500">{formatDateTime(item.timestamp)}</span>
                                </div>
                                <div className="text-sm font-semibold text-red-500 mt-1">{item.type}</div>
                                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            </div>
                        ))}

                        {activeSegment === 'conformes' && data.map(item => (
                            <div key={item.id} className="list-item">
                                <div className="font-semibold flex justify-between items-center">
                                    <span className="text-sky-700">{item.client_name}</span>
                                    <button
                                        onClick={() => handePrint(item)}
                                        className="flex items-center gap-1 text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100 hover:bg-sky-100 transition-colors"
                                    >
                                        <Printer size={16} /> Imprimir
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Fecha: {formatDate(item.date)} | Empleado: {item.profiles?.full_name || item.profiles?.email}
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
