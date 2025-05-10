import React from 'react'
import { auth } from '../config/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/Login.module.css'

export const Login = () => {
    const navigate = useNavigate();
    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>Welcome to Our App</h1>
                <button onClick={googleSignIn} className={styles.loginButton}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className={styles.googleIcon}
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

