'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import InstructorStudio from './InstructorStudio';
import CreateCourseFlow from './CreateCourseFlow';

function CreateOrEditCourse() {
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [flowData, setFlowData] = useState(null);
    const [isFlowComplete, setIsFlowComplete] = useState(false);

    // Edit mode: when ?id=<courseId> is present, skip the wizard and load the studio directly
    // so the instructor can edit existing course content.
    if (editId) {
        return <InstructorStudio courseId={editId} />;
    }

    // Create mode: run the multi-step intake first, then hand off to the studio.
    if (!isFlowComplete) {
        return <CreateCourseFlow onComplete={(data) => {
            setFlowData(data);
            setIsFlowComplete(true);
        }} />;
    }

    return <InstructorStudio initialData={flowData} />;
}

export default function CreateCourse() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-semibold text-slate-400 animate-pulse">Loading studio...</div>}>
            <CreateOrEditCourse />
        </Suspense>
    );
}
