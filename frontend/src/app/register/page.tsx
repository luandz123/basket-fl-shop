'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const { registerUser, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      reset();
    } catch (err: unknown) {
      console.error('Registration error:', err);
      alert((err as Error).message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name:</label>
          <input type="text" id="name" className={styles.input} {...register("name", { required: true })} />
          {errors.name && <span className={styles.error}>This field is required</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input type="email" id="email" className={styles.input} {...register("email", { required: true })} />
          {errors.email && <span className={styles.error}>This field is required</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input type="password" id="password" className={styles.input} {...register("password", { required: true })} />
          {errors.password && <span className={styles.error}>This field is required</span>}
        </div>
        <button type="submit" className={styles.button}>Submit</button>
      </form>
    </div>
  );
}