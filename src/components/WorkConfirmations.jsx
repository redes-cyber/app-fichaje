import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { FileSignature, Send, Loader2, Printer, Eraser } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export function WorkConfirmations({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [conformes, setConformes] = useState([]);
    const [clientName, setClientName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const sigCanvas = useRef({});

    useEffect(() => {
        fetchConformes();
    }, [session]);

    const fetchConformes = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('conformes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConformes(data || []);
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

        if (sigCanvas.current.isEmpty()) {
            setError('Por favor, solicite al cliente que firme el conforme.');
            setLoading(false);
            return;
        }

        try {
            // Cambiamos getTrimmedCanvas() por toDataURL() directamente 
            // ya que getTrimmedCanvas() requiere mucho procesamiento y puede colgar la página
            const signatureURL = sigCanvas.current.toDataURL('image/png');

            const { error } = await supabase.from('conformes').insert([
                {
                    user_id: session.user.id,
                    client_name: clientName,
                    date: date,
                    description: description,
                    signature: signatureURL
                }
            ]);

            if (error) throw error;

            setMsg('Conforme de trabajo guardado correctamente.');
            setClientName('');
            setDescription('');
            clearSignature();
            fetchConformes();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 4000);
        }
    };

    const handePrint = (conforme) => {
        // Open a new window for printing the ticket
        const printWindow = window.open('', '_blank');

        // Construct the ticket HTML
        printWindow.document.write(`
      <html>
        <head>
          <title>Conforme de Trabajo - ${conforme.client_name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .ticket { border: 1px solid #ddd; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #87CEEB; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { max-width: 200px; margin-bottom: 10px; }
            .company { font-size: 24px; font-weight: bold; color: #87CEEB; margin: 0; }
            .title { font-size: 18px; color: #666; margin-top: 5px; }
            .details { margin-bottom: 30px; line-height: 1.6; }
            .label { font-weight: bold; color: #555; }
            .signature-box { border-top: 1px dashed #ccc; padding-top: 20px; text-align: center; }
            .signature-img { max-height: 100px; margin-top: 10px; border: 1px solid #eee; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
            @media print {
               body { padding: 0; }
               .ticket { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <!-- Using absolute path or basic text if the logo doesn't load from a new window -->
              <h1 class="company">LIMPIEZA BALEAR</h1>
              <p class="title">CONFORME DE TRABAJO</p>
            </div>
            <div class="details">
              <p><span class="label">Fecha del servicio:</span> ${new Date(conforme.date).toLocaleDateString('es-ES')}</p>
              <p><span class="label">Cliente:</span> ${conforme.client_name}</p>
              <p><span class="label">Empleado/a asignado/a:</span> ${session.user.user_metadata?.full_name || session.user.email}</p>
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
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Opcional: window.close() after printing
              }, 500);
            };
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
                        <label>Firma del Cliente</label>
                        <div className="signature-container border border-sky-200 rounded-md bg-white overflow-hidden relative" style={{ touchAction: 'none' }}>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: 'w-full h-40 signature-canvas' }}
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
                    <div className="empty-state">No ha creado ningún conforme de trabajo aún.</div>
                ) : (
                    <div className="list-container">
                        {conformes.map(conf => (
                            <div key={conf.id} className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-title-with-icon">
                                        <span className="font-semibold text-sky-700">{conf.client_name}</span>
                                    </div>
                                    <button
                                        onClick={() => handePrint(conf)}
                                        className="flex items-center gap-1 text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100 hover:bg-sky-100 transition-colors"
                                    >
                                        <Printer size={16} />
                                        Imprimir
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Fecha: {new Date(conf.date).toLocaleDateString('es-ES')}</div>
                                <p className="list-item-desc text-sm line-clamp-2">{conf.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
