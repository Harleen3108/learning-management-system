'use client';
import { use } from 'react';
import InstructorStudio from '../../create/InstructorStudio';

export default function EditCoursePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    
    return <InstructorStudio courseId={id} />;
}
