import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/resume/history');
      if (response.data.success) {
        setResumes(response.data.resumes);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load resume history.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setFile(selectedFile);
    toast.success(`${selectedFile.name} loaded successfully.`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Resume uploaded successfully.');
        setFile(null);
        fetchHistory();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this resume version?');
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/resume/${id}`);
      if (response.data.success) {
        toast.success('Resume version deleted.');
        fetchHistory();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete resume.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Resume Management</h2>
        <p className="text-gray-400 text-sm mt-1 font-light">
          Upload and version control your resume. We support only PDF files up to 5MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="md:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`glass border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[300px] text-center relative overflow-hidden group ${
              dragActive
                ? 'border-violet-500 bg-violet-500/5'
                : 'border-white/10 hover:border-violet-500/40 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleChange}
            />

            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-4 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform mb-4">
              <FileUp className="w-8 h-8 text-violet-400" />
            </div>

            <p className="text-sm font-semibold text-gray-200">
              Drag & Drop PDF resume file here
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              Or click to browse from explorer
            </p>
            <p className="text-[10px] text-gray-600 mt-4 uppercase font-semibold tracking-wider">
              Maximum Size: 5MB
            </p>
          </div>

          {/* Selected File Stage */}
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-md text-gray-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="px-4 py-2 border border-white/5 hover:bg-white/5 text-gray-400 hover:text-gray-200 rounded-xl transition-all text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl transition-all text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-violet-500/15 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Process Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Column */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Upload Instructions
          </h3>
          <div className="space-y-4 mt-4 text-xs leading-relaxed text-gray-400 font-light">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p>Only text-based or vectorized PDF formats are parsed. Avoid uploading low-quality scanned image PDFs.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p>Adding a newly uploaded file automatically archives previous entries and designates the new file as **Latest**.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p>ATS Calculations, Skill Gap Matrices, and roadmap structures dynamically recompute to target your active profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Panel */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" />
            Resume Version History
          </h3>
          <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-gray-400 font-medium">
            {resumes.length} {resumes.length === 1 ? 'Version' : 'Versions'}
          </span>
        </div>

        {fetching ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-500 text-xs mt-3 tracking-wide">Loading resume catalog...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-400">No resumes registered</p>
            <p className="text-xs text-gray-500 mt-1 font-light max-w-sm">
              Upload your initial resume above to enable parser and semantic mapping features.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-950/20">
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {resumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-white/2 bg-gray-950/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-violet-400" />
                        <span className="font-medium text-gray-200 truncate max-w-xs">{resume.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-light">
                      {new Date(resume.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {resume.isLatest ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase tracking-wider">
                          Active Latest
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-500 border border-white/5 rounded-full font-medium uppercase tracking-wider">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={resume.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 border border-white/5 hover:border-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition-colors cursor-pointer"
                          title="Open Resume Document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(resume._id)}
                          className="p-2 bg-white/5 border border-white/5 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete version"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeManager;
