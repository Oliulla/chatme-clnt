"use client"

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

type FormData = {
  username: string;
  role: string;
  supervisor?: string;
  subordinates?: string[];
};

const subordinatesOptions: any = [
  { value: '66f7c600f0e87949c13c02ae', label: 'John Doe' },
  { value: '66f7c600f0e87949c13c02af', label: 'Jane Smith' },
  { value: '66f7c600f0e87949c13c02ag', label: 'Alice Johnson' },
];

const supervisorOptions: any = [
  { value: '66f7c600f0e87949c13c02bh', label: 'Supervisor 1' },
  { value: '66f7c600f0e87949c13c02bi', label: 'Supervisor 2' },
];

export default function ChatRoom() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  

  const onSubmit = async (data: FormData) => {
    setSubmitError('');

    const payload = {
      username: data.username,
      role: data.role,
      supervisor: data.supervisor || null,
      subordinates: data.subordinates || [],
    };

    try {
      const response = await fetch("http://localhost:4080/v1/auth/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/auth/signin');
      } else {
        const result = await response.json();
        setSubmitError(result.message || 'Error during signup.');
      }
    } catch (error) {
      setSubmitError('Error during signup.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

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

          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700">Role</label>
            <select
              id="role"
              className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select role</option>
              <option value="CM">CM (Customer Manager)</option>
              <option value="MS">MS (Manager Supervisor)</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="supervisor" className="block text-gray-700">Supervisor (Optional)</label>
            <select
              id="supervisor"
              className="w-full p-2 border rounded border-gray-300"
              {...register('supervisor')}
            >
              <option value="">Select Supervisor</option>
              {supervisorOptions.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="subordinates" className="block text-gray-700">Subordinates (Optional)</label>
            <select
              id="subordinates"
              className="w-full p-2 border rounded border-gray-300"
              multiple
              {...register('subordinates')}
            >
              {subordinatesOptions.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <h4 className='mt-3'>Already Have An Account? <Link href="/auth/signin" className='underline text-yellow-500'>Signin</Link></h4>
      </div>
    </div>
  );
}
