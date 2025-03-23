"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "@/lib/course-store";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

export function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourse, updateCourseProgress } = useCourseStore();
  const course = getCourse(courseId);

  const [activeSection, setActiveSection] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState(-1);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!course) {
      router.push("/");
    }
  }, [course, router]);

  if (!course) {
    return <div>Loading...</div>;
  }

  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.subsections.length + 1,
    0
  );

  const handleMarkAsDone = () => {
    const currentLessonId =
      activeSubsection === -1
        ? `section-${activeSection}`
        : `section-${activeSection}-subsection-${activeSubsection}`;

    const newCompletedLessons = new Set(completedLessons);

    if (completedLessons.has(currentLessonId)) {
      newCompletedLessons.delete(currentLessonId);
    } else {
      newCompletedLessons.add(currentLessonId);
    }

    setCompletedLessons(newCompletedLessons);

    // Calculate progress percentage
    const progress = Math.round(
      (newCompletedLessons.size / totalLessons) * 100
    );
    updateCourseProgress(courseId, progress);
  };

  const toggleSection = (sectionIndex: number) => {
    const newCollapsedSections = new Set(collapsedSections);
    if (collapsedSections.has(sectionIndex)) {
      newCollapsedSections.delete(sectionIndex);
    } else {
      newCollapsedSections.add(sectionIndex);
    }
    setCollapsedSections(newCollapsedSections);
  };

  const getCurrentLessonContent = () => {
    if (activeSubsection === -1) {
      return {
        title: course.sections[activeSection].title,
        content: course.sections[activeSection].content,
        lessonNumber: getLessonNumber(activeSection, -1),
        totalLessons: course.sections[activeSection].subsections.length + 1,
      };
    } else {
      return {
        title:
          course.sections[activeSection].subsections[activeSubsection].title,
        content:
          course.sections[activeSection].subsections[activeSubsection].content,
        lessonNumber: getLessonNumber(activeSection, activeSubsection),
        totalLessons: course.sections[activeSection].subsections.length + 1,
      };
    }
  };

  const getLessonNumber = (sectionIndex: number, subsectionIndex: number) => {
    if (subsectionIndex === -1) return 1;
    return subsectionIndex + 2; // +2 because we start at 1 and the section itself is lesson 1
  };

  const currentLessonId =
    activeSubsection === -1
      ? `section-${activeSection}`
      : `section-${activeSection}-subsection-${activeSubsection}`;

  const isCurrentLessonCompleted = completedLessons.has(currentLessonId);
  const currentLesson = getCurrentLessonContent();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="border-b">
          <div className="container py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center text-muted-foreground"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Outline
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`border-r flex-shrink-0 transition-all duration-300 ${
              sidebarOpen ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                <h2 className="font-medium">Course Content</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {course.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-b last:border-b-0">
                    <div className="flex items-center">
                      <button
                        className={`flex-1 text-left p-4 hover:bg-muted/50 flex items-center ${
                          activeSection === sectionIndex &&
                          activeSubsection === -1
                            ? "bg-muted"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveSection(sectionIndex);
                          setActiveSubsection(0); // Automatically select the first subsection
                          toggleSection(sectionIndex); // Toggle the section
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mr-3 text-sm">
                          {sectionIndex + 1}
                        </div>
                        <span className="flex-1 font-medium">
                          {section.title}
                        </span>
                        {completedLessons.has(`section-${sectionIndex}`) && (
                          <Check className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </button>
                      <button
                        className="p-4 text-muted-foreground hover:bg-muted/50"
                        onClick={() => {
                          toggleSection(sectionIndex);
                          setActiveSection(sectionIndex);
                          setActiveSubsection(-1);
                        }}
                      >
                        {collapsedSections.has(sectionIndex) ||
                        activeSection !== sectionIndex ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {!collapsedSections.has(sectionIndex) &&
                      activeSection === sectionIndex &&
                      section.subsections.map((subsection, subsectionIndex) => (
                        <button
                          key={subsectionIndex}
                          className={`w-full text-left p-4 pl-16 hover:bg-muted/50 flex items-center ${
                            activeSection === sectionIndex &&
                            activeSubsection === subsectionIndex
                              ? "bg-muted"
                              : ""
                          }`}
                          onClick={() => {
                            setActiveSection(sectionIndex);
                            setActiveSubsection(subsectionIndex);
                          }}
                        >
                          <span className="flex-1">{subsection.title}</span>
                          {completedLessons.has(
                            `section-${sectionIndex}-subsection-${subsectionIndex}`
                          ) && <Check className="h-4 w-4 text-green-500" />}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle sidebar button */}
          <button
            className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-1 rounded-r-md shadow-md z-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Lesson {currentLesson.lessonNumber} of{" "}
                {currentLesson.totalLessons}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isCurrentLessonCompleted ? "outline" : "default"}
                  size="sm"
                  className={
                    isCurrentLessonCompleted
                      ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"
                      : ""
                  }
                  onClick={handleMarkAsDone}
                >
                  {isCurrentLessonCompleted ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Marked as Done
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>

              <div className="prose max-w-none">
                {currentLesson.content ? (
                  currentLesson.content
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))
                ) : (
                  <p>No content available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
