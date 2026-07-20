import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudRain, Wind, Thermometer, Map, Activity, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20 lg:py-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          Intelligence for the <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600">
            Atmosphere
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 max-w-2xl text-xl text-slate-600 dark:text-slate-300 mx-auto mb-10"
        >
          WeatherVerse AI combines hyper-local real-time data, predictive AI models, and stunning visual radar to give you the most advanced weather experience on the planet.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link to="/register" className="px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 transition-all text-lg">
            Get Started Free
          </Link>
          <Link to="/map" className="px-8 py-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-lg flex items-center justify-center gap-2">
            <Map className="w-5 h-5" /> View Live Radar
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Unmatched Precision & Insights</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to stay ahead of the weather.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-500">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Hyper-local Forecasts</h3>
            <p className="text-slate-600 dark:text-slate-400">Minute-by-minute precipitation predictions for your exact location using advanced radar mapping.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Gemini AI Assistant</h3>
            <p className="text-slate-600 dark:text-slate-400">Ask complex questions. "Will it rain during my golf game at 3 PM?" Get instant, context-aware answers.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-6 text-rose-500">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Health & Lifestyle Center</h3>
            <p className="text-slate-600 dark:text-slate-400">Air Quality Index, Pollen counts, UV exposure, and personalized health recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
