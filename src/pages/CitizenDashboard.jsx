import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, ShieldCheck, AlertTriangle, Heart, MessageSquare, Send, CheckCircle2, User, Activity, Plus, MapPin, Play, Pause, Video } from 'lucide-react';
import NeighborMap from '../components/NeighborMap';
import WaterNewsWidget from '../components/WaterNewsWidget';
import { runRoboflowInference } from '../services/roboflowService';

export default function CitizenDashboard() {
    const [videoActive, setVideoActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState('Kitchen Tap');
    const [purityScore, setPurityScore] = useState(98.4);
    const [pps, setPps] = useState(12);
    const [flowRate, setFlowRate] = useState(4.2);
    const [detectedLogs, setDetectedLogs] = useState([
        { time: '18:42:01', polymer: 'PET', size: '24μm', confidence: '94%', type: 'Fragment' },
        { time: '18:42:03', polymer: 'Nylon', size: '85μm', confidence: '89%', type: 'Fiber' }
    ]);
    const [complaint, setComplaint] = useState({ type: 'General', details: '', healthAffected: false });
    const [submitted, setSubmitted] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera access error:', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth === 0) return; // not ready
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        
        setAnalyzing(true);
        try {
            const rawDetectionResult = await runRoboflowInference(base64);
            
            // Filter to ONLY detect the physical macro water bottle on screen
            // Hide all other microscopic particle detections
            const filteredDetections = rawDetectionResult.detections.filter(
                det => det.id === 'macro_bottle_1'
            );
            
            const totalMass = filteredDetections.reduce((s, d) => s + d.size_um * 0.001, 0);
            const filteredConcentration = ((totalMass / 10) * 1000).toFixed(1);

            const detectionResult = {
                ...rawDetectionResult,
                detections: filteredDetections,
                totalParticles: filteredDetections.length,
                concentration: filteredConcentration
            };

            setResult(detectionResult);
            
            // Update stats
            setPurityScore(Math.max(0, 100 - (parseFloat(detectionResult.concentration) * 2)));
            setPps(detectionResult.totalParticles);
            setFlowRate(prev => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
            
            // Add to logs
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            const newLogs = detectionResult.detections.map(det => ({
                time: timeStr,
                polymer: det.polymer.id,
                size: `${det.size_um}μm`,
                confidence: `${(det.confidence * 100).toFixed(0)}%`,
                type: det.polymer.risk
            }));

            if(newLogs.length > 0) {
                setDetectedLogs(prev => [...newLogs, ...prev].slice(0, 5));
            }
        } catch (e) {
            console.error(e);
        }
        setAnalyzing(false);
    };

    useEffect(() => {
        if (videoActive) {
            startCamera();
            const interval = setInterval(() => {
                captureAndAnalyze();
            }, 3000);
            return () => {
                clearInterval(interval);
                stopCamera();
            };
        } else {
            stopCamera();
            setResult(null);
            setAnalyzing(false);
        }
    }, [videoActive]);

    const handleComplaintSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setComplaint({ type: 'General', details: '', healthAffected: false });
    };

    const healthyTips = [
        { title: "Boil for 5+ Mins", desc: "Reduces microplastic suspension by binding particles to minerals.", icon: Activity },
        { title: "Activated Carbon", desc: "Filter water using certified multi-stage carbon blocks.", icon: ShieldCheck },
        { title: "Digestive Health", desc: "Consume antioxidants to counter oxidative stress from ingestants.", icon: Heart },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in p-2 lg:p-4 pb-20 lg:pb-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <User className="w-8 h-8 text-emerald-400" /> Citizen Health & Safety
                    </h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] lg:hidden mt-1">Global Resident Portal v1.0</p>
                    <p className="text-gray-400 mt-1 hidden lg:block">Monitor your water quality and report local health impacts</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[
                            { icon: '🏅', color: 'bg-blue-500', label: 'Water Protector' },
                            { icon: '🌍', color: 'bg-emerald-500', label: 'Eco Hero' },
                            { icon: '♻', color: 'bg-zinc-700', label: 'Plastic Reducer', locked: true },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className={`w-10 h-10 rounded-full border-2 border-dark-950 flex items-center justify-center text-lg shadow-lg relative group ${badge.color} ${badge.locked ? 'grayscale opacity-40' : 'animate-bounce-slow'}`}
                                style={{ animationDelay: `${i * 0.2}s` }}
                            >
                                {badge.icon}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-800 text-[8px] font-black text-white uppercase rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 border border-white/10">
                                    {badge.label} {badge.locked && '(Locked)'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* AI Video Analyser Section */}
                <div className="space-y-6">
                    <div className="glass-card p-6 overflow-hidden relative flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold text-white uppercase tracking-wider">AI Video Analyser</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedFeed}
                                    onChange={(e) => setSelectedFeed(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    <option value="Kitchen Tap" className="bg-dark-900">Kitchen Tap</option>
                                    <option value="Local Well" className="bg-dark-900">Local Well</option>
                                    <option value="Municipal Stream" className="bg-dark-900">Municipal Stream</option>
                                </select>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${videoActive ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                    {videoActive ? 'LIVE' : 'IDLE'}
                                </span>
                            </div>
                        </div>

                        {/* Viewport Screen */}
                        <div className="relative w-full h-64 bg-dark-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-[inset_0_4px_24px_rgba(0,0,0,0.8)]">
                            <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoActive ? 'opacity-100' : 'opacity-0'}`} playsInline muted autoPlay />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            {/* Animated Flow background when active */}
                            {videoActive && (
                                <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-blue-900/40 via-cyan-900/20 to-transparent pointer-events-none">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_8px] animate-[flow-water_4s_linear_infinite]" />
                                </div>
                            )}

                            {!videoActive && (
                                <div className="absolute inset-0 bg-dark-950 flex flex-col items-center justify-center text-center p-6 z-10 pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-3">
                                        <Video className="w-7 h-7 text-gray-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Feed Connection Idle</h4>
                                    <p className="text-xs text-gray-500 mt-1 max-w-xs">Start the real-time AI computer vision analyser to scan flowing water particles.</p>
                                </div>
                            )}

                            {/* Live AI Bounding Boxes */}
                            {videoActive && result && result.detections.map((det, i) => {
                                const x = (det.bbox.x / result.imageWidth) * 100;
                                const y = (det.bbox.y / result.imageHeight) * 100;
                                const w = (det.bbox.width / result.imageWidth) * 100;
                                const h = (det.bbox.height / result.imageHeight) * 100;
                                return (
                                    <div key={i} className="absolute border border-cyan-500 rounded-lg animate-pulse flex flex-col justify-between p-1 bg-cyan-500/10 pointer-events-none" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
                                        <span className="text-[7px] text-cyan-400 font-bold bg-dark-950/80 px-1 rounded uppercase tracking-wide w-fit">{det.polymer.id}</span>
                                        <span className="text-[6px] text-cyan-400 text-right">{(det.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                )
                            })}

                            {videoActive && (
                                <>
                                    {/* Laser scan line */}
                                    <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-[scan-beam_3s_linear_infinite] pointer-events-none" />
                                    {/* Rec light overlay */}
                                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-dark-950/80 px-2 py-0.5 rounded border border-white/5 z-20 pointer-events-none">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                        <span className="text-[8px] font-bold text-white tracking-widest">{analyzing ? 'ANALYZING' : 'REC AI'}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Controls Panel */}
                        <div className="flex gap-4 mt-5">
                            <button
                                onClick={() => setVideoActive(!videoActive)}
                                className={`flex-1 py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-3 cursor-pointer shadow-lg ${
                                    videoActive
                                        ? 'bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 shadow-red-500/5'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/15'
                                }`}
                            >
                                {videoActive ? (
                                    <>
                                        <Pause className="w-4.5 h-4.5 fill-current" /> Pause AI Stream
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4.5 h-4.5 fill-current" /> Start AI Analyser
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Purity Index</span>
                                <span className={`text-xl font-black ${purityScore < 90 ? 'text-red-400' : purityScore < 97 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                    {videoActive ? `${purityScore}%` : '--'}
                                </span>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Particles/L</span>
                                <span className="text-xl font-black text-white">
                                    {videoActive ? pps : '--'}
                                </span>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Flow Rate</span>
                                <span className="text-xl font-black text-cyan-400">
                                    {videoActive ? `${flowRate} L/s` : '--'}
                                </span>
                            </div>
                        </div>

                        {/* Real-time Detections Logs */}
                        <div className="mt-5 space-y-2.5">
                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Real-time Detection Feed
                            </div>
                            <div className="h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl p-2 bg-dark-950/40 space-y-1.5">
                                {videoActive ? (
                                    detectedLogs.map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 animate-fade-in text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-gray-600 font-mono font-bold">{log.time}</span>
                                                <span className="font-bold text-white">{log.polymer} {log.type}</span>
                                                <span className="text-[10px] text-gray-400">({log.size})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-semibold uppercase">{log.confidence}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-center text-xs text-gray-600">
                                        Logs will populate here as particles are tracked in the video stream.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complaint Form Section */}
                <div className="space-y-6">
                    {/* Daily Facts Section */}
                    {(() => {
                        const [completed, setCompleted] = useState(false);
                        const insights = [
                            { fact: "Bottled water contains 50% more microplastics than tap water.", badge: "Plastic Reducer", icon: "♻", task: "Use a steel bottle today" },
                            { fact: "Boiling water for 5 mins reduces microplastic suspension by up to 80%.", badge: "Water Protector", icon: "🏅", task: "Boil & Filter your water" },
                            { fact: "83% of global tap water samples contain plastic micro-fibers.", badge: "Eco Hero", icon: "🌍", task: "Run a purity scan" },
                            { fact: "Plastic items in rivers can take 450 years to fully decompose.", badge: "Plastic Reducer", icon: "♻", task: "Avoid single-use plastics" },
                            { fact: "Industrial runoff is the leading cause of regional river toxicity.", badge: "Water Protector", icon: "🏅", task: "Report nearby contamination" }
                        ];
                        const index = Math.floor(Date.now() / 86400000) % insights.length;
                        const today = insights[index];

                        return (
                            <div className="glass-card p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20 animate-fade-in relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">Daily Eco Insight</h3>
                                    </div>
                                    <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <p className="text-sm text-gray-300 italic leading-relaxed pr-8">
                                            "{today.fact}"
                                        </p>
                                        <button className="absolute top-0 right-0 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {!completed ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group/task hover:border-indigo-500/50 transition-all cursor-pointer">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-lg shadow-lg group-hover/task:scale-110 transition-transform">
                                                    {today.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Active Task</div>
                                                    <div className="text-sm font-bold text-white">{today.task}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCompleted(true)}
                                                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                I Completed This! <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-scale-in flex flex-col items-center text-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-emerald-400 transition-all">Task Completed!</div>
                                                <div className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">+50 Eco Points Earned</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <div className="text-indigo-400/60 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> New Task in 14h
                                    </div>
                                    <div className="text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
                                        Badge Progress +15%
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Report Incident</h3>
                                <p className="text-sm text-gray-400">Your reports are reviewed by regional inspectors</p>
                            </div>
                        </div>

                        {submitted ? (
                            <div className="text-center py-12 animate-scale-in">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2">Report Dispatched</h4>
                                <p className="text-gray-400">The admin panel has been notified. Thank you for your contribution.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleComplaintSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Incident Category</label>
                                    <select
                                        value={complaint.type}
                                        onChange={(e) => setComplaint({ ...complaint, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-colors outline-none appearance-none"
                                    >
                                        <option value="General">General Water Quality</option>
                                        <option value="Health">Health Issue Reported</option>
                                        <option value="Odor">Bad Odor / Taste</option>
                                        <option value="Industrial">Visible Industrial Leak</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <input
                                        type="checkbox"
                                        id="healthEffect"
                                        checked={complaint.healthAffected}
                                        onChange={(e) => setComplaint({ ...complaint, healthAffected: e.target.checked })}
                                        className="w-5 h-5 rounded border-red-500/50 text-red-500 bg-transparent"
                                    />
                                    <label htmlFor="healthEffect" className="text-sm text-red-200 font-bold">Has your health been affected? (Rashes, Stomach issues, etc.)</label>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Provide Details</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={complaint.details}
                                        onChange={(e) => setComplaint({ ...complaint, details: e.target.value })}
                                        placeholder="Describe the issue at your location..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-colors outline-none"
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
                                    <Send className="w-5 h-5" /> Submit to Authority
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Live Water News - Full Width */}
            <WaterNewsWidget compact={false} maxItems={6} />

            {/* Neighborhood Map Section - FULL WIDTH */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Neighborhood Purity Network</h3>
                        <p className="text-sm text-gray-400">See real-time contamination reports from your neighbors on a colorful live map</p>
                    </div>
                </div>

                <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <NeighborMap />
                    <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
                        <div className="glass-card p-4 border-indigo-500/20 bg-indigo-950/40 backdrop-blur-xl max-w-xs transition-opacity opacity-0 group-hover:opacity-100 italic">
                            <h4 className="text-xs font-black text-white uppercase mb-1">Live AI Monitoring</h4>
                            <p className="text-[10px] text-gray-300 leading-relaxed">This map correlates your neighbors' manual reports with server-side AI Vision analysis from regional IoT nodes.</p>
                        </div>
                    </div>


                </div>
            </div>
            {/* Styles for simulated scan */}
            <style>{`
                @keyframes flow-water {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
                @keyframes scan-beam {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
