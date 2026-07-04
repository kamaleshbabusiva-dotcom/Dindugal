import { supabase, isSupabaseConfigured } from './client'

// Google OAuth sign‑in
export const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
        console.warn('Supabase is not configured. Redirecting to demo mode.')
        throw new Error('SUPABASE_NOT_CONFIGURED')
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    })
    if (error) throw error
    return data
}

// Sign‑out
export const signOut = async () => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// Get current user
export const getCurrentUser = async () => {
    if (!isSupabaseConfigured) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Get session
export const getSession = async () => {
    if (!isSupabaseConfigured) return null
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

// Email / password sign‑in
export const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error('SUPABASE_NOT_CONFIGURED')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

// Email / password sign‑up
export const registerWithEmail = async (email, password, displayName) => {
    if (!isSupabaseConfigured) throw new Error('SUPABASE_NOT_CONFIGURED')
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: displayName } },
    })
    if (error) throw error
    return data
}

// Phone OTP send (Supabase does not need recaptcha)
export const sendPhoneOTP = async (phoneNumber) => {
    if (!isSupabaseConfigured) throw new Error('SUPABASE_NOT_CONFIGURED')
    const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneNumber })
    if (error) throw error
    return data
}

// Verify OTP
export const verifyPhoneOTP = async (phoneNumber, otp) => {
    if (!isSupabaseConfigured) throw new Error('SUPABASE_NOT_CONFIGURED')
    const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
    })
    if (error) throw error
    return data
}

// Dummy recaptcha for compatibility with existing UI
export const setupRecaptcha = (elementId) => {
    // Supabase does not require recaptcha; return undefined placeholder
    return undefined
}
