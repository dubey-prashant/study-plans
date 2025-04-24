import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className='bg-gray-800 shadow-md py-4'>
      <div className='max-w-6xl mx-auto px-4'>
        <ul className='flex space-x-8'>
          <li>
            <Link
              to='/'
              className='text-white hover:text-blue-300 font-medium transition-colors duration-200'
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to='/create-plan'
              className='text-white hover:text-blue-300 font-medium transition-colors duration-200'
            >
              Create New Plan
            </Link>
          </li>
          <li>
            <Link
              to='/plans'
              className='text-white hover:text-blue-300 font-medium transition-colors duration-200'
            >
              Plans
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
