import React from 'react';

import logo from '../assets/gg.svg';

const Header = ({selection = 1}) => {

    const renderItem = (pos, label, path) => {
        if (pos === selection) {
            return <a
                className="inline-flex items-center border-b-2 gg-border-1 border-indigo-500 px-1 pt-1 text-sm font-medium gg-color-1">{label}</a>
        } else {
            return <a href={path}
               className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium  gg-color-2 hover:border-gray-300 hover:text-gray-700">{label}</a>
        }
    }

    return (
        <>
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 justify-between">
                        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex flex-shrink-0 items-center">
                                <img className="h-8 w-auto"
                                     src={logo}
                                     alt="Your Company"/>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {renderItem(1, 'World War 3 Extinguisher', '/sandbox/ww3e')}
                                {renderItem(2, 'GG Manufacturing', '/sandbox/manufacturing')}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Header;