'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function submitApplication(formData: FormData) {
  // Extract data from the form
  const data = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    mobile_number: '+91' + (formData.get('mobile_number') as string).replace(/\s/g, ''),
    password: formData.get('password') as string,
    college: formData.get('college') as string,
    department: formData.get('department') as string,
    year_of_study: formData.get('year_of_study') as string,
    status: 'pending'
  };

  // Insert directly into the live Supabase Applications table and select it back
  const { data: insertedData, error } = await supabase.from('applications').insert([data]).select();

  if (error) {
    console.error("Supabase insert error:", error.message);
    return { success: false, message: error.message };
  }

  // Refresh the admin dashboard cache so admins see the new application instantly
  revalidatePath('/dashboard/applications');
  
  return { 
    success: true, 
    data: insertedData?.[0],
    message: "Application submitted successfully! Our team will review your profile." 
  };
}
