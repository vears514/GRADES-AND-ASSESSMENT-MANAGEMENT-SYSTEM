'use client';

import React, { useRef, useEffect, useState } from 'react';
import curriculumData from '@/data/curriculumData';

interface GradeColor {
  [key: string]: string;
}

const gradeColors: GradeColor = {
  'A': 'bg-green-100 text-green-800 border-green-300',
  'A-': 'bg-green-50 text-green-700 border-green-200',
  'B+': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'B': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'C': 'bg-orange-100 text-orange-800 border-orange-300',
};

const getGradeColor = (grade?: string) => {
  if (!grade) return 'bg-gray-100 text-gray-600 border-gray-200';
  return gradeColors[grade] || 'bg-gray-100 text-gray-600 border-gray-200';
};

export default function CurriculumViewer() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  // Load html2pdf only on client side
  useEffect(() => {
    import('html2pdf.js').then((module) => {
      setHtml2pdf(() => module.default);
    });
  }, []);

  const calculateGPA = (semester: any) => {
    const totalPoints = semester.subjects.reduce((sum: number, subject: any) => {
      return sum + ((subject.gradePoint || 0) * subject.units);
    }, 0);
    return (totalPoints / semester.totalUnits).toFixed(2);
  };

  const downloadPDF = () => {
    if (!contentRef.current || !html2pdf) return;

    const element = contentRef.current;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `BSCS_Curriculum_Grades_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const }
    };

    try {
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Download Button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                BSCS Curriculum & Grade Viewer
              </h1>
              <p className="text-gray-600 text-lg">
                Bachelor of Science in Computer Science
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total Units Required: {curriculumData.totalUnitsRequired}
              </p>
            </div>
            <button
              onClick={downloadPDF}
              disabled={!html2pdf}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Content Wrapper for PDF Export */}
        <div ref={contentRef}>
          <div className="space-y-8">
            {[1, 2, 3].map((year) => (
              <div key={year} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Year Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">
                    Year {year}
                  </h2>
                </div>

                {/* Semesters for this year */}
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {curriculumData.semesters
                    .filter((sem) => sem.year === year)
                    .map((semester) => (
                      <div key={`${year}-${semester.semester}`} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Semester Header */}
                        <div className="bg-indigo-100 border-b border-indigo-200 px-4 py-3">
                          <h3 className="text-lg font-semibold text-indigo-900">
                            Semester {semester.semester}
                          </h3>
                        </div>

                        {/* Subjects Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Units</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semester.subjects.map((subject, idx) => (
                                <tr
                                  key={idx}
                                  className={`border-b border-gray-100 ${
                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  } hover:bg-indigo-50 transition-colors`}
                                >
                                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                                    {subject.code}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 text-xs sm:text-sm">
                                    {subject.description}
                                  </td>
                                  <td className="px-4 py-3 text-center font-semibold text-gray-800">
                                    {subject.units}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full font-semibold border ${getGradeColor(subject.grade)}`}
                                    >
                                      {subject.grade || '—'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Semester Summary */}
                        <div className="bg-indigo-50 border-t border-indigo-200 px-4 py-4 space-y-2">
                          <div className="flex justify-between font-semibold text-gray-800">
                            <span>Total Units:</span>
                            <span className="text-indigo-600">
                              {semester.totalUnits} units
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-gray-800">
                            <span>Semester GPA:</span>
                            <span className="text-indigo-600">
                              {calculateGPA(semester)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Program Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Total Units Completed</p>
                <p className="text-3xl font-bold">
                  {curriculumData.semesters.reduce((sum, sem) => sum + sem.totalUnits, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm mb-1">Total Subjects</p>
                <p className="text-3xl font-bold">
                  {curriculumData.semesters.reduce((sum, sem) => sum + sem.subjects.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm mb-1">Overall GPA</p>
                <p className="text-3xl font-bold">
                  {(
                    curriculumData.semesters.reduce((sum, sem) => {
                      const semGPA = parseFloat(calculateGPA(sem));
                      return sum + semGPA;
                    }, 0) / curriculumData.semesters.length
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Grade Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(gradeColors).map(([grade, color]) => (
              <div key={grade} className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full font-semibold border ${color}`}>
                  {grade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            Last Updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
