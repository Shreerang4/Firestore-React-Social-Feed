import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { auth } from './config/firebase'
import { signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import styles from './styles/Navbar.module.css'

export const Navbar = () => {
    const [user, loading] = useAuthState(auth);
    const goBackToLogin = useNavigate();

    const doSignOut = async () => {
        await signOut(auth);
        goBackToLogin("/login");
    }

    if (loading) {
        return null;
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <div className={styles.navLinks}>
                    <Link to="/" className={styles.navLink}>Home</Link>
                    {!user && <Link to="/login" className={styles.navLink}>Login</Link>}
                </div>
                {user && (
                    <button onClick={doSignOut} className={styles.signOutButton}>
                        Sign Out
                    </button>
                )}
                {user && <Link to="/createpost">Create Post</Link>}
            </div>
        </nav>
    )
}

