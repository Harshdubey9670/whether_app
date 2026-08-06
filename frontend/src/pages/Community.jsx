import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, MapPin, Send, MessageCircle, Heart, Share2, Loader2, Video } from 'lucide-react';
import { getCommunityReports, createCommunityReport, toggleLikeReport, addCommentToReport, getCurrentWeather } from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import RequireAuth from '../components/Auth/RequireAuth';

const Community = () => {
  const queryClient = useQueryClient();
  const { locationQuery, coords } = useLocation();
  const [reportType, setReportType] = useState('Rain');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ['communityReports'],
    queryFn: getCommunityReports,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => getCurrentWeather(locationQuery),
    enabled: !!locationQuery,
    staleTime: 5 * 60 * 1000,
  });

  const createReportMutation = useMutation({
    mutationFn: createCommunityReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['communityReports']);
      setDescription('');
      setFile(null);
    },
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const formData = new FormData();
    formData.append('reportType', reportType);
    formData.append('description', description);
    
    if (file) {
      formData.append('media', file);
    }

    // Get exact location and current weather for this specific exact location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const exactWeather = await getCurrentWeather(`${lat},${lon}`);
          const locName = exactWeather?.location?.name || weatherData?.location?.name || 'Unknown Location';
          formData.append('location', JSON.stringify({ name: locName, lat, lng: lon }));
          createReportMutation.mutate(formData);
        } catch {
          const locName = weatherData?.location?.name || 'Unknown Location';
          formData.append('location', JSON.stringify({ name: locName, lat, lng: lon }));
          createReportMutation.mutate(formData);
        }
      }, () => {
        const locName = weatherData?.location?.name || 'Unknown Location';
        formData.append('location', JSON.stringify({ name: locName, lat: coords?.lat || 0, lng: coords?.lng || 0 }));
        createReportMutation.mutate(formData);
      }, { enableHighAccuracy: true });
    } else {
      const locName = weatherData?.location?.name || 'Unknown Location';
      formData.append('location', JSON.stringify({ name: locName, lat: coords?.lat || 0, lng: coords?.lng || 0 }));
      createReportMutation.mutate(formData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Report Local Weather</h3>
        <form onSubmit={handlePostSubmit}>
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 shrink-0"></div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border-none resize-none p-3 focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
              placeholder="What's the weather like around you?"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                <Image className="w-5 h-5" />
                <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border-none text-sm rounded-lg px-3 py-1.5 outline-none dark:text-slate-200"
              >
                {['Rain', 'Storm', 'Snow', 'Fog', 'Flood', 'Wildfire', 'Clear'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <RequireAuth>
              <button 
                type="submit" 
                disabled={createReportMutation.isPending || !description.trim()}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Report
              </button>
            </RequireAuth>
          </div>
          
          {file && (
            <div className="mt-4 text-sm text-primary-500 font-medium bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg inline-block">
              Selected file: {file.name}
            </div>
          )}
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : reports?.length === 0 ? (
          <div className="text-center p-10 text-slate-500">No reports yet. Be the first!</div>
        ) : (
          reports?.map((report) => (
            <ReportCard key={report._id} report={report} queryClient={queryClient} />
          ))
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ report, queryClient }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: toggleLikeReport,
    onSuccess: () => queryClient.invalidateQueries(['communityReports']),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => addCommentToReport(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityReports']);
      setCommentText('');
    },
  });

  const handleLike = () => likeMutation.mutate(report._id);
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate({ id: report._id, text: commentText });
  };

  return (
    <div className="glass rounded-3xl p-6 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden shrink-0">
            {report.user?.avatar ? (
              <img src={report.user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-primary-500 to-indigo-500"></div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
              {report.user?.name || 'Anonymous User'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3 h-3" />
              {report.location?.name}
              <span className="mx-1">•</span>
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider">
          {report.reportType}
        </span>
      </div>

      <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
        {report.description}
      </p>

      {report.media?.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          {report.media[0].type === 'image' ? (
            <img src={report.media[0].url} alt="weather report" className="w-full h-auto object-cover max-h-96" />
          ) : (
            <video src={report.media[0].url} controls className="w-full h-auto max-h-96"></video>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <RequireAuth onClick={handleLike}>
          <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
            <Heart className={`w-5 h-5 ${report.likes?.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="font-medium text-sm">{report.likes?.length || 0}</span>
          </button>
        </RequireAuth>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{report.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
            />
            <RequireAuth>
              <button 
                type="submit" 
                disabled={commentMutation.isPending || !commentText.trim()}
                className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </RequireAuth>
          </form>
          
          <div className="space-y-3">
            {report.comments?.map((comment, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-400 shrink-0"></div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl rounded-tl-none px-4 py-2 text-sm">
                  <p className="font-semibold text-slate-800 dark:text-white mb-0.5">
                    {comment.user?.name || 'User'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
