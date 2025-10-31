import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { CardData, UserTier, AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateAnalyticsInsights } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCardById, user } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [card, setCard] = useState<CardData | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Fix: Added component-level loading state for fetching card data.
  const [isCardLoading, setIsCardLoading] = useState(true);

  useEffect(() => {
    // Fix: Correctly implemented async data fetching for card details.
    const fetchCard = async () => {
      if (id) {
        setIsCardLoading(true);
        const foundCard = await getCardById(id);
        if (foundCard) {
          setCard(foundCard);
        } else {
          navigate('/dashboard');
        }
        setIsCardLoading(false);
      }
    };
    fetchCard();
  }, [id, getCardById, navigate]);

  const mockAnalytics: AnalyticsData = useMemo(() => ({
    totalViews: 258,
    uniqueScans: 89,
    timeOnPage: 45,
    locations: [
      { city: 'San Francisco', country: 'USA', count: 45 },
      { city: 'New York', country: 'USA', count: 22 },
      { city: 'London', country: 'UK', count: 15 },
    ],
    devices: [
      { type: 'iOS', count: 50 },
      { type: 'Android', count: 30 },
      { type: 'Desktop', count: 9 },
    ],
    heatmapData: [],
  }), []);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setAiInsights('');
    const insights = await generateAnalyticsInsights(mockAnalytics);
    setAiInsights(insights);
    setIsLoading(false);
  };

  // Fix: Show a spinner while the card data is being fetched.
  if (isCardLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!card) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Fix: Use correct `full_name` property from the CardData interface. */}
      <h1 className="text-3xl font-bold text-text mb-2">Analytics for {card.full_name}</h1>
      <p className="text-muted mb-8">Understand your card's performance.</p>

      {/* Basic Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-muted">Total Views</h3>
          <p className="text-3xl font-bold">{mockAnalytics.totalViews}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-muted">Unique Scans</h3>
          <p className="text-3xl font-bold">{mockAnalytics.uniqueScans}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-muted">Avg. Time on Page</h3>
          <p className="text-3xl font-bold">{mockAnalytics.timeOnPage}s</p>
        </div>
      </div>

      {/* Pro Analytics */}
      {user?.tier === UserTier.Pro ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-4">Views by Device</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAnalytics.devices}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4338CA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-semibold mb-4">Views by Location</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockAnalytics.locations} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="city" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#059669" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">AI-Powered Insights (Pro)</h2>
                <button 
                    onClick={handleGenerateInsights}
                    disabled={isLoading}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition disabled:bg-gray-400"
                >
                    {isLoading ? 'Generating...' : 'Generate Insights'}
                </button>
            </div>
            {isLoading && <Spinner />}
            {aiInsights && (
                <div className="prose max-w-none mt-4 p-4 bg-slate-50 rounded-md border" dangerouslySetInnerHTML={{__html: aiInsights.replace(/\n/g, '<br />')}}>
                </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-card p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <h2 className="text-2xl font-bold">Unlock Advanced Analytics</h2>
            <p className="text-muted mt-2">Upgrade to Pro to see detailed charts, location data, and generate AI-powered insights to boost your networking.</p>
            <button className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-md shadow-sm hover:bg-indigo-700 transition">
                Upgrade to Pro
            </button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
