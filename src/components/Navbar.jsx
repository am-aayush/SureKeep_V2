import React from 'react'


const Navbar = ({ setPage, userData }) => {
  return (
    <nav className="navbar bg-white/20 backdrop-blur-lg py-2.5 flex flex-col md:flex-row justify-between items-center md:px-20">
      <div className="logo flex items-center mb-2 md:mb-0 cursor-pointer" onClick={() => setPage("home")}>
        <img src="./image.png" alt="Logo" className="w-10 brightness-110 contrast-125 drop-shadow" />
        <span className="text-2xl font-bold ml-2 text-emerald-500 drop-shadow">{`<`}</span>
        <span className="text-2xl font-bold text-white drop-shadow">SureKeep</span>
        <span className="text-2xl font-bold text-emerald-500 drop-shadow">{`/>`}</span>
      </div>
      {!userData.id ? ( <> 
        <div className="nav_content flex gap-2 md:gap-4 w-full md:w-auto justify-center">
          <button onClick={() => setPage("login")} className="login flex-1 md:flex-none px-4 py-2 rounded-lg border border-white/40 bg-white/30 text-gray-100 font-semibold hover:bg-white/60 hover:border-white/60 hover:shadow-lg transition text-sm md:text-base shadow-md backdrop-blur-md cursor-pointer">
            Login
          </button>
          <button onClick={() => setPage("signup")} className="signup flex-1 md:flex-none px-4 py-2 rounded-lg border border-emerald-400 bg-emerald-500/80 text-white font-semibold hover:bg-emerald-600/90 hover:border-emerald-600 transition text-sm md:text-base shadow backdrop-blur-md cursor-pointer">
            Sign Up
          </button>
        </div>
      </> ) : 
      <div onClick={
        () => {
         console.log(userData) 
        }
        
      } className="nav_content flex gap-2 md:gap-4 w-full md:w-auto justify-center text-xl text-white  capitalize   ">
        Hello {userData.username}
      </div> }
    </nav>
  )
}

export default Navbar