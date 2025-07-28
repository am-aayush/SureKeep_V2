import { useState, useEffect } from 'react'
import viteLogo from '/vite.svg'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Manager from './components/Manager.jsx'

import { ToastContainer } from 'react-toastify';
import Login from './components/login.jsx'
import Signup from './components/Signup.jsx'

function App() {

  const [page, setPage] = useState("login");
  const [userData, setUserData] = useState({ id: "", username: "" });
  // const [userid, setUserid] = useState(null)
  /*
    {
    "_id": {
      "$oid": "68848337819bb299e4ed2f80"
    },
    "username": "asd6f65fksdf",
    "password": "password",
    "Collection_name": {
      "id":"ajldkfj",
      "data": [
      {
        "dataId": "5xbOL9zu7Q",
        "url": "https://www.sonyliv.com/",
        "username": "Sonyyyysss",
        "password": "1234"
      },
      {
        "id": "4kNdeYf1x2",
        "url": "https://www.amazon.in/",
        "username": "Amazon",
        "password": "4567"
      },
      {
        "id": "T5caxk0lXq",
        "url": "https://chatgpt.com/",
        "username": "Try",
        "password": "catch"
      }
    ]
  }
  }
  */


  useEffect(() => {
    fetch("http://localhost:4000/user/me", {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {

        setUserData({ id: data.id, username: data.username });
        setPage("home");
      })
      .catch(() => {
        setUserData({});
        setPage("login");
      });
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:4000/user/logout", {
      method: "POST",
      credentials: 'include'
    });
    setUserData({});
    setPage("login");
  };


  return (
    <>
      <Navbar setPage={setPage} userData={userData} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      {userData.id && page === "home" && <Manager userData={userData} onLogout={handleLogout} />}
      {!userData.id && page === "login" && <Login setPage={setPage} setUserData={setUserData} />}
      {!userData.id && page === "signup" && <Signup setPage={setPage} />}
      <Footer />
    </>
  )
}

export default App
