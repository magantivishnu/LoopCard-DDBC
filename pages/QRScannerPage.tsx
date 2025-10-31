import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Type for BarcodeDetector API for older TS versions
declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

const QRScannerPage: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [message, setMessage] = useState('Initializing camera...');
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    const handleScan = (url: string) => {
        setMessage('QR Code detected! Redirecting...');
        
        // Check if it's an internal LoopCard link
        // Example URL: https://.../#/card/some-id
        const loopCardPattern = /\/#\/card\/([a-zA-Z0-9-]+)/;
        const match = url.match(loopCardPattern);

        if (match && match[1]) {
            const cardId = match[1];
            navigate(`/card/${cardId}`);
        } else {
            // Open external links in a new tab
            window.open(url, '_blank', 'noopener,noreferrer');
            // Go back to the previous page in the app after opening the link
            navigate(-1);
        }
    };

    useEffect(() => {
        const startScan = async () => {
            if (!('BarcodeDetector' in window)) {
                setMessage('QR code scanning is not supported by this browser.');
                return;
            }

            try {
                const localStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                streamRef.current = localStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                    videoRef.current.play().catch(err => console.error("Video play failed:", err));
                }
                
                const scanner = new window.BarcodeDetector({ formats: ['qr_code'] });
                setMessage('Point your camera at a QR code');

                const detectCode = async () => {
                    if (videoRef.current && scanner && videoRef.current.readyState >= videoRef.current.HAVE_METADATA) {
                        try {
                            const barcodes = await scanner.detect(videoRef.current);
                            if (barcodes.length > 0) {
                                handleScan(barcodes[0].rawValue);
                                return; // Stop scanning
                            }
                        } catch (e) {
                            // This can happen if the document is not focused. Ignore the error and continue scanning.
                        }
                    }
                    animationFrameIdRef.current = requestAnimationFrame(detectCode);
                };
                detectCode();

            } catch (err) {
                console.error("Camera access error:", err);
                setMessage('Could not access camera. Please grant permission.');
            }
        };

        startScan();

        return () => {
            // Cleanup function
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                playsInline
                muted
            />
            {/* Viewfinder overlay */}
            <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg" />
            </div>

            <div className="absolute top-0 left-0 right-0 p-4 bg-black/50 text-center">
                <p className="text-white text-lg font-semibold">{message}</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white/80 text-black font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default QRScannerPage;
