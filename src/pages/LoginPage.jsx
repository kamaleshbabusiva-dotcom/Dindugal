import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import {
    Droplets, Globe, Users, MessageSquare, Activity, TrendingUp,
    Zap, ChevronRight, Languages, Check, Waves, ShieldAlert,
    Mail, Phone, Eye, EyeOff, ArrowRight, Loader2, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
    const {
        loginWithGoogle, loginWithEmail, loginWithPhone, confirmOTP,
        authError, adminDemoLogin, citizenDemoLogin
    } = useAuth()
    const { t, currentLanguage, setCurrentLanguage, languages } = useLanguage()

    const [activeTab, setActiveTab] = useState('email') // email | google | phone
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [otpSent, setOtpSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showLangMenu, setShowLangMenu] = useState(false)

    useEffect(() => {
        if (authError) setError(authError)
    }, [authError])

    const features = [
        { icon: Droplets, title: t('features.title1'), desc: t('features.desc1'), color: 'from-blue-500 to-cyan-500' },
        { icon: Globe, title: t('features.title2'), desc: t('features.desc2'), color: 'from-emerald-500 to-teal-500' },
        { icon: Users, title: t('features.title3'), desc: t('features.desc3'), color: 'from-purple-500 to-pink-500' },
        { icon: MessageSquare, title: t('features.title4'), desc: t('features.desc4'), color: 'from-blue-600 to-indigo-600' },
        { icon: Activity, title: t('features.title5'), desc: t('features.desc5'), color: 'from-cyan-400 to-blue-500' },
        { icon: TrendingUp, title: t('features.title6'), desc: t('features.desc6'), color: 'from-indigo-500 to-violet-500' },
    ]

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please enter email and password'); return }
        setError('')
        setIsLoading(true)
        try {
            await loginWithEmail(email, password)
        } catch (err) {
            setError(getFirebaseErrorMessage(err.code || err.message))
        }
        setIsLoading(false)
    }

    const handleGoogleLogin = async () => {
        setError('')
        setIsLoading(true)
        try {
            await loginWithGoogle()
        } catch (err) {
            setError(getFirebaseErrorMessage(err.code || err.message))
        }
        setIsLoading(false)
    }

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number with country code (e.g., +91...)')
            return
        }
        setError('')
        setIsLoading(true)
        try {
            const result = await loginWithPhone(phoneNumber, 'recaptcha-container')
            setConfirmationResult(result)
            setOtpSent(true)
        } catch (err) {
            setError(getFirebaseErrorMessage(err.code || err.message))
        }
        setIsLoading(false)
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) { setError('Please enter the 6-digit OTP'); return }
        setError('')
        setIsLoading(true)
        try {
            await confirmOTP(confirmationResult, otp)
        } catch (err) {
            setError(getFirebaseErrorMessage(err.code || err.message))
        }
        setIsLoading(false)
    }

    const getFirebaseErrorMessage = (err) => {
        // Supabase errors are plain messages; map known codes to friendly text
        const code = err?.message || err?.code;
        const messages = {
            'auth/user-not-found': 'No account found with this email. Please register first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-email': 'Invalid email address format.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
            'auth/invalid-phone-number': 'Invalid phone number format. Include country code.',
            'auth/invalid-verification-code': 'Invalid OTP code. Please check and try again.',
            'auth/code-expired': 'OTP has expired. Please request a new one.',
            'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
        };
        return messages[code] || err?.message || 'An error occurred. Please try again.';
    };

    const tabs = [
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'google', label: 'Google', icon: Globe },
        { id: 'phone', label: 'Phone', icon: Phone },
    ]

    return (
        <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <nav className="flex items-center justify-between px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <Waves className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold text-white">AquaPure Detect</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <Languages className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium">
                                    {languages.find(l => l.code === currentLanguage)?.flag} {languages.find(l => l.code === currentLanguage)?.name}
                                </span>
                            </button>

                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-dark-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in origin-top-right">
                                        {languages.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setCurrentLanguage(lang.code)
                                                    setShowLangMenu(false)
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${currentLanguage === lang.code
                                                    ? 'bg-blue-500/10 text-blue-400 font-bold'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span>{lang.flag}</span>
                                                    <span>{lang.name}</span>
                                                </span>
                                                {currentLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm text-gray-400">Advanced Purity Intelligence</span>
                            <Droplets className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left - Auth */}
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-300">{t('rev_wellness')}</span>
                            </div>

                            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-2">
                                <span className="text-white">{t('hero_title_1')}</span>
                                <br />
                                <span className="gradient-text">{t('hero_title_2')}</span>
                            </h1>
                            <p className="text-gray-400 mb-8 text-sm">{t('hero_desc')}</p>

                            {/* ═══ Role Information ═══ */}
                            <div className="max-w-md mb-6">
                                <div className="glass-card p-4 border-white/10 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <ShieldAlert className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white mb-1">Role-Based Access</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                <span className="text-blue-400 font-semibold">Admin Panel</span> — reserved for authorized inspector email only.
                                                <br />
                                                <span className="text-emerald-400 font-semibold">Citizen Panel</span> — all other registered users.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ═══ Demo Login Buttons ═══ */}
                            <div className="max-w-md mb-6 space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quick Demo Access</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        id="demo-admin-login-btn"
                                        onClick={adminDemoLogin}
                                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold text-sm cursor-pointer shadow-lg shadow-blue-500/5"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        Demo Admin
                                    </button>
                                    <button
                                        id="demo-citizen-login-btn"
                                        onClick={citizenDemoLogin}
                                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold text-sm cursor-pointer shadow-lg shadow-emerald-500/5"
                                    >
                                        <Users className="w-4 h-4" />
                                        Demo Citizen
                                    </button>
                                </div>
                            </div>

                            {/* ═══ Divider ═══ */}
                            <div className="flex items-center gap-3 max-w-md mb-6">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">or sign in with</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* ═══ Firebase Auth Card ═══ */}
                            <div className="glass-card p-6 border-white/10 max-w-md">
                                {/* Auth Method Tabs */}
                                <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setActiveTab(tab.id); setError('') }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-red-300">{error}</p>
                                    </div>
                                )}

                                {/* Email/Password Tab */}
                                {activeTab === 'email' && (
                                    <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm"
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                                            <div className="relative">
                                                <input
                                                    id="login-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm pr-12"
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            id="email-login-btn"
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                            {isLoading ? 'Signing in...' : 'Sign In'}
                                        </button>
                                        <p className="text-center text-sm text-gray-500">
                                            Don't have an account?{' '}
                                            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                                Register
                                            </Link>
                                        </p>
                                    </form>
                                )}

                                {/* Google Tab */}
                                {activeTab === 'google' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="text-center mb-2">
                                            <p className="text-gray-400 text-sm">Sign in instantly with your Google account</p>
                                        </div>
                                        <button
                                            id="google-login-btn"
                                            onClick={handleGoogleLogin}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-semibold transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                                        </button>
                                        <p className="text-center text-xs text-gray-600">
                                            Secure sign-in powered by Google OAuth 2.0
                                        </p>
                                    </div>
                                )}

                                {/* Phone Tab */}
                                {activeTab === 'phone' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {!otpSent ? (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                                                    <input
                                                        id="login-phone"
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={e => setPhoneNumber(e.target.value)}
                                                        placeholder="+91 98765 43210"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm"
                                                    />
                                                    <p className="text-xs text-gray-600 mt-1.5">Include country code (e.g., +91 for India)</p>
                                                </div>
                                                <button
                                                    id="send-otp-btn"
                                                    onClick={handleSendOTP}
                                                    disabled={isLoading}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-center mb-2">
                                                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                                        <Phone className="w-7 h-7 text-emerald-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-400">OTP sent to <span className="text-white font-semibold">{phoneNumber}</span></p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Enter OTP</label>
                                                    <input
                                                        id="login-otp"
                                                        type="text"
                                                        value={otp}
                                                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        placeholder="123456"
                                                        maxLength={6}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                                                    />
                                                </div>
                                                <button
                                                    id="verify-otp-btn"
                                                    onClick={handleVerifyOTP}
                                                    disabled={isLoading}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                                </button>
                                                <button
                                                    onClick={() => { setOtpSent(false); setOtp(''); setConfirmationResult(null) }}
                                                    className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                                >
                                                    ← Change phone number
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right - Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 animate-slide-up">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="glass-card-hover p-5 group"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-display font-bold text-white text-sm mb-1">{feature.title}</h3>
                                    <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="border-t border-white/5 px-8 py-4">
                    <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 text-center">
                        {[
                            { value: '15,000+', label: t('stats.users') },
                            { value: '42%', label: t('stats.steps') },
                            { value: '94%', label: t('stats.active') },
                            { value: '0.002%', label: t('stats.sick') },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="font-display text-2xl font-bold gradient-text">{stat.value}</span>
                                <span className="text-xs text-gray-500">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invisible reCAPTCHA container for phone auth */}
            <div id="recaptcha-container"></div>
        </div>
    )
}
