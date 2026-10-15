import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard         from './pages/Dashboard';
import RainfallAnalysis  from './pages/RainfallAnalysis';
import SeasonalAnalysis  from './pages/SeasonalAnalysis';
import StatisticsPage    from './pages/StatisticsPage';
import DataExplorer      from './pages/DataExplorer';
import About             from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex">
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Main content area — offset by sidebar width */}
        <main className="ml-64 flex-1 min-w-0 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/analysis"   element={<RainfallAnalysis />} />
              <Route path="/seasonal"   element={<SeasonalAnalysis />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/explorer"   element={<DataExplorer />} />
              <Route path="/about"      element={<About />} />
              {/* Fallback */}
              <Route path="*"           element={
                <div className="text-center py-24 text-slate-400">
                  <p className="text-6xl mb-4">404</p>
                  <p>Page not found.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
