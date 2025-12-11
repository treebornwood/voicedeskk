import { useState, useEffect, useCallback } from 'react';
import { supabase, createAuthenticatedClient, Business, BusinessContent, Booking } from '../lib/supabase';
import { useUser, useAuth } from '@clerk/clerk-react';

export function useBusiness() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get authenticated Supabase client
  const getAuthClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('Failed to get authentication token');
    return createAuthenticatedClient(token);
  }, [getToken]);

  const fetchBusiness = useCallback(async () => {
    if (!user) return;

    try {
      const client = await getAuthClient();
      const { data, error } = await client
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
  }, [user, getAuthClient]);

  useEffect(() => {
    if (user) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [user, fetchBusiness]);

  const createBusiness = async (businessData: Partial<Business>) => {
    if (!user) throw new Error('User not authenticated');

    const slug = businessData.business_name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || '';

    const client = await getAuthClient();
    const { data, error } = await client
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

    const client = await getAuthClient();
    const { data, error } = await client
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
  const { getToken } = useAuth();
  const [content, setContent] = useState<BusinessContent[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('Failed to get authentication token');
    return createAuthenticatedClient(token);
  }, [getToken]);

  const fetchContent = useCallback(async () => {
    if (!businessId) return;

    try {
      const client = await getAuthClient();
      const { data, error } = await client
        .from('business_content')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setContent(data);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId, getAuthClient]);

  useEffect(() => {
    if (businessId) {
      fetchContent();
    }
  }, [businessId, fetchContent]);

  const addContent = async (contentData: Partial<BusinessContent>) => {
    if (!businessId) throw new Error('No business ID');

    const client = await getAuthClient();
    const { data, error } = await client
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
    const client = await getAuthClient();
    const { error } = await client
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
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('Failed to get authentication token');
    return createAuthenticatedClient(token);
  }, [getToken]);

  const fetchBookings = useCallback(async () => {
    if (!businessId) return;

    try {
      const client = await getAuthClient();
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq('business_id', businessId)
        .order('appointment_datetime', { ascending: true });

      if (!error && data) {
        setBookings(data);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId, getAuthClient]);

  useEffect(() => {
    if (businessId) {
      fetchBookings();
    }
  }, [businessId, fetchBookings]);

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
