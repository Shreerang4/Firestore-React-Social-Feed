import React from 'react'
import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import { addDoc, collection } from 'firebase/firestore'
import { db, auth } from '../config/firebase.js'
import { useAuthState } from 'react-firebase-hooks/auth'
import styles from '../styles/CreateForm.module.css'

const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required")
})

export const CreateForm = () => {
    const [user] = useAuthState(auth);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema)
    });

    const onFormSubmit = async (data) => {
        try {
            await addDoc(postsRef, {
                title: data.title,
                description: data.description,
                username: user?.displayName,
                userID: user?.uid,
                timestamp: new Date().toISOString()
            });
            reset(); // Clear the form after successful submission
        } catch (error) {
            console.error("Error creating post:", error);
        }
    }
    const postsRef = collection(db, "Posts");

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
                <input
                    {...register("title")}
                    placeholder='Title'
                    className={styles.input}
                />
                {errors.title && <p className={styles.error}>{errors.title.message}</p>}
            </div>
            <div className={styles.inputGroup}>
                <input
                    {...register("description")}
                    placeholder='Description'
                    className={styles.input}
                />
                {errors.description && <p className={styles.error}>{errors.description.message}</p>}
            </div>
            <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
    )
}

