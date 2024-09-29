"use client";

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  username: string;
};

export default function Signin() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      router.push('/');
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    setSubmitError('');

    try {
      const response = await fetch('http://localhost:4080/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username }),
      });

      if (response.ok) {
        const result = await response.json();
        const { _id, username, supervisor, subordinates, role } = result ?? {};

        localStorage.setItem('userId', _id);
        localStorage.setItem('username', username);
        localStorage.setItem('supervisor', supervisor);
        localStorage.setItem('role', role);

        if (Array.isArray(subordinates)) {
          localStorage.setItem('subordinates', JSON.stringify(subordinates));
        } else {
          localStorage.setItem('subordinates', JSON.stringify([]));
        }

        router.push('/');
      } else {
        const result = await response.json();
        setSubmitError(result.message || 'Error during sign-in.');
      }
    } catch (error) {
      setSubmitError('Error during sign-in.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        {submitError && (
          <div className="text-red-500 text-center mb-4">{submitError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              className={`w-full p-2 border rounded ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>

        <h4 className='mt-3'>Don't Have Account? <Link href="/auth/signup" className='underline text-yellow-500'>Create One</Link></h4>
      </div>
    </div>
  );
}
