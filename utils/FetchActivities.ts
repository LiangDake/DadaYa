import { supabase } from '~/utils/supabase';

export const fetchNearbyActivities = async (lat: number, long: number) => {
  try {
    const { data, error } = await supabase.rpc('nearby_activities', {
      lat,
      long,
    });

    if (error) {
      throw new Error('Failed to fetch activities');
    }

    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw new Error('Unexpected error occurred.');
  }
};
