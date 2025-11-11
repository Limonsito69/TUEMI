import * as React from 'react';
import { redirect } from 'next/navigation';

export default function DashboardLayout() {
  redirect('/admin');
  return null;
}
