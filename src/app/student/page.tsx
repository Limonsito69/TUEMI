import * as React from 'react';
import { redirect } from 'next/navigation';

export default function StudentRedirectPage() {
  redirect('/student/profile');
  return null;
}
