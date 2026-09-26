"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import StudentAttendancePanel from "@/components/center/StudentAttendancePanel";

export default function CenterStudentAttendancePage() {
  return (
    <ModuleShell
      title="Student attendance"
      subtitle="Daily mark · P / A / L / H"
      backHref="/center/students"
    >
      <StudentAttendancePanel />
    </ModuleShell>
  );
}
