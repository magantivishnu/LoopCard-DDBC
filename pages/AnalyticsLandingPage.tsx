import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const AnalyticsLandingPage: React.FC = () => {
    const { cards } = useAppContext();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-text mb-6">View Analytics</h1>
            <p className="text-muted mb-8">Select a card to see its performance analytics.</p>

            {cards.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-semibold text-gray-700">No cards available.</h2>
                    <p className="text-muted mt-2">Create a card first to see analytics.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map(card => (
                        <Link to={`/analytics/${card.id}`} key={card.id} className="block bg-card rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary transition">
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    {/* Fix: Use correct property names from CardData interface */}
                                    <img className="w-16 h-16 rounded-full" src={card.profile_photo} alt={card.full_name} />
                                    <div>
                                        {/* Fix: Use correct property names from CardData interface */}
                                        <h3 className="text-xl font-bold text-text">{card.full_name}</h3>
                                        <p className="text-muted">{card.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnalyticsLandingPage;
