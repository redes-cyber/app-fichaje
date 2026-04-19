import { supabase } from './supabase';

export const getItems = async (table, filters = {}) => {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
            query = query.eq(key, filters[key]);
        }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const addItem = async (table, item) => {
    // We do not overwrite ID with our own crypto.randomUUID anymore
    // Supabase will handle id normally or we can just send it as is, Assuming DB has auto-increment/UUID
    const { data, error } = await supabase.from(table).insert([item]).select();
    if (error) throw error;
    return data ? data[0] : null;
};

export const updateItem = async (table, id, updates) => {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
    if (error) throw error;
    return data ? data[0] : null;
};

export const auth = {
    signUp: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // The mock before used role 'admin' for limpiezabalear@gmail.com, Supabase handles auth itself
        return data;
    },
    
    signInWithPassword: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data; // { session, user }
    },
    
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { data: { session: data.session } };
    }
};
