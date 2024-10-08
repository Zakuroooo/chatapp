import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "/Users/pranaysarkar/Desktop/CHAT APPLICATION/react-firebase-chat/src/lib/firebase.js";

import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { auth, db } from "../../lib/firebase";

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        URL: ""
    });

    const [loading, setLoading] = useState(false);

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                URL: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        // Check if email is valid before attempting login
        if (!validateEmail(email)) {
            toast.error("Invalid email format");
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        // Check if email is valid before attempting registration
        if (!validateEmail(email)) {
            toast.error("Invalid email format");
            setLoading(false);
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            // Handle cases where avatar file is not provided
            let imgUrl = "";
            if (avatar.file) {
                imgUrl = await upload(avatar.file);
            }

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("Account Created Successfully");
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign In "}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.URL || "./avatar.png"} alt="" />
                        Upload an image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
