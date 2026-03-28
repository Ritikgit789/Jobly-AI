import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader, Send, Sparkles, CheckCircle, AlertCircle, ArrowRight, Copy, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function ColdEmail({ resumeData }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [generatedEmail, setGeneratedEmail] = useState(null);

    // Form state
    const [form, setForm] = useState({
        targetCompany: '',
        targetRole: '',
        targetEmail: '',
        tone: 'professional'
    });

    // Pre-fill from job selection
    useEffect(() => {
        if (location.state?.job) {
            const job = location.state.job;
            setForm(prev => ({
                ...prev,
                targetCompany: job.company || '',
                targetRole: job.title || '',
                targetEmail: job.contact_email || ''
            }));
        }
    }, [location.state]);

    const generateEmail = async () => {
        if (!resumeData?.name || !form.targetCompany || !form.targetRole) {
            setError('Please fill in required fields');
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedEmail(null);

        try {
            const response = await axios.post(`${API_URL}/api/generate-cold-email`, {
                candidate_name: resumeData.name || 'Candidate',
                candidate_email: resumeData.email || 'candidate@email.com',
                candidate_skills: resumeData.skills || [],
                target_company: form.targetCompany,
                target_role: form.targetRole,
                target_email: form.targetEmail,
                tone: form.tone
            });

            if (response.data.success) {
                setGeneratedEmail(response.data);
            } else {
                setError('Failed to generate email');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate email');
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async () => {
        if (!form.targetEmail || !generatedEmail) {
            setError('Please provide recipient email and generate email content first');
            return;
        }

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(`${API_URL}/api/send-cold-email`, {
                to_email: form.targetEmail,
                subject: generatedEmail.subject,
                body: generatedEmail.body,
                candidate_name: resumeData?.name || 'Candidate',
                candidate_email: resumeData?.email || 'candidate@email.com'
            });

            if (response.data.success) {
                setSuccess(`Email sent successfully to ${form.targetEmail}!`);
            } else {
                setError('Failed to send email');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    if (!resumeData) {
        return (
            <div className="max-w-4xl mx-auto fade-in">
                <div className="glass-card p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Resume Uploaded</h2>
                    <p className="text-gray-400 mb-6">Please upload your resume first to generate personalized cold emails</p>
                    <button
                        onClick={() => navigate('/resume')}
                        className="gradient-btn inline-flex items-center gap-2"
                    >
                        Upload Resume
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Cold Email Assistant</h1>
                <p className="text-gray-400">Generate and send personalized outreach emails</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Form */}
                <div className="space-y-6">
                    {/* Form Card */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Email Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Target Company *</label>
                                <input
                                    type="text"
                                    value={form.targetCompany}
                                    onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
                                    placeholder="e.g., Google, Microsoft, Startup XYZ"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Target Role *</label>
                                <input
                                    type="text"
                                    value={form.targetRole}
                                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Recipient Email</label>
                                <input
                                    type="email"
                                    value={form.targetEmail}
                                    onChange={(e) => setForm({ ...form, targetEmail: e.target.value })}
                                    placeholder="e.g., recruiter@company.com"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Tone</label>
                                <select
                                    value={form.tone}
                                    onChange={(e) => setForm({ ...form, tone: e.target.value })}
                                    className="glass-input"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual & Friendly</option>
                                    <option value="enthusiastic">Enthusiastic</option>
                                    <option value="formal">Formal</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateEmail}
                            disabled={loading || !form.targetCompany || !form.targetRole}
                            className="gradient-btn w-full mt-6 inline-flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Email
                                </>
                            )}
                        </button>
                    </div>

                    {/* Your Info */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Sending As</h3>
                        <div className="space-y-2">
                            <p className="text-white">{resumeData.name || 'Your Name'}</p>
                            <p className="text-gray-400 text-sm">{resumeData.email || 'your@email.com'}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {resumeData.skills?.slice(0, 4).map((skill, i) => (
                                    <span key={i} className="skill-tag text-xs">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Generated Email */}
                <div>
                    {/* Error */}
                    {error && (
                        <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/10 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="glass-card p-4 mb-6 border-green-500/30 bg-green-500/10 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-green-300">{success}</span>
                        </div>
                    )}

                    {generatedEmail ? (
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Generated Email</h2>
                                <button
                                    onClick={generateEmail}
                                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Regenerate
                                </button>
                            </div>

                            {/* Subject */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm text-gray-400">Subject</label>
                                    <button
                                        onClick={() => copyToClipboard(generatedEmail.subject)}
                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy
                                    </button>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-white">{generatedEmail.subject}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm text-gray-400">Body</label>
                                    <button
                                        onClick={() => copyToClipboard(generatedEmail.body)}
                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy
                                    </button>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 max-h-80 overflow-y-auto">
                                    <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                                        {generatedEmail.body}
                                    </pre>
                                </div>
                            </div>

                            {/* Follow-up Suggestion */}
                            {generatedEmail.follow_up_suggestion && (
                                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-6">
                                    <p className="text-sm text-purple-300">
                                        <strong>💡 Tip:</strong> {generatedEmail.follow_up_suggestion}
                                    </p>
                                </div>
                            )}

                            {/* Send Button */}
                            <button
                                onClick={sendEmail}
                                disabled={sending || !form.targetEmail}
                                className="gradient-btn w-full inline-flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Email
                                    </>
                                )}
                            </button>

                            {!form.targetEmail && (
                                <p className="text-xs text-gray-400 text-center mt-2">
                                    Please provide recipient email to send
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Email Generated</h3>
                            <p className="text-gray-400">Fill in the details and click "Generate Email"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ColdEmail;
