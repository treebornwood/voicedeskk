import { useState, useEffect, useCallback } from 'react';
import { supabase, Business, BusinessContent, Booking } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

const SELECTED_BUSINESS_KEY = 'voicedesk_selected_business';

export function useBusiness() {
  const { user } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_BUSINESS_KEY);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const business = businesses.find(b => b.id === selectedBusinessId) || businesses[0] || null;

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedBusinessId) {
      localStorage.setItem(SELECTED_BUSINESS_KEY, selectedBusinessId);
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    if (businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  const fetchBusinesses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessId(businessId);
  }, []);

  const createBusiness = async (businessData: Partial<Business>) => {
    if (!user) throw new Error('User not authenticated');

    const baseSlug = businessData.business_name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || '';

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${Date.now().toString(36)}-${randomSuffix}`;

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
    setBusinesses(prev => [...prev, data]);
    setSelectedBusinessId(data.id);
    return data;
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) throw new Error('No business selected');

    const { data, error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', business.id)
      .select()
      .single();

    if (error) throw error;
    setBusinesses(prev => prev.map(b => b.id === data.id ? data : b));
    return data;
  };

  const deleteBusiness = async (businessId: string) => {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
    setBusinesses(prev => prev.filter(b => b.id !== businessId));
    if (selectedBusinessId === businessId) {
      const remaining = businesses.filter(b => b.id !== businessId);
      setSelectedBusinessId(remaining[0]?.id || null);
    }
  };

  return {
    business,
    businesses,
    loading,
    error,
    selectBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    refreshBusinesses: fetchBusinesses,
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
