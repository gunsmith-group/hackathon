import React from 'react';

const BreadCrumbs = ({label1, label2}) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
                <li>
                    <div>
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                        </a>
                    </div>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20"
                             aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"/>
                        </svg>
                        <a href="#" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{label1}</a>
                    </div>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20"
                             aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"/>
                        </svg>
                        <a href="#" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                           aria-current="page">{label2}</a>
                    </div>
                </li>
            </ol>
        </nav>
    )
}

export default BreadCrumbs;