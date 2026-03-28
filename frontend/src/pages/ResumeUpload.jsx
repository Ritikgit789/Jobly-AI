import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, CheckCircle, XCircle, Loader, Sparkles, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

function ResumeUpload({ setResumeData, resumeData, onAuthRequired }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingData, setPendingData] = useState(null); // Store data until auth

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/api/parse-resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // If not authenticated, store data and require login
                if (!isAuthenticated) {
                    setPendingData(response.data.data);
                    // Trigger auth requirement
                    if (onAuthRequired) {
                        onAuthRequired();
                    }
                } else {
                    // Authenticated - proceed normally
                    setResumeData(response.data.data);
                    fetchRecommendations(response.data.data);
                }
            } else {
                setError('Failed to parse resume');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    // Effect to handle pending data after auth
    const processPendingData = useCallback(() => {
        if (isAuthenticated && pendingData) {
            setResumeData(pendingData);
            fetchRecommendations(pendingData);
            setPendingData(null);
        }
    }, [isAuthenticated, pendingData, setResumeData]);

    // Process pending data when auth status changes - using inline effect
    if (isAuthenticated && pendingData) {
        setResumeData(pendingData);
        fetchRecommendations(pendingData);
        setPendingData(null);
    }

    const fetchRecommendations = async (data) => {
        if (!data?.skills?.length) return;

        setLoadingRecs(true);
        try {
            const response = await axios.post(`${API_URL}/api/recommendations`, {
                skills: data.skills,
                experience: data.experience_years,
                resume_text: data.raw_text
            });

            if (response.data.success) {
                setRecommendations(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecs(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Resume Parser</h1>
                <p className="text-gray-400">Upload your resume to extract skills and get AI-powered recommendations</p>
            </div>

            {/* Upload Area */}
            {!resumeData && (
                <div
                    className={`glass-card p-8 mb-8 transition-all duration-300 ${dragActive ? 'border-purple-500 bg-purple-500/10' : ''
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-all ${file ? 'bg-green-500/20' : 'bg-purple-500/20'
                            }`}>
                            {file ? (
                                <FileText className="w-10 h-10 text-green-400" />
                            ) : (
                                <Upload className="w-10 h-10 text-purple-400" />
                            )}
                        </div>

                        {file ? (
                            <div className="mb-6">
                                <p className="text-white font-medium mb-1">{file.name}</p>
                                <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Drop your resume here
                                </h3>
                                <p className="text-gray-400 mb-6">or click to browse (PDF only)</p>
                            </>
                        )}

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="resume-upload"
                        />

                        <div className="flex justify-center gap-4">
                            <label
                                htmlFor="resume-upload"
                                className="px-6 py-3 rounded-xl border border-white/20 text-white cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                {file ? 'Change File' : 'Browse Files'}
                            </label>

                            {file && (
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="gradient-btn inline-flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Analyze Resume
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="glass-card p-4 mb-8 border-red-500/30 bg-red-500/10 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                </div>
            )}

            {/* Pending Auth - Resume parsed but needs sign in */}
            {pendingData && !isAuthenticated && (
                <div className="glass-card p-8 mb-8 text-center border-purple-500/30 bg-purple-500/10">
                    <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Resume Parsed Successfully!</h3>
                    <p className="text-gray-400 mb-6">
                        Sign in to view your full analysis, AI recommendations, and find matching jobs
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => onAuthRequired && onAuthRequired()}
                            className="gradient-btn inline-flex items-center gap-2"
                        >
                            <Lock className="w-5 h-5" />
                            Sign In to Continue
                        </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">
                        Detected: {pendingData.name || 'Candidate'} • {pendingData.skills?.length || 0} skills
                    </p>
                </div>
            )}

            {/* Parsed Resume Data */}
            {resumeData && (
                <div className="space-y-6">
                    {/* Success Banner */}
                    <div className="glass-card p-4 border-green-500/30 bg-green-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-300">Resume parsed successfully!</span>
                        </div>
                        <button
                            onClick={() => {
                                setResumeData(null);
                                setFile(null);
                                setRecommendations(null);
                            }}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Upload New
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Name</p>
                                <p className="text-white font-medium">{resumeData.name || 'Not detected'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Email</p>
                                <p className="text-white font-medium">{resumeData.email || 'Not detected'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Phone</p>
                                <p className="text-white font-medium">{resumeData.phone || 'Not detected'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Experience</p>
                                <p className="text-white font-medium">{resumeData.experience_years || 'Not detected'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Level</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${resumeData.experience_level === 'fresher' ? 'bg-blue-500/20 text-blue-300' :
                                    resumeData.experience_level === 'junior' ? 'bg-green-500/20 text-green-300' :
                                        resumeData.experience_level === 'mid' ? 'bg-yellow-500/20 text-yellow-300' :
                                            resumeData.experience_level === 'senior' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {resumeData.experience_level || 'Unknown'}
                                    {resumeData.is_student && ' (Student)'}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Status</p>
                                <p className="text-white font-medium">{resumeData.current_status || 'Not detected'}</p>
                            </div>
                        </div>
                        {resumeData.summary && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Summary</p>
                                <p className="text-gray-300 text-sm">{resumeData.summary}</p>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Skills ({resumeData.skills?.length || 0})
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills?.length > 0 ? (
                                resumeData.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))
                            ) : (
                                <p className="text-gray-400">No skills detected</p>
                            )}
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                AI Recommendations
                            </h2>
                            {loadingRecs && <Loader className="w-5 h-5 animate-spin text-purple-400" />}
                        </div>

                        {loadingRecs ? (
                            <div className="text-center py-8">
                                <Loader className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
                                <p className="text-gray-400">Generating personalized recommendations...</p>
                            </div>
                        ) : recommendations ? (
                            <div className="space-y-4">
                                <p className="text-gray-300">{recommendations.summary}</p>

                                {recommendations.strengths?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-green-400 mb-2">Strengths</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendations.strengths.map((s, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recommendations.skill_gaps?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-orange-400 mb-2">Skills to Learn</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendations.skill_gaps.map((s, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recommendations.recommendations?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-purple-400 mb-2">Recommendations</h4>
                                        <div className="space-y-2">
                                            {recommendations.recommendations.map((rec, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-white">{rec.title}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-gray-500/20 text-gray-300'
                                                            }`}>
                                                            {rec.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{rec.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recommendations.next_steps?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-400 mb-2">Next Steps</h4>
                                        <ul className="space-y-1">
                                            {recommendations.next_steps.map((step, i) => (
                                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                    <span className="text-purple-400">→</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-400">No recommendations available</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="gradient-btn flex-1 inline-flex items-center justify-center gap-2"
                        >
                            Find Jobs
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/email')}
                            className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            Cold Email
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResumeUpload;
