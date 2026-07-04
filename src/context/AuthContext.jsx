import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
    signOut as supabaseSignOut,
    setupRecaptcha,
} from '../supabase/auth'

// Demo users (preserved as fallback)
const adminUser = {
    id: 'admin-001',
    email: 'admin@aquapure.net',
    role: 'admin',
    user_metadata: {
        full_name: 'Inspector Arjun Mehta',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
        name: 'Inspector Arjun',
    },
}
const citizenUser = {
    id: 'citizen-001',
    email: 'citizen@local.net',
    role: 'citizen',
    user_metadata: {
        full_name: 'Local Resident',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Citizen',
        name: 'Local Resident',
    },
}

// ── Admin email whitelist ───────────────────────────────────────
const ADMIN_EMAIL = 'kamaleshbabusiva@gmail.com'
function getRole(email) {
    if (!email) return 'citizen'
    return email.toLowerCase().trim() === ADMIN_EMAIL ? 'admin' : 'citizen'
}

// Helper to sync Supabase user to profiles table (RPC) – same as before
async function syncUserToSupabase(supabaseUser, provider = 'email') {
    if (!isSupabaseConfigured || !supabaseUser) return null
    const userInfo = {
        firebaseUid: supabaseUser.id,
        email: supabaseUser.email,
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        phone: supabaseUser.phone,
        authProvider: provider,
    }
    try {
        const { data: profile, error: directErr } = await supabase
            .from('profiles')
            .upsert({
                firebase_uid: userInfo.firebaseUid,
                email: userInfo.email,
                full_name: userInfo.fullName,
                display_name: userInfo.fullName,
                avatar_url: userInfo.avatarUrl,
                phone: userInfo.phone,
                auth_provider: userInfo.authProvider,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'firebase_uid' })
            .select()
            .single()
        if (directErr) {
            console.warn('Supabase sync error:', directErr.message)
            return null
        }
        return profile
    } catch (err) {
        console.warn('Supabase sync failed:', err.message)
        return null
    }
}

// Fetch profile from Supabase
async function fetchSupabaseProfile(supabaseUid) {
    if (!isSupabaseConfigured) return null
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('firebase_uid', supabaseUid)
            .single()
        if (error) return null
        return data
    } catch { return null }
}

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [isOnboarded, setIsOnboarded] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [authProvider, setAuthProvider] = useState(null)
    const [authError, setAuthError] = useState(null)

    // Supabase auth listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
            if (sess?.user) {
                const sbUser = sess.user
                const role = getRole(sbUser.email || sbUser.phone || '')
                const appUser = {
                    id: sbUser.id,
                    email: sbUser.email || sbUser.phone || '',
                    role,
                    user_metadata: {
                        full_name: sbUser.user_metadata?.full_name || sbUser.email || 'User',
                        avatar_url: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`,
                        name: sbUser.user_metadata?.full_name || 'User',
                    },
                }
                setUser(appUser)
                setSession({ user: appUser })
                setUserRole(role)
                setAuthProvider('email')
                // Sync profile
                const supabaseProfile = await syncUserToSupabase(sbUser, 'email')
                if (supabaseProfile) {
                    setProfile({
                        name: supabaseProfile.full_name || appUser.user_metadata.full_name,
                        profession: role === 'admin' ? 'Senior Water Inspector' : (supabaseProfile.specialty || 'Citizen Monitor'),
                        streak: supabaseProfile.streak_count || 0,
                        bonusPoints: supabaseProfile.bonus_points || 0,
                        avatar: supabaseProfile.avatar_url || appUser.user_metadata.avatar_url,
                        email: supabaseProfile.email || appUser.email,
                        supabaseId: supabaseProfile.id,
                    })
                    setIsOnboarded(role === 'citizen' ? true : (supabaseProfile.is_onboarded || false))
                } else {
                    setProfile({
                        name: appUser.user_metadata.full_name,
                        profession: role === 'admin' ? 'Senior Water Inspector' : 'Citizen Monitor',
                        streak: 0,
                        bonusPoints: 0,
                        avatar: appUser.user_metadata.avatar_url,
                        email: appUser.email,
                    })
                    setIsOnboarded(role === 'citizen')
                }
            } else {
                // Signed out
                setUser(null)
                setSession(null)
                setProfile(null)
                setUserRole(null)
                setIsOnboarded(false)
                setAuthProvider(null)
            }
            setLoading(false)
        })
        return () => subscription?.unsubscribe()
    }, [])

    // ── Auth methods ────────────────────────────────────────────
    const loginWithGoogle = async () => {
        try {
            setAuthError(null)
            setLoading(true)
            await signInWithGoogle()
        } catch (err) {
            setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }
    const loginWithEmail = async (email, password) => {
        // Allow only the designated admin or user
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail !== 'shrikeshav37@gmail.com' && normalizedEmail !== 'kamaleshbabusiva@gmail.com') {
            const errMsg = 'Login restricted: unauthorized email address.';
            setAuthError(errMsg);
            throw new Error(errMsg);
        }
        try {
            setAuthError(null);
            setLoading(true);
            await signInWithEmail(email, password);
        } catch (err) {
            setAuthError(err.message);
            throw err
        } finally {
            setLoading(false)
        }
    }
    const registerEmail = async (email, password, displayName) => {
        try {
            setAuthError(null)
            setLoading(true)
            await registerWithEmail(email, password, displayName)
        } catch (err) {
            setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }
    const loginWithPhone = async (phoneNumber, recaptchaElementId) => {
        try {
            setAuthError(null)
            setLoading(true)
            // Supabase does not require recaptcha; just send OTP
            await sendPhoneOTP(phoneNumber)
            // Return the phoneNumber as a simple confirmation token for the UI
            return phoneNumber
        } catch (err) {
            setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }
    const confirmOTP = async (phoneNumber, otp) => {
        try {
            setAuthError(null)
            setLoading(true)
            await verifyPhoneOTP(phoneNumber, otp)
        } catch (err) {
            setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }
    const logout = async () => {
        try {
            await supabaseSignOut()
        } catch (err) {
            console.error('Logout error:', err)
        }
        setUser(null)
        setSession(null)
        setProfile(null)
        setUserRole(null)
        setIsOnboarded(false)
        setAuthProvider(null)
    }
    // Demo logins (preserved)
    const adminDemoLogin = () => {
        setUserRole('admin')
        setUser(adminUser)
        setSession({ user: adminUser })
        setIsOnboarded(true)
        setAuthProvider('demo')
        setProfile({
            name: 'Inspector Arjun Mehta',
            profession: 'Senior Water Inspector',
            streak: 15,
            bonusPoints: 1250,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
            email: adminUser.email,
        })
        setLoading(false)
    }
    const citizenDemoLogin = () => {
        setUserRole('citizen')
        setUser(citizenUser)
        setSession({ user: citizenUser })
        setIsOnboarded(true)
        setAuthProvider('demo')
        setProfile({
            name: 'Local Resident',
            profession: 'Neighborhood Resident',
            streak: 4,
            bonusPoints: 320,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Citizen',
            email: citizenUser.email,
        })
        setLoading(false)
    }
    const demoLogout = () => logout()

    const completeOnboarding = async (profileData) => {
        setProfile(profileData)
        setIsOnboarded(true)
        if (isSupabaseConfigured && user) {
            try {
                await supabase
                    .from('profiles')
                    .update({
                        is_onboarded: true,
                        full_name: profileData.name,
                        display_name: profileData.name,
                        specialty: profileData.profession || profileData.stepGoal?.professionLabel,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('firebase_uid', user.id)
            } catch (err) {
                console.warn('Failed to sync onboarding:', err)
            }
        }
    }

    const value = {
        user,
        session,
        loading,
        profile,
        isOnboarded,
        userRole,
        authProvider,
        authError,
        loginWithGoogle,
        loginWithEmail,
        registerEmail,
        loginWithPhone,
        confirmOTP,
        logout,
        adminDemoLogin,
        citizenDemoLogin,
        demoLogout,
        completeOnboarding,
        setProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
