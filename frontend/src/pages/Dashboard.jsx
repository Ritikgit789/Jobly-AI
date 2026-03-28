import { useNavigate } from 'react-router-dom';
import { Upload, Briefcase, Mail, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';

function Dashboard({ resumeData }) {
    const navigate = useNavigate();

    const features = [
        {
            icon: Upload,
            title: 'Smart Resume Parser',
            description: 'AI-powered resume analysis that extracts skills, experience, and provides personalized recommendations.',
            path: '/resume',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/30'
        },
        {
            icon: Briefcase,
            title: 'AI Jobs Finder',
            description: 'Get tailored job listings generated specifically for your skills and experience level.',
            path: '/jobs',
            gradient: 'from-purple-500 to-pink-500',
            shadowColor: 'shadow-purple-500/30'
        },
        {
            icon: Mail,
            title: 'Cold Email Assistant',
            description: 'Generate and send personalized outreach emails that actually get responses.',
            path: '/email',
            gradient: 'from-orange-500 to-red-500',
            shadowColor: 'shadow-orange-500/30'
        }
    ];

    const stats = [
        { label: 'Skills Analyzed', value: resumeData?.skills?.length || '--', icon: Target },
        { label: 'AI Powered', value: 'Gemini 2.0', icon: Sparkles },
        { label: 'Real-time', value: 'SMTP', icon: Zap }
    ];

    return (
        <div className="max-w-6xl mx-auto fade-in">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Career Platform</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    <span className="text-white">Your Career,</span>{' '}
                    <span className="gradient-text">Supercharged</span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                    Upload your resume, get AI recommendations, find matching jobs, and send
                    personalized cold emails — all in one platform.
                </p>

                {resumeData ? (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span>Resume loaded: {resumeData.name || 'Ready to use'}</span>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/resume')}
                        className="gradient-btn inline-flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6 mb-16">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="glass-card p-6 text-center"
                    >
                        <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(feature.path)}
                        className="glass-card glass-card-hover p-6 cursor-pointer transition-all duration-300 group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform`}>
                            <feature.icon className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>

                        <div className="flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* How It Works */}
            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>

                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { step: 1, title: 'Upload Resume', desc: 'Drop your PDF resume' },
                        { step: 2, title: 'AI Analysis', desc: 'Extract skills & insights' },
                        { step: 3, title: 'Find Jobs', desc: 'Get tailored listings' },
                        { step: 4, title: 'Reach Out', desc: 'Send smart emails' }
                    ].map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mx-auto mb-3">
                                {item.step}
                            </div>
                            <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
