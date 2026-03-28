import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Loader, MapPin, Clock, DollarSign, Building, ArrowRight, AlertCircle, RefreshCw, Mail } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function JobsFinder({ resumeData }) {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    // Job generation settings
    const [settings, setSettings] = useState({
        location: 'Remote',
        jobType: 'Full-time',
        numJobs: 5
    });

    const generateJobs = async () => {
        if (!resumeData?.skills?.length) {
            setError('Please upload your resume first to generate matching jobs');
            return;
        }

        setLoading(true);
        setError(null);
        setSelectedJob(null);

        try {
            // Send experience level to generate appropriate jobs (internships for freshers, etc.)
            const experienceLevel = resumeData.experience_level || 'fresher';
            const isStudent = resumeData.is_student || false;

            // Auto-select internship for students/freshers if not already set
            let jobType = settings.jobType;
            if ((isStudent || experienceLevel === 'fresher') && jobType === 'Full-time') {
                jobType = 'Internship';
            }

            const response = await axios.post(`${API_URL}/api/generate-jobs`, {
                skills: resumeData.skills,
                experience: resumeData.experience_years || 'Fresher',
                experience_level: experienceLevel,
                is_student: isStudent,
                preferred_location: settings.location,
                job_type: jobType,
                num_jobs: settings.numJobs
            });

            if (response.data.success) {
                setJobs(response.data.jobs);
            } else {
                setError('Failed to generate jobs');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate jobs');
        } finally {
            setLoading(false);
        }
    };

    const getMatchColor = (score) => {
        if (score >= 85) return 'text-green-400 bg-green-500/20';
        if (score >= 70) return 'text-yellow-400 bg-yellow-500/20';
        return 'text-orange-400 bg-orange-500/20';
    };

    if (!resumeData) {
        return (
            <div className="max-w-4xl mx-auto fade-in">
                <div className="glass-card p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Resume Uploaded</h2>
                    <p className="text-gray-400 mb-6">Please upload your resume first to find matching jobs</p>
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
        <div className="max-w-6xl mx-auto fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">AI Jobs Finder</h1>
                    <p className="text-gray-400">Synthetic job listings tailored to your profile</p>
                </div>

                <button
                    onClick={generateJobs}
                    disabled={loading}
                    className="gradient-btn inline-flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-5 h-5" />
                            Generate Jobs
                        </>
                    )}
                </button>
            </div>

            {/* Settings */}
            <div className="glass-card p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Job Preferences</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Location</label>
                        <select
                            value={settings.location}
                            onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                            className="glass-input"
                        >
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="San Francisco, CA">San Francisco, CA</option>
                            <option value="New York, NY">New York, NY</option>
                            <option value="London, UK">London, UK</option>
                            <option value="Bangalore, India">Bangalore, India</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Job Type</label>
                        <select
                            value={settings.jobType}
                            onChange={(e) => setSettings({ ...settings, jobType: e.target.value })}
                            className="glass-input"
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Number of Jobs</label>
                        <select
                            value={settings.numJobs}
                            onChange={(e) => setSettings({ ...settings, numJobs: parseInt(e.target.value) })}
                            className="glass-input"
                        >
                            <option value={3}>3 Jobs</option>
                            <option value={5}>5 Jobs</option>
                            <option value={7}>7 Jobs</option>
                            <option value={10}>10 Jobs</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-purple-300">
                        <strong>Your Skills:</strong> {resumeData.skills?.slice(0, 5).join(', ')}
                        {resumeData.skills?.length > 5 && ` +${resumeData.skills.length - 5} more`}
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 mb-8 border-red-500/30 bg-red-500/10 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="glass-card p-12 text-center">
                    <div className="spinner mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Generating Jobs...</h3>
                    <p className="text-gray-400">AI is creating personalized job listings for you</p>
                </div>
            )}

            {/* Jobs Grid */}
            {!loading && jobs.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Job List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            {jobs.length} Jobs Found
                        </h3>

                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`glass-card p-4 cursor-pointer transition-all duration-300 hover:border-purple-500/30 ${selectedJob?.id === job.id ? 'border-purple-500/50 bg-purple-500/10' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                                        <p className="text-purple-400 flex items-center gap-1">
                                            <Building className="w-4 h-4" />
                                            {job.company}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.match_score)}`}>
                                        {job.match_score}% Match
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {job.job_type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {job.salary_range}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Job Details */}
                    <div className="sticky top-8">
                        {selectedJob ? (
                            <div className="glass-card p-6">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(selectedJob.match_score)}`}>
                                            {selectedJob.match_score}% Match
                                        </span>
                                    </div>
                                    <p className="text-purple-400 text-lg">{selectedJob.company}</p>
                                    <p className="text-gray-400 text-sm mt-1">{selectedJob.company_description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-400 text-xs mb-1">Location</p>
                                        <p className="text-white">{selectedJob.location}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-400 text-xs mb-1">Salary</p>
                                        <p className="text-white">{selectedJob.salary_range}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-400 text-xs mb-1">Experience</p>
                                        <p className="text-white">{selectedJob.experience_required}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-400 text-xs mb-1">Posted</p>
                                        <p className="text-white">{selectedJob.posted_date}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                                    <p className="text-gray-400 text-sm">{selectedJob.description}</p>
                                </div>

                                {selectedJob.responsibilities?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Responsibilities</h4>
                                        <ul className="space-y-1 text-sm text-gray-400">
                                            {selectedJob.responsibilities.map((r, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-purple-400">•</span>
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedJob.skills_match?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Skills Match</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.skills_match.map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.benefits?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Benefits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.benefits.map((b, i) => (
                                                <span key={i} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-300 text-xs">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/email', { state: { job: selectedJob } })}
                                    className="gradient-btn w-full inline-flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-5 h-5" />
                                    Send Cold Email
                                </button>
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center">
                                <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-400">Select a job to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Jobs Generated Yet</h3>
                    <p className="text-gray-400 mb-6">Click "Generate Jobs" to create personalized job listings</p>
                </div>
            )}
        </div>
    );
}

export default JobsFinder;
