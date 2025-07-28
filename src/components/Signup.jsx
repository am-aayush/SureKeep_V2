import React from 'react'
import { useForm } from 'react-hook-form';
import { toast , Flip , Zoom } from 'react-toastify';



const Signup = ({ setPage }) => {
    const notifi = (text, type) => {
            toast(text, {          
                transition: type,
            });
        }

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const save = async (data) => {
        try {
            const response = await fetch("http://localhost:4000/user/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                // Handle specific status codes
                if (response.status === 409) {
                    // Username already exists
                    notifi("Username Already Exixt",Zoom)
                } else {
                    // Some other error
                    notifi("Something went wrong. Please try again.",Zoom)
                }
                return; // Stop further execution
            }

            reset(); // Only reset if successful
            notifi("SignUp Successfully",Zoom)           
            setPage('login')
        } catch (error) {
            console.error("Error saving user:", error);
            notifi("Network error. Please check your connection.",Flip)
        }
    };


    const getError = (field) => {
        const type = errors[field]?.type;
        const messages = {
            username: {
                required: "Username is required",
                minLength: "Username must be at least 3 characters",
                maxLength: "Username can't exceed 12 characters",
                pattern: "Username can only contain letters, numbers, and _"
            },
            password: {
                required: "Password is required",
                minLength: "Password must be at least 6 characters",
                maxLength: "Password can't exceed 15 characters",
                pattern: "Password must include a letter and a number"
            }
        };

        return messages[field]?.[type] || null;
    };
    return (
        <div className='wrapper flex justify-center items-center text-white my-6'>
            <div className="container rounded-xl  p-6 md:w-1/3 bg-black/20 backdrop-blur-3xl">
                <h1 className='text-3xl font-bold   text-white py-4 text-center'>
                    <span className='text-shadow-md text-shadow-white'>
                        Sign Up
                    </span>
                </h1>
                <form className="form p-5" onSubmit={handleSubmit(save)}>
                    <div className="username flex flex-col my-8 gap-2">
                        <label htmlFor="username">Username</label>
                        <input {...register('username', { required: true, minLength: 3, maxLength: 12 })} type="text" name="username" id="username" placeholder='Enter Username' className='border-b outline-none ' />
                        {getError("username") && (
                            <span className="text-red-500 text-sm">⚠️ {getError("username")}</span>
                        )}
                    </div>
                    <div className="password flex flex-col my-10 gap-2">
                        <label htmlFor="password">Password</label>
                        <input {...register('password', { required: true, minLength: 6, maxLength: 15 })} type="text" name="password" id="password" placeholder='Enter Password' className='border-b outline-none' />
                        {getError("password") && (
                            <span className="text-red-500 text-sm">⚠️ {getError("password")}</span>
                        )}
                    </div>
                    <div className="button text-center w-full">
                        <button type="submit" className='bg-white text-black w-full p-1.5 rounded-3xl font-bold text-lg cursor-pointer'>Sign up</button>
                        <div className='mt-7'>Already Have a Account <button type='button' className='cursor-pointer font-bold' onClick={() => { setPage('login') }} >Log in</button> </div>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Signup