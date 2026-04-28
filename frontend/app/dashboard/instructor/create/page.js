'use client';
import { useState } from 'react';
import InstructorStudio from './InstructorStudio';
import CreateCourseFlow from './CreateCourseFlow';

export default function CreateCourse() {
    const [flowData, setFlowData] = useState(null);
    const [isFlowComplete, setIsFlowComplete] = useState(false);

    if (!isFlowComplete) {
        return <CreateCourseFlow onComplete={(data) => {
            setFlowData(data);
            setIsFlowComplete(true);
        }} />;
    }

    return <InstructorStudio initialData={flowData} />;
}
