import * as React from 'react';
import { redirect } from 'next/navigation';

export default function StudentViewRedirectPage() {
    // This page is now located at /student/assistant
    redirect('/student/assistant');
    return null;
}
