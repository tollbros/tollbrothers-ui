import React from 'react';

const ArrowLeft = ({ fill }) => {
  return (
    <svg fill={fill} style={{ width: '100%', height: '100%' }} viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.445 20.79a1.112 1.112 0 0 1 0 1.588 1.14 1.14 0 0 1-1.587 0l-6.65-6.65c-.207-.206-.334-.492-.334-.81s.127-.602.333-.81l6.651-6.65c.444-.443 1.143-.443 1.587 0s.444 1.144 0 1.588l-4.762 4.746h16.905c.62-.001 1.111.507 1.111 1.126s-.492 1.11-1.11 1.11H7.683z'
        fillRule='evenodd'
      />
    </svg>
  );
};

export default ArrowLeft;
