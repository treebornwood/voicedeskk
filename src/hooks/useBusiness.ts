import { useState, useEffect } from 'react';
import { supabase, Business, BusinessContent, Booking } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

export function useBusiness() {
  const { user } = useUser();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBusiness = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBusiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business');
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (businessData: Partial<Business>) => {
    if (!user) throw new Error('User not authenticated');

    const slug = businessData.business_name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || '';

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        clerk_user_id: user.id,
        slug,
        ...businessData,
      })
      .select()
      .single();

    if (error) throw error;
    setBusiness(data);
    return data;
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) throw new Error('No business found');

    const { data, error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', business.id)
      .select()
      .single();

    if (error) throw error;
    setBusiness(data);
    return data;
  };

  return {
    business,
    loading,
    error,
    createBusiness,
    updateBusiness,
    refreshBusiness: fetchBusiness,
  };
}

export function useBusinessContent(businessId: string | undefined) {
  const [content, setContent] = useState<BusinessContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchContent();
    }
  }, [businessId]);

  const fetchContent = async () => {
    if (!businessId) return;

    const { data, error } = await supabase
      .from('business_content')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContent(data);
    }
    setLoading(false);
  };

  const addContent = async (contentData: Partial<BusinessContent>) => {
    if (!businessId) throw new Error('No business ID');

    const { data, error } = await supabase
      .from('business_content')
      .insert({
        business_id: businessId,
        ...contentData,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchContent();
    return data;
  };

  const deleteContent = async (contentId: string) => {
    const { error } = await supabase
      .from('business_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
    await fetchContent();
  };

  return {
    content,
    loading,
    addContent,
    deleteContent,
    refreshContent: fetchContent,
  };
}

export function useBookings(businessId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBookings();
    }
  }, [businessId]);

  const fetchBookings = async () => {
    if (!businessId) return;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('business_id', businessId)
      .order('appointment_datetime', { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  return {
    bookings,
    loading,
    refreshBookings: fetchBookings,
  };
}

export function usePublicBusiness(slug: string | undefined) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  const fetchBusiness = async () => {
    if (!slug) return;

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .eq('is_live', true)
      .maybeSingle();

    if (!error) {
      setBusiness(data);
    }
    setLoading(false);
  };

  return { business, loading };
}
