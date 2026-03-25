// Simplified LocalStorage wrapper for offline first app

export const getStorageData = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
};

export const saveStorageData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const addItem = (table, item) => {
    const data = getStorageData(table);
    const newItem = { 
        ...item, 
        id: crypto.randomUUID(), 
        created_at: new Date().toISOString() 
    };
    saveStorageData(table, [newItem, ...data]);
    return newItem;
};

export const updateItem = (table, id, updates) => {
    const data = getStorageData(table);
    const index = data.findIndex(i => i.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        saveStorageData(table, data);
        return data[index];
    }
    return null;
};

export const getItems = (table, filters = {}) => {
    let data = getStorageData(table);
    
    // Apply filters
    Object.keys(filters).forEach(key => {
        data = data.filter(item => item[key] === filters[key]);
    });
    
    return data;
};

// --- AUTH FAKE ---
export const auth = {
    signUp: async ({ email, password }) => {
        const users = getStorageData('users');
        if (users.find(u => u.email === email)) {
            throw new Error('El usuario ya existe. Inicie sesión.');
        }
        const newUser = { email, password, role: email === 'limpiezabalear@gmail.com' ? 'admin' : 'empleado' };
        saveStorageData('users', [...users, newUser]);
        
        // Auto sign-in
        localStorage.setItem('currentUser', JSON.stringify({ email: newUser.email }));
        return { session: { user: { email: newUser.email } } };
    },
    
    signInWithPassword: async ({ email, password }) => {
        const users = getStorageData('users');
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }
        if (user.password !== password) {
            throw new Error('Contraseña incorrecta.');
        }
        
        localStorage.setItem('currentUser', JSON.stringify({ email: user.email }));
        return { session: { user: { email: user.email } } };
    },
    
    signOut: async () => {
        localStorage.removeItem('currentUser');
    },

    getSession: async () => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            return { data: { session: { user: JSON.parse(user) } } };
        }
        return { data: { session: null } };
    }
};
