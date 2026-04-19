import React, { useState, useEffect, useRef } from 'react';
import { getItems, addItem } from '../lib/storage';
import { FileSignature, Send, Loader2, Printer, Eraser } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export function WorkConfirmations({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [conformes, setConformes] = useState([]);
    const [clientName, setClientName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [observation, setObservation] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const sigCanvas = useRef(null);
    const empleado = session.user.email;

    useEffect(() => {
        fetchConformes();
    }, [empleado]);

    const fetchConformes = async () => {
        try {
            setFetching(true);
            const data = await getItems('conformes', { empleado });
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setConformes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const clearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setError('Por favor, solicite al cliente que firme el conforme.');
            setLoading(false);
            return;
        }

        try {
            const signatureURL = sigCanvas.current ? sigCanvas.current.getCanvas().toDataURL('image/png') : '';

            await addItem('conformes', {
                empleado,
                employee_name: employeeName || empleado,
                client_name: clientName,
                date: date,
                description: description,
                observation: observation,
                signature: signatureURL
            });

            setMsg('Conforme de trabajo guardado localmente.');
            setClientName('');
            setDescription('');
            setObservation('');
            if (sigCanvas.current) sigCanvas.current.clear();
            
            fetchConformes();
        } catch (err) {
            console.error('Error al guardar conforme:', err);
            setError('Error al guardar el archivo: ' + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 5000);
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
              <img src="${window.location.origin}/logo.png" alt="Logo" style="max-height: 80px; margin-bottom: 10px;" onerror="this.style.display='none'"/>
              <h1 class="company">LIMPIEZA BALEAR</h1>
              <p class="title">CONFORME DE TRABAJO</p>
            </div>
            <div class="details">
              <p><span class="label">Fecha del servicio:</span> ${new Date(conforme.date).toLocaleDateString('es-ES')}</p>
              <p><span class="label">Cliente:</span> ${conforme.client_name}</p>
              <p><span class="label">Empleado/a asignado/a:</span> ${conforme.employee_name || conforme.empleado}</p>
              <br/>
              <p><span class="label">Descripción del trabajo realizado:</span></p>
              <p style="background: #f9f9f9; padding: 10px; border-radius: 4px; min-height: 80px;">
                ${conforme.description.replace(/\n/g, '<br/>')}
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
            <div className="glass-panel">
                <h2 className="section-title">
                    <FileSignature className="section-icon" />
                    Nuevo Conforme
                </h2>

                <form onSubmit={handleSubmit} className="incident-form">
                    {error && <div className="alert-error">{error}</div>}
                    {msg && <div className="alert-success">{msg}</div>}

                    <div className="input-group">
                        <label>Nombre del Cliente</label>
                        <input
                            type="text"
                            placeholder="Ej: Comunidad de Vecinos..."
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Nombre del Empleado</label>
                        <input
                            type="text"
                            placeholder="Ingrese su nombre..."
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Descripción del Trabajo</label>
                        <textarea
                            placeholder="Especifique los trabajos realizados..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field textarea-field"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Observaciones (Opcional)</label>
                        <textarea
                            placeholder="Añada cualquier observación o comentario sobre el trabajo..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            className="input-field textarea-field"
                            rows={2}
                        />
                    </div>

                    <div className="input-group">
                        <label>Firma del Cliente</label>
                        <div className="signature-container bg-white border rounded">
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                backgroundColor="white"
                                canvasProps={{ 
                                    className: 'signature-canvas',
                                    style: { width: '100%', height: '100%', backgroundColor: 'white'}
                                }}
                            />
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="absolute top-2 right-2 p-1 bg-gray-100 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 text-xs flex items-center gap-1 shadow-sm"
                            >
                                <Eraser size={14} />
                                Borrar
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (
                            <>
                                <Send size={18} />
                                Guardar Conforme
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="glass-panel mt-4">
                <h3 className="subsection-title">Historial de Conformes</h3>
                {fetching ? (
                    <div className="loading-state">Cargando...</div>
                ) : conformes.length === 0 ? (
                    <div className="empty-state">No hay registros aún.</div>
                ) : (
                    <div className="list-container">
                        {conformes.map((conf, idx) => (
                            <div key={conf.id || idx} className="list-item">
                                <div className="list-item-header">
                                    <span className="font-semibold text-sky-700">{conf.client_name}</span>
                                    <button
                                        onClick={() => handlePrint(conf)}
                                        className="flex items-center gap-1 text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100"
                                    >
                                        <Printer size={16} />
                                        Imprimir
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">Fecha: {new Date(conf.date).toLocaleDateString()}</div>
                                <p className="text-sm mt-1 line-clamp-2">{conf.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
