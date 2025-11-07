import { supabase } from '../supabase/connection';

export const insertUserData = async (userData) => {
  try {
    const { data, error } = await supabase
      .from(userData.rol)
      .insert([
        {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
          rol: userData.rol,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error insertando usuario:', error);
    return { data: null, error };
  }
};

export const getUserById = async (userId,table) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return { data: null, error };
  }
};