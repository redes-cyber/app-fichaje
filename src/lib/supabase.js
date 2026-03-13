import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).');
    if (typeof window !== 'undefined') {
        document.body.innerHTML = `
            <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #333;">
                <h1 style="color: #87CEEB;">⚠️ Error de Configuración</h1>
                <p>La aplicación de <strong>Limpieza Balear</strong> no ha podido conectar con su base de datos.</p>
                <p>Por favor, configure las variables de entorno en el panel de Vercel:</p>
                <code style="background: #f4f4f4; padding: 10px; display: block; margin: 20px auto; max-width: 400px; text-align: left;">
                    VITE_SUPABASE_URL<br>
                    VITE_SUPABASE_ANON_KEY
                </code>
                <p><small>(Esto sucede porque en internet la App necesita sus propias "llaves" de acceso para ser segura).</small></p>
            </div>
        `;
    }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
