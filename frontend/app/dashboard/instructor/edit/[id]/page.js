'use client';
import { useParams } from 'next/navigation';
import InstructorStudio from '../../create/InstructorStudio';

export default function EditCoursePage() {
    const params = useParams();
    const id = params.id;
    
    if (!id) return null;

    return <InstructorStudio courseId={id} />;
}
