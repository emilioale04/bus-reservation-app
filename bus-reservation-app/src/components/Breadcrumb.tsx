import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Navegación por migas de pan" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" aria-hidden="true" />
            )}
            
            {item.current ? (
              <span 
                className="text-gray-900 font-medium" 
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded flex items-center"
              >
                {index === 0 && (
                  <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                )}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center">
                {index === 0 && (
                  <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
