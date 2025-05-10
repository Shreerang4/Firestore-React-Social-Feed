import React, { useEffect, useState } from 'react'
import { auth } from '../config/firebase'
import { useAuthState } from "react-firebase-hooks/auth"
import { db } from '../config/firebase'
import styles from '../styles/Home.module.css'
import { getDocs, collection, query, orderBy, addDoc, where, deleteDoc, doc } from 'firebase/firestore'

export const Home = () => {
    const [user, loading] = useAuthState(auth);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [likes, setLikes] = useState({}); // { postId: { count: number, likedByUser: boolean, likeDocId: string|null } }

    useEffect(() => {
        const fetchPostsAndLikes = async () => {
            if (user) {
                try {
                    const postsRef = collection(db, "Posts");
                    const q = query(postsRef, orderBy("timestamp", "desc"));
                    const querySnapshot = await getDocs(q);
                    const postsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setPosts(postsData);

                    // Fetch likes for all posts
                    const likesRef = collection(db, "Likes");
                    const likesSnapshot = await getDocs(likesRef);
                    const likesData = {};
                    likesSnapshot.docs.forEach(likeDoc => {
                        const { postID, userID } = likeDoc.data();
                        if (!likesData[postID]) {
                            likesData[postID] = { count: 0, likedByUser: false, likeDocId: null };
                        }
                        likesData[postID].count++;
                        if (userID === user.uid) {
                            likesData[postID].likedByUser = true;
                            likesData[postID].likeDocId = likeDoc.id;
                        }
                    });
                    setLikes(likesData);
                } catch (error) {
                    console.error("Error fetching posts or likes:", error);
                }
            }
            setIsLoading(false);
        };
        fetchPostsAndLikes();
    }, [user]);

    const handleLike = async (postId) => {
        if (!user) return;
        try {
            if (likes[postId]?.likedByUser) {
                // Query for the like document to delete
                const likesRef = collection(db, "Likes");
                const q = query(likesRef, where("postID", "==", postId), where("userID", "==", user.uid));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async (docu) => {
                    await deleteDoc(doc(db, "Likes", docu.id));
                });
            } else {
                await addDoc(collection(db, "Likes"), {
                    postID: postId,
                    userID: user.uid
                });
            }
            // Refresh likes
            const likesRef = collection(db, "Likes");
            const likesSnapshot = await getDocs(likesRef);
            const likesData = {};
            likesSnapshot.docs.forEach(likeDoc => {
                const { postID, userID } = likeDoc.data();
                if (!likesData[postID]) {
                    likesData[postID] = { count: 0, likedByUser: false, likeDocId: null };
                }
                likesData[postID].count++;
                if (userID === user.uid) {
                    likesData[postID].likedByUser = true;
                    likesData[postID].likeDocId = likeDoc.id;
                }
            });
            setLikes(likesData);
        } catch (error) {
            console.error("Error liking/unliking post:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!user) return;
        try {
            // Delete the post
            await deleteDoc(doc(db, "Posts", postId));
            // Delete all likes for this post
            const likesRef = collection(db, "Likes");
            const q = query(likesRef, where("postID", "==", postId));
            const querySnapshot = await getDocs(q);
            const batchDeletes = querySnapshot.docs.map(likeDoc => deleteDoc(doc(db, "Likes", likeDoc.id)));
            await Promise.all(batchDeletes);
            // Refresh posts and likes
            const postsRef = collection(db, "Posts");
            const postsQ = query(postsRef, orderBy("timestamp", "desc"));
            const postsSnapshot = await getDocs(postsQ);
            const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            const likesSnapshot = await getDocs(likesRef);
            const likesData = {};
            likesSnapshot.docs.forEach(likeDoc => {
                const { postID, userID } = likeDoc.data();
                if (!likesData[postID]) {
                    likesData[postID] = { count: 0, likedByUser: false, likeDocId: null };
                }
                likesData[postID].count++;
                if (userID === user.uid) {
                    likesData[postID].likedByUser = true;
                    likesData[postID].likeDocId = likeDoc.id;
                }
            });
            setLikes(likesData);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    if (loading || isLoading) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            {user ? (
                <>
                    <div className={styles.welcomeContainer}>
                        <h1 className={styles.welcomeTitle}>Welcome Back, {user.displayName}</h1>
                        {user.photoURL && (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className={styles.profileImage}
                            />
                        )}
                    </div>
                    <div className={styles.postsContainer}>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className={styles.postCard}>
                                    <h2 className={styles.postTitle}>{post.title}</h2>
                                    <p className={styles.postDescription}>{post.description}</p>
                                    <div className={styles.postMeta}>
                                        <span className={styles.postAuthor}>Posted by: {post.username}</span>
                                        {user && post.userID === user.uid && (
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeletePost(post.id)}
                                                aria-label="Delete Post"
                                                title="Delete Post"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#e25555" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 3h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2z" /></svg>
                                            </button>
                                        )}
                                        <button
                                            className={styles.likeButton}
                                            onClick={() => handleLike(post.id)}
                                            aria-label={likes[post.id]?.likedByUser ? "Unlike" : "Like"}
                                        >
                                            <span className={styles.heartIcon} style={{ color: likes[post.id]?.likedByUser ? '#007bff' : '#bbb' }}>
                                                {likes[post.id]?.likedByUser ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#007bff" viewBox="0 0 24 24"><path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.01l-.01-.01L23 10z" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#bbb" viewBox="0 0 24 24"><path d="M2 21h4V9H2v12zM22 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.01l-.01-.01L22 10zm-2.16 8.41c-.14.34-.48.59-.84.59h-9c-.55 0-1-.45-1-1v-9c0-.28.11-.53.29-.71l6.59-6.59c.09-.09.22-.15.35-.15.28 0 .5.22.5.5v.17l-1.03 4.97c-.09.44.02.89.29 1.23.27.34.68.54 1.11.54H20c.55 0 1 .45 1 1v1.01c0 .13-.03.26-.08.38l-3.02 7.05z" /></svg>
                                                )}
                                            </span>
                                            <span className={styles.likeCount}>{likes[post.id]?.count || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noPosts}>No posts yet. Be the first to create one!</p>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.welcomeContainer}>
                    <h1 className={styles.loginMessage}>Please login to continue</h1>
                </div>
            )}
        </div>
    )
}


