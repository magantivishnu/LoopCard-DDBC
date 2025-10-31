import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { CardData, UserTier, AnalyticsData, Click } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateAnalyticsInsights } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCardById, user, getCardClicks } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [card, setCard] = useState<CardData | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // For AI insights
  const [isCardLoading, setIsCardLoading] = useState(true); // For initial card data
  const [clicks, setClicks] = useState<Click[]>([]);
  const [isClicksLoading, setIsClicksLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30); // Default to 30 days

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!id) {
        navigate('/analytics');
        return;
      }
      
      setIsCardLoading(true);
      setIsClicksLoading(true);
      try {
        const foundCard = await getCardById(id);
        const clickData = await getCardClicks(id);
        
        if (isMounted) {
          if (foundCard) {
            setCard(foundCard);
            setClicks(clickData);
          } else {
            console.warn(`Card with ID ${id} not found. Redirecting.`);
            navigate('/analytics');
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        if (isMounted) {
          navigate('/analytics');
        }
      } finally {
        if (isMounted) {
          setIsCardLoading(false);
          setIsClicksLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, getCardById, getCardClicks, navigate]);

  const filteredClicks = useMemo(() => {
    if (!clicks) return [];
    if (timeRange === Infinity) return clicks;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    return clicks.filter(click => new Date(click.created_at).getTime() >= cutoffDate.getTime());
  }, [clicks, timeRange]);

  const clickCountsByType = useMemo(() => {
    // Fix: Use a generic type argument for `reduce` to ensure TypeScript correctly
    // infers the accumulator type, preventing type errors in subsequent operations.
    const counts = filteredClicks.reduce<Record<string, number>>((acc, click) => {
      const type = click.type.charAt(0).toUpperCase() + click.type.slice(1);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort descending for a more useful chart
  }, [filteredClicks]);

  const clickDataForChart = useMemo(() => {
    const clicksByDate = filteredClicks.reduce<Record<string, number>>((acc, click) => {
      const date = new Date(click.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(clicksByDate)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredClicks]);
  
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
  
  const timeRanges = [
    { label: '7 Days', value: 7 }, { label: '14 Days', value: 14 },
    { label: '30 Days', value: 30 }, { label: '60 Days', value: 60 },
    { label: '90 Days', value: 90 }, { label: 'All Time', value: Infinity },
  ];

  if (isCardLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!card) {
    return null; 
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-2">Analytics for {card.full_name}</h1>
      <p className="text-muted mb-8">Understand your card's performance.</p>

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
          <h3 className="text-muted">Total Clicks</h3>
          <p className="text-3xl font-bold">{clicks.length}</p>
        </div>
      </div>

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
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold mb-4">Click Analytics</h2>
            <div className="flex flex-wrap gap-2 mb-6">
                {timeRanges.map(range => (
                    <button
                        key={range.label}
                        onClick={() => setTimeRange(range.value)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition ${timeRange === range.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
            {isClicksLoading ? <Spinner /> : (
                filteredClicks.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4 text-center">Click Distribution by Type</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={clickCountsByType} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8B5CF6" name="Clicks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-center">Clicks Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={clickDataForChart}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Bar dataKey="clicks" fill="#10B981" name="Clicks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted py-10">No click data available for this period.</p>
                )
            )}
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