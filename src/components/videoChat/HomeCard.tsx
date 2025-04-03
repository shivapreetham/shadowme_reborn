'use client';

interface HomeCardProps {
  className?: string;
  title: string;
  description: string;
  handleClick?: () => void;
  icon:any;
}
// Update to your HomeCard component
const HomeCard: React.FC<HomeCardProps> = ({ 
  className = "", 
  title, 
  description, 
  handleClick,
  icon // Replace img with icon
}) => {
  return (
    <div 
      className={`flex cursor-pointer flex-col gap-4 rounded-xl p-6 transition-all hover:opacity-80 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-40 backdrop-blur-sm shadow-sm">
          {icon}
        </div>
        <div className="h-8 w-8 rounded-full bg-white bg-opacity-30"></div>
      </div>
      
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default HomeCard;