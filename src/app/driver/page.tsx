import * as React from 'react';
import { redirect } from 'next/navigation';

export default function DriverRedirectPage() {
  redirect('/driver/active-route');
  return null;
}
