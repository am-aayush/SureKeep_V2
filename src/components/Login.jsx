import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Flip, Zoom } from "react-toastify";
const Login = ({ setPage, setUserData }) => {
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

    const login = async (data) => {
        try {
            const res = await fetch("http://localhost:4000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // ✅ this is REQUIRED for cookies to be stored
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok) {
                notifi("Login Successful", Flip)
                // console.log("Login successful:", result.username);
                reset();
                setUserData({id:result.id,username:result.username});
                setPage("home"); // ✅ Navigate to home
            } else {
                console.error("Login failed:", result.message || "Unknown error");
                notifi("Invalid Credentials", Zoom)
                // alert(result.message );
            }
        } catch (err) {
            console.error("Error during login:", err);
            notifi("Login failed due to server error.", Flip)
        }    
    };

    return (
        <div className='wrapper flex justify-center items-center text-white my-6'>
            <div className="container md:w-1/3 rounded-xl p-6 bg-black/20 backdrop-blur-3xl">
                <h1 className='text-3xl font-bold text-white py-4 text-center'>
                    <span className='text-shadow-md text-shadow-white'>Login</span>
                </h1>
                <form className="form p-5" onSubmit={handleSubmit(login)}>
                    <div className="username flex flex-col my-8 gap-2">
                        <label htmlFor="username">Username</label>
                        {/* ✅ Hook up with register */}
                        <input
                            {...register("username", { required: true })}
                            type="text"
                            id="username"
                            placeholder="Enter Username"
                            className="border-b outline-none"
                        />
                        {errors.username && <span className="text-red-500 text-sm">Username is required</span>}
                    </div>

                    <div className="password flex flex-col my-10 gap-2">
                        <label htmlFor="password">Password</label>
                        <input
                            {...register("password", { required: true })}
                            type="password"
                            id="password"
                            placeholder="Enter Password"
                            className="border-b outline-none"
                        />
                        {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
                    </div>

                    <div className="button text-center w-full">
                        <button
                            type="submit"
                            className="bg-white text-black w-full p-1.5 rounded-3xl font-bold text-lg cursor-pointer">
                            Log in
                        </button>
                        <div className="mt-7">
                            Don't Have an Account?{" "}
                            <button type="button"
                                className="cursor-pointer font-bold"
                                onClick={() => setPage("signup")}>
                                Register
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
