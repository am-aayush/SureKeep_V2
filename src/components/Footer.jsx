import React from 'react'

const Footer = () => {
  return (
    <div className='bg-black/30 flex flex-col justify-center items-center'>
        <img src="./logo-bg.png" className='w-1/10 mix-blend-exclusion' alt="Logo" />
        <div className='text-white'>Made with <img className='inline w-1/10' src="./icons/heart.png" alt="heart" /> By Aayush</div>
    </div>
  )
}

export default Footer   