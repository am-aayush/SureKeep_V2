import React from 'react'
import { useRef, useEffect, useState } from 'react'
import { nanoid } from "nanoid";
import validator from 'validator';
import { toast, Flip, Zoom } from 'react-toastify';
import { useForm } from 'react-hook-form';

const Manager = ({ userData, onLogout }) => {
    // Add this near the top of your Manager component:
    const {
        register: registerCollection,
        handleSubmit: handleSubmitCollection,
        formState: { errors: collectionErrors },
        reset: resetCollection,
    } = useForm();

    const {
        register: registerCredential,
        handleSubmit: handleSubmitCredential,
        formState: { errors: credentialErrors },
        reset: resetCredential,
    } = useForm();


    const eyeRef = useRef();
    const passRef = useRef();
    const c_formRef = useRef();
    // const [form, setform] = useState({ id: "", url: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const [collectionArray, setCollectionArray] = useState([])
    const [editStatus, setEditStatus] = useState(false)

    const fetchCollection = async () => {
        let id = userData.id;
        const res = await fetch(`http://localhost:4000/get/collection/${id}`)
        const result = await res.json();
        // // Fields to ignore
        const excludeKeys = ['_id', 'username', 'password'];
        // // Extract dynamic services and their IDs
        const extracted = [];
        for (const key in result) {
            if (!excludeKeys.includes(key) && result[key]?.id) {
                extracted.push({ name: key, id: result[key].id });
            }
        }
        setCollectionArray(extracted)
    }
    const fetchData = async (collectionId) => {
        let userId = userData.id;
        const res = await fetch(`http://localhost:4000/get/data/${userId}/${collectionId}`)
        const result = await res.json();
        const newData = result.map(item => ({ collectionId, ...item }));
        setPasswordArray(newData)
    }

    useEffect(() => {
        fetchCollection()
    }, [])

    const notifi = (text, type) => {
        toast(text, {
            transition: type,
        });
    }
    const showPassword = () => {
        if (eyeRef.current.src.includes("icons/eye.png")) {
            passRef.current.type = "text"
            eyeRef.current.src = "icons/eyecross.png"
        } else {
            passRef.current.type = "password"
            eyeRef.current.src = "icons/eye.png"
        }
    }
    const showCForm = () => {
        c_formRef.current.classList?.remove("hidden")
        c_formRef.current.classList?.add("flex")
    }
    const saveCollection = async (data) => {
        const newData = { userId: userData.id, ...data }
        console.log(newData);
        const res = await fetch("http://localhost:4000/user/collection", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
        const result = await res.json();
        fetchCollection()
        notifi(result.message, Zoom)
        resetCollection();
        c_formRef.current.classList?.remove("flex")
        c_formRef.current.classList?.add("hidden")
    }
    const saveData = async (data) => {
        const newData = { userId: userData.id, ...data }
        const endpoint = editStatus ? "update" : "data";
        const method = editStatus ? "PUT" : "POST";
        const res = await fetch(`http://localhost:4000/user/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });

        const result = await res.json();
        notifi(result.message, Zoom);
        if (!editStatus) {
            showAddCred();
        }

        await fetchData(data.collectionId);
    }
    const editRecord = (id) => {
        showAddCred();
        setEditStatus(true);
        const cred = passwordArray.find(e => e.dataId === id);
        if (cred) {
            const fullData = {
                collectionId: cred.collectionId,
                dataId: cred.dataId,  // important for update
                url: cred.url,
                username: cred.username,
                password: cred.password
            };
            setDisplayCredentials(fullData);
            resetCredential(fullData);
        }
    };
    const delPass = async (data) => {
        const userId = userData.id
        const collectionId = data.collectionId
        const dataId = data.dataId
        const res = await fetch('http://localhost:4000/user/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, collectionId, dataId })
        });
        const result = await res.json();
        notifi(result.message, Flip)
        await fetchData(data.collectionId);
        showAddCred();
    }
    const deleteCollection = async (collectionId) => {
        
        const res = await fetch("http://localhost:4000/user/deleteCollection", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userData.id, // Replace or pass dynamically
                collectionId: collectionId
            })
        });

        const data = await res.json();
        if (res.ok) {
           notifi(data.message,Zoom)
           fetchCollection()
        } else {
            notifi(data.message,Zoom)
        }
    };



    const [displayCredentials, setDisplayCredentials] = useState({})
    const [isVisible, setIsVisible] = useState(false)
    const showCredential = (dataId) => {
        setEditStatus(false)
        const cred = passwordArray.find(e => e.dataId === dataId)
        if (cred) {
            setDisplayCredentials({
                collectionId: cred.collectionId,
                dataId: cred.dataId,
                url: cred.url,
                username: cred.username,
                password: cred.password
            })
            if (window.innerWidth < 768) {
                setIsVisible(true)
            }
            document.querySelector(".displayCred")?.classList.remove("hidden")
            document.querySelector(".addCredential")?.classList.add("hidden")
        }
    }
    const showAddCred = () => {
        setEditStatus(false)
        if (window.innerWidth < 768) {
            setIsVisible(true)
        }
        setDisplayCredentials({});
        resetCredential({ collectionId: "", dataId: "", url: "", username: "", password: "" })
        document.querySelector(".displayCred")?.classList.add("hidden")
        document.querySelector(".addCredential")?.classList.remove("hidden")
    }
    const dispCred = useRef();
    useEffect(() => {
        if (isVisible) {
            dispCred.current.classList.remove("bg-black/35")
            dispCred.current.classList.add("absolute", "z-10", "w-full", "bg-black/95")
        } else {
            dispCred.current.classList.add("bg-black/35")
            dispCred.current.classList.remove("absolute", "z-10", "w-full", "bg-black")
        }
    }, [isVisible])
    //Some UI Changes For Mobile Devices
    const profileUserRef = useRef();
    const cross = useRef();
    const profileViewer = () => {
        profileUserRef.current.classList.remove("hidden", "w-1/4", "relative", "bg-black/45")
        profileUserRef.current.classList.add("block", "z-10", "bg-black", "w-full", "absolute", "right-0")
        cross.current.children[0].classList.remove("hidden")
        cross.current.classList.remove("flex-row")
        cross.current.classList.add("flex-col", "gap-2")
    }
    const closeProfileViewer = () => {
        profileUserRef.current.classList.add("hidden", "w-1/4", "relative", "bg-black/45")
        profileUserRef.current.classList.remove("block", "z-10", "bg-black", "w-full", "absolute", "right-0")
        cross.current.children[0].classList.add("hidden")
        cross.current.classList.add("flex-row")
        cross.current.classList.remove("flex-col", "gap-2")
    }

    //Some Usual and Attaractive Functionalities
    async function copyToClip(text) {
        try {
            await navigator.clipboard.writeText(text);
            notifi("Copied To Clipboard", Flip)
        } catch (err) {
            console.error('Failed to copy text to clipboard: ', err);
            notifi("Error Occured", Zoom)
        }
    }
    function getFaviconURL(url, fallback = "/image.png") {
        try {
            const parsed = new URL(url)
            return `${parsed.origin}/favicon.ico`
        } catch {
            return fallback
        }
    }
    const getError = (field, errorsObject) => {
        const type = errorsObject?.[field]?.type;
        const messages = {
            collectionName: {
                required: "A Name is required",
                minLength: "Name must be at least 3 characters",
                maxLength: "Name can't exceed 15 characters",
            },
            url: {
                required: "Url is required",
                minLength: "Url must be at least 3 characters",
                pattern: "Not A Valid URL",
            },
            username: {
                required: "Username is required",
                minLength: "Username must be at least 3 characters",
                maxLength: "Username can't exceed 12 characters",
            },
            password: {
                required: "Password is required",
                minLength: "Password must be at least 6 characters",
                maxLength: "Password can't exceed 15 characters",
            },
            collectionId: {
                required: "Please Select a Collection",
            },
        };

        return messages[field]?.[type] || null;
    };

    return (
        <>
            <div className="wrapper flex justify-center items-center md:p-4  ">
                <div className="md:container flex flex-row items-center justify-center min-h-[85vh] rounded-2xl backdrop-blur-lg backdrop-saturate-150">
                    <div ref={profileUserRef} className="user w-1/4 backdrop-blur-lg min-h-[85vh] bg-black/45 relative rounded-tl-2xl rounded-bl-2xl hidden md:block transition-all">
                        <div className="profile flex flex-row items-center justify-between p-4">
                            <div className='flex items-center gap-5 '>
                                <div className="name flex items-center">
                                    <img className="w-18" src="/icons/profile.gif" alt="UserIMG" />
                                    <h1 className="font-bold text-white capitalize">{userData.username}</h1>
                                    {/* <p className="text-gray-400">Hello </p> */}
                                </div>
                            </div>
                            <div ref={cross} className="logout flex flex-row justify-center items-center  ">
                                {/* <button className="px-4 py-2 rounded-lg border border-white/40 bg-white/30 text-gray-900 font-semibold hover:bg-white/60 hover:border-white/60 hover:shadow-lg transition text-sm shadow-md backdrop-blur-md">
                                    Logout
                                </button> */}
                                <lord-icon
                                    onClick={() => { closeProfileViewer(); }}
                                    className="hidden"
                                    src="./icons/Cross.json"
                                    trigger="hover"
                                    style={{ "width": "30px", "height": "30px" }}>
                                </lord-icon>
                                <lord-icon onClick={onLogout}
                                    src="./icons/exit.json"
                                    trigger="hover"
                                    style={{ "width": "25px", "height": "25px" }}>
                                </lord-icon>
                            </div>
                        </div>
                        <div className="nav_items flex flex-col items-start justify-start w-full gap-2 py-7">

                            <form ref={c_formRef}
                                onSubmit={handleSubmitCollection(saveCollection)} className="hidden justify-between w-full items-center gap-2 px-4 py-3 bg-black/30 hover:bg-black/40 transition-all">
                                <div className="w-full">
                                    <input {...registerCollection("collectionName", {
                                        required: true,
                                        minLength: 3,
                                        maxLength: 15,
                                    })} type="text" id="collectionName" placeholder="Enter Collection Name" className="text-white placeholder-gray-400 outline-none py-2 px-2 w-full bg-black/50" />
                                    {collectionErrors.collectionName && (
                                        <div className="text-red-500 text-sm block">
                                            ⚠️ {getError("collectionName", collectionErrors)}
                                        </div>
                                    )}
                                </div>
                                <div className="icon">
                                    <button type="submit" name="cFormSubmit" className="cursor-pointer">
                                        <lord-icon
                                            // className="rotate-270"
                                            src="./icons/LoadFile.json"
                                            trigger="hover"
                                            style={{ width: "40px", height: "40px" }}
                                        ></lord-icon>
                                    </button>
                                </div>
                            </form>

                            {collectionArray.length === 0 && <div className="item flex text-white justify-center w-full items-center px-4 py-3 bg-black/30 hover:bg-black/40 transition-all">
                                <lord-icon
                                    src="./icons/NoData.json"
                                    trigger="hover"
                                    style={{ "width": "50px", "height": "40px" }}>
                                </lord-icon>Nothing to show
                            </div>}
                            {collectionArray.length !== 0 &&
                                collectionArray.map((item, index) => {
                                    return <div key={item.id} className={`item flex justify-between w-full items-center px-4 py-3 ${item?.id === passwordArray[0]?.collectionId ? "bg-black/35" : ""}   hover:bg-black/50 cursor-pointer transition-all`}
                                        onClick={() => { fetchData(item.id); }}>
                                        <div className='flex items-center gap-2'>
                                            <lord-icon
                                                src="./icons/lock.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                            <span className='text-gray-300'>{item.name}</span>
                                        </div>
                                        <div className="icon invert flex items-center gap-2">
                                            <lord-icon
                                                onClick={() => {
                                                    const check = confirm(`Do you want to delete ${item.name} Collection`)
                                                    if (check) {
                                                        deleteCollection(item.id)
                                                    }
                                                }
                                                }
                                                src="https://cdn.lordicon.com/skkahier.json"
                                                trigger="hover"
                                                style={{ "width": "23px", "height": "23px" }}>
                                            </lord-icon>
                                            <lord-icon className="rotate-270"
                                                src="./icons/Blackchevrons.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </div>
                                    </div>
                                })}

                        </div>
                        <div className="bottom-0 absolute w-full">
                            <div className="trash w-full flex justify-between bg-transparent gap-2.5 px-4 py-4">
                                <div className='invert cursor-pointer flex items-center'>
                                    <lord-icon
                                        src="https://cdn.lordicon.com/skkahier.json"
                                        trigger="hover"
                                        style={{ "width": "25px", "height": "25px" }}>
                                    </lord-icon>
                                    <span className='text-gray-300 invert'>Trash</span>
                                </div>
                                <div>
                                    <span className='text-white m-0 p-0 cursor-pointer' onClick={() => { showCForm() }} >
                                        <lord-icon
                                            className="m-0 p-0"
                                            src="./icons/plus.json"
                                            trigger="hover"
                                            style={{ "width": "45px", "height": "35px" }}>
                                        </lord-icon>
                                    </span>
                                </div>
                            </div>
                            <div className="feedback flex justify-center items-center bg-black/35 rounded-bl-2xl py-5">
                                <span className='text-white inline-flex'>
                                    Give Feedback &nbsp;
                                    <lord-icon
                                        src="./icons/Feedback.json"
                                        trigger="hover"
                                        style={{ "width": "25px", "height": "25px" }}>
                                    </lord-icon>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar and credential view area */}
                    <div className="passLists md:w-7/20 w-full  min-h-[85vh] flex flex-col relative bg-black/15">

                        <div className="searchWrapper flex justify-center items-center max-h-1/10">
                            <div className="searchBar w-9/10 flex justify-center items-center my-4">
                                <div onClick={() => { profileViewer(); }} className="bar md:hidden  inline-flex ">
                                    <lord-icon
                                        src="./icons/Menu.json"
                                        trigger="hover"
                                        style={{ "width": "50px", "height": "40px" }}>
                                    </lord-icon>
                                </div>
                                <input type="text" placeholder="Search for credentials..." className="w-full  text-white placeholder-gray-400 outline-none  bg-black/30 px-4 py-3" />
                                <button className=" font-semibold hover:bg-black/30 hover:shadow-lg transition bg-black/30 px-2 py-1 cursor-pointer">
                                    <lord-icon
                                        src="./icons/search.json"
                                        trigger="hover"
                                        style={{ "width": "40px", "height": "35px" }}
                                    >
                                    </lord-icon>
                                </button>
                            </div>
                        </div>
                        <hr />

                        <div className="credentialList flex flex-col items-start justify-start gap-1 overflow-y-auto max-h-[72vh] custom-scrollbar ">
                            {passwordArray.length === 0 &&
                                <div className='text-white w-full flex justify-center items-center px-6 py-5 bg-black/10 hover:bg-black/25 transition-all'>
                                    <lord-icon
                                        src="./icons/NoData.json"
                                        trigger="hover"
                                        style={{ "width": "50px", "height": "40px" }}>
                                    </lord-icon>Nothing to show
                                </div>
                            }
                            {passwordArray.length !== 0 &&
                                passwordArray.map((item, index) => {
                                    return <div key={item.dataId} className={`credentialItem w-full flex justify-between items-center px-6 py-5 transition-all 
    ${displayCredentials?.dataId === item.dataId ? "bg-black/35" : "bg-black/10"} hover:bg-black/35`}
                                        onClick={() => { showCredential(item.dataId); }}>
                                        <div className='flex items-center gap-2 overflow-x-hidden'>
                                            <div className='p-2 rounded-xl bg-white/20'>
                                                <img src={getFaviconURL(item.url)} onError={(e) => e.target.src = "/image.png"} alt="icon" className="min-w-6 h-6" />
                                            </div>
                                            <span className='text-gray-300 truncate w-[250px] '>
                                                {item.url}
                                            </span>
                                        </div>
                                        <div className="icon invert">
                                            <lord-icon className="rotate-270 w-6 h-6"
                                                src="./icons/Blackchevrons.json"
                                                trigger="hover">
                                            </lord-icon>
                                        </div>
                                    </div>
                                })}
                            {/* ...repeat credentialItem as needed... */}
                        </div>
                        <div onClick={() => { showAddCred(); }} className="new absolute right-3.5 bottom-3.5 flex justify-center items-center bg-violet-600 hover:bg-violet-700 transition-all  text-4xl font-bold text-white w-12 h-12 rounded-full">
                            <lord-icon
                                src="./icons/plus.json"
                                trigger="hover"
                                style={{ "width": "50px", "height": "40px" }}>
                            </lord-icon>
                        </div>
                    </div>

                    {/* Display Credentials */}
                    <div ref={dispCred} className={`${isVisible ? "block" : "hidden"} md:block md:w-2/5  min-h-[85vh] overflow-y-auto max-h-[85vh] bg-black/35  transition-all`}>
                        <lord-icon
                            onClick={() => { setIsVisible(false) }}
                            className={`${isVisible ? "block" : "hidden"} p-2 `}
                            src="./icons/Cross.json"
                            trigger="hover"
                            style={{ "width": "30px", "height": "30px" }}>
                        </lord-icon>
                        <div className="displayCred hidden transition-all">
                            <div className="block-1 sm:flex sm:flex-col md:flex-row justify-between items-center md:gap-15 py-6 text-white overflow-hidden">

                                {/* Left Side: Icon + URL */}
                                <div className="sm:flex md:flex sm:flex-col md:flex-row items-center justify-center gap-5 w-full md:w-2/3 px-3  overflow-hidden">

                                    {/* Icon Box */}
                                    <div className="img rounded-xl md:bg-white/20 flex justify-center items-center min-w-16 sm:w-full md:w-16 h-16 shrink-0 p-1.5">
                                        <img
                                            src={getFaviconURL(displayCredentials.url)}
                                            alt="WebLogo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* URL Box */}
                                    <div className="names w-full overflow-hidden">
                                        <span className="block text-ellipsis overflow-hidden whitespace-nowrap max-sm:text-center">
                                            {displayCredentials.url}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="action flex max-sm:justify-center gap-2.5 pr-3 mt-4 sm:mt-6 md:mt-0 md:w-auto shrink-0">
                                    <div className="share cursor-pointer">
                                        <lord-icon src="./icons/share.json" trigger="hover"></lord-icon>
                                    </div>
                                    <div className="copy invert cursor-pointer">
                                        <lord-icon
                                            onClick={() => copyToClip(displayCredentials.url)}
                                            style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                            trigger="hover"
                                        ></lord-icon>
                                    </div>
                                    <div className="edit invert cursor-pointer">
                                        <lord-icon
                                            onClick={() => { editRecord(displayCredentials.dataId); }}
                                            style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                                            src="https://cdn.lordicon.com/gwlusjdu.json"
                                            trigger="hover"
                                        ></lord-icon>
                                    </div>
                                    <div onClick={() => {
                                        // console.log("Deleting password with id ", displayCredentials.id)
                                        const c = confirm("Do you really want to delete this password?")
                                        if (c) {
                                            delPass(displayCredentials)
                                            // showAddCred()
                                        }
                                    }}
                                        className="delete invert cursor-pointer">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/skkahier.json"
                                            trigger="hover"
                                            style={{ width: "25px", height: "25px" }}
                                        ></lord-icon>
                                    </div>
                                </div>
                            </div>

                            <hr />
                            <div className="block-2 h-8/10">

                                <div className="username min-h-1/10 py-5 px-10 space-y-3 ">
                                    <span className='text-gray-400 block'>Username</span>
                                    <div className='text-gray-100 space-x-3 mx-1 flex  items-center'>
                                        <span>{displayCredentials.username}</span>
                                        <button onClick={() => { copyToClip(displayCredentials.username) }} className='invert'>
                                            <lord-icon
                                                style={{ "width": "25px", "height": "25px", "paddingTop": "5px", }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover" >
                                            </lord-icon></button>
                                    </div>
                                </div>
                                <div className="password min-h-1/10 py-5 px-10 space-y-3 ">
                                    <span className='text-gray-400 block'>Password</span>
                                    <div className='text-gray-100 space-x-3 mx-1'>
                                        <span>{displayCredentials.password}</span>
                                        <button onClick={() => { copyToClip(displayCredentials.password) }} className='invert'> <lord-icon
                                            style={{ "width": "25px", "height": "25px", "paddingTop": "5px", }}
                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                            trigger="hover" >
                                        </lord-icon></button>
                                    </div>
                                </div>

                            </div>
                        </div>


                        {/* Add Credentials */}
                        <form className="addCredential transition-all text-center" onSubmit={handleSubmitCredential(saveData)}>
                            <h1 className="text-2xl text-white sm:p-3 md:p-5">
                                {editStatus ? "Edit" : "Add"} Credentials
                            </h1>

                            <div className="collection text-white text-center">
                                <select {...registerCredential("collectionId", { required: true })} disabled={collectionArray.length === 0} id="collection" placeholder="Please Select Collection" className="text-white placeholder-white outline-none py-3 px-2 mb-3 w-9/10 bg-black/50">
                                    {collectionArray.length === 0 && <option value="" className="disabled:text-white   !text-white">Please Add Collection First</option>}
                                    {collectionArray.length !== 0 && (
                                        <>
                                            <option value="">Please Select A Collection</option> {/* Renders only once */}
                                            {collectionArray.map((item) => (
                                                <option key={item.id} value={item.id}>{item.name}</option>))}
                                        </>
                                    )}

                                </select>
                                {credentialErrors.collectionId && (
                                    <div className="text-red-500">
                                        ⚠️ {getError("collectionId", credentialErrors)}
                                    </div>
                                )}

                            </div>
                            <div className="url text-white text-center">
                                <input {...registerCredential("url", { required: true, minLength: 3, pattern: /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d{1,5})?(\/\S*)?$/i, })}
                                    type="text" placeholder="Enter Website URL" className="text-white placeholder-gray-400 outline-none py-2 px-2 w-9/10 bg-black/50" />
                                {credentialErrors.url && (
                                    <div className="text-red-500">
                                        ⚠️ {getError("url", credentialErrors)}
                                    </div>
                                )}
                            </div>

                            <div className="username text-white text-center my-4">
                                <input {...registerCredential("username", {
                                    required: true,
                                    minLength: 3,
                                    maxLength: 12,
                                })} type="text" placeholder="Enter Username" className="text-white placeholder-gray-400 outline-none py-2 px-2 w-9/10 bg-black/50" />
                                {credentialErrors.username && (
                                    <div className="text-red-500">
                                        ⚠️ {getError("username", credentialErrors)}
                                    </div>
                                )}
                            </div>

                            <div className="password text-white flex flex-col items-center justify-center mt-4 relative">
                                <div className="w-full flex items-center justify-center relative">
                                    <input {...registerCredential("password", {
                                        required: true,
                                        minLength: 3,
                                        maxLength: 12,
                                    })} ref={(el) => {
                                        passRef.current = el;
                                        registerCredential("password").ref(el);
                                    }} type="password" placeholder="Enter Password" className="text-white placeholder-gray-400 outline-none py-2 px-2 w-9/10 bg-black/50" />
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2" onClick={() => { showPassword(); }}>
                                        <img ref={eyeRef} src="icons/eye.png" width={26} className="invert cursor-pointer" alt="EYE" />
                                    </div>
                                </div>
                                {credentialErrors.password && (
                                    <div className="text-center text-red-500 mb-4 w-full">
                                        ⚠️ {getError("password", credentialErrors)}
                                    </div>
                                )}
                            </div>

                            <div className="button flex flex-col items-center justify-center my-2 py-3">
                                <button type="submit" className="flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/jgnvfzqg.json"
                                        trigger="hover"></lord-icon>
                                    {editStatus ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>


                    </div>

                </div>
            </div>
        </>
    )
}

export default Manager