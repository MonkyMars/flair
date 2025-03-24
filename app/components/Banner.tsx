import { useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

type BannerType = 'error' | 'success';

interface BannerProps {
  message: string;
  type: BannerType;
  visible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Banner = ({ 
  message, 
  type, 
  visible, 
  onClose, 
  autoClose = true,
  duration = 5000 
}: BannerProps) => {
  // Set up auto-close timer if enabled
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, autoClose, duration]);

  const Icon = type === 'error' ? FaExclamationTriangle : FaCheckCircle;
  
  return (
    <div className={`app-banner ${type}-banner ${visible ? 'visible' : ''}`}>
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center">
          <Icon className="mr-2" size={18} />
          <span>{message}</span>
        </div>
        <button 
          onClick={onClose} 
          className="ml-4 text-white hover:text-opacity-80 transition-opacity"
          aria-label="Close notification"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>
  );
};

export default Banner; 