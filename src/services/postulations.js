import {supabase} from '../supabase/connection'
export const getPostulaciones = async () => {
  const { data, error } = await supabase
    .from("postulaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener las postulaciones:", error.message);
    return [];
  }

  return data;
};
