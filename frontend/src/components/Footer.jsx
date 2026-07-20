import { CloudSun, Globe, Mail, Link as LinkIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <CloudSun className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">WeatherVerse AI</span>
            </div>
            <p className="text-sm text-slate-400">
              The ultimate AI-powered weather intelligence platform for accurate forecasting and insights.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Live Radar</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><LinkIcon className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center text-slate-500">
          © {new Date().getFullYear()} WeatherVerse AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
