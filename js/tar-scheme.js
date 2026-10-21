/**
 * Faculty Target Achievement Report (TAR) 2024-25 Scheme Definition
 * Six sections, 39 parameters, 600 marks total.
 * UMD wrapper for both Node.js tests and browser runtime.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.TarScheme = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
  "schemeVersion": "2024-25",
  "title": "Faculty Target Achievement Report during 2024-25 with Marks assigned for each parameter",
  "totalMarks": 600,
  "sections": [
    {
      "id": "sec_1",
      "title": "I. Academic contribution",
      "shortTitle": "Academic Contribution",
      "max": 150
    },
    {
      "id": "sec_2",
      "title": "II. Students centric",
      "shortTitle": "Students Centric",
      "max": 100
    },
    {
      "id": "sec_3",
      "title": "III. Faculty self development",
      "shortTitle": "Faculty Self Development",
      "max": 50
    },
    {
      "id": "sec_4",
      "title": "IV. Research and development",
      "shortTitle": "Research & Development",
      "max": 100
    },
    {
      "id": "sec_5",
      "title": "V. Department centric",
      "shortTitle": "Department Centric",
      "max": 100
    },
    {
      "id": "sec_6",
      "title": "VI. Institution centric",
      "shortTitle": "Institution Centric",
      "max": 100
    }
  ],
  "parameters": [
    {
      "no": 1,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "University Exam - Pass percentage produced.",
      "remarks": "Minimum 90% expected.",
      "max": 20.0
    },
    {
      "no": 2,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of ‘S’ Grades produced in their subject",
      "remarks": "Minimum 10% of the students are mandatory in a subject.",
      "max": 25.0
    },
    {
      "no": 3,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "Blended Learning approach practiced\n(Documentary evidence to be submitted)",
      "remarks": "Google Classroom\nRole play\nGroup Discussion\nQuiz\nChart Presentation\nHot seat\nAny others-Specify",
      "max": 15.0
    },
    {
      "no": 4,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "(PA- 1.2)",
      "parameter": "No. of assignments given to make the students to think and analyse (mention the topics).",
      "remarks": "Minimum 2 per subject are mandatory.",
      "max": 10.0
    },
    {
      "no": 5,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of Special Lectures delivered and Topics of the lecture.",
      "remarks": "Minimum 2 per subject are expected.",
      "max": 15.0
    },
    {
      "no": 6,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of Industrial visit arranged related with their subject.",
      "remarks": "Minimum 1 per faculty is mandatory.",
      "max": 5.0
    },
    {
      "no": 7,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of Guest/Expert Lectures related with their subject or domains conducted.",
      "remarks": "Minimum 1 per faculty are expected.",
      "max": 5.0
    },
    {
      "no": 8,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "E-Content or Video Lectures developed and hosted in institute website/YouTube.",
      "remarks": "Minimum 2 per faculty are mandatory.",
      "max": 15.0
    },
    {
      "no": 9,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of mini projects guided related with the subjects handled by the faculty.",
      "remarks": "Minimum 3 per faculty are mandatory.",
      "max": 20.0
    },
    {
      "no": 10,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "No. of Final year Projects with innovation guided related with their domain.",
      "remarks": "Minimum 2 per faculty are mandatory.",
      "max": 20.0
    },
    {
      "no": 11,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "(PA- 1.2",
      "parameter": "Number of Internal workshops conducted with details.",
      "remarks": "Minimum 1 per faculty Spl. group for a class is mandatory. Individual faculty taken more efforts will get max. credit.",
      "max": 10.0
    },
    {
      "no": 12,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "Number of workshops by External Experts coordinated with details.",
      "remarks": "Minimum 1 per faculty Spl. group for a class is mandatory. Individual faculty taken more effort will get max. credit.",
      "max": 10.0
    },
    {
      "no": 13,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "Number of Online courses/Certification courses related to their domain facilitated for the students with details",
      "remarks": "Minimum 1 per faculty is mandatory.",
      "max": 10.0
    },
    {
      "no": 14,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "Number of students guided for participation / achievements in technical competitions (or) No. of competitions in which you are going to be involved in providing guidance to the students. (not limited to Symposium only)",
      "remarks": "Minimum 5 per faculty in a sem are expected.",
      "max": 20.0
    },
    {
      "no": 15,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "Number and details of Placement related activities/dreams related / placement assistance, in which faculty involved for making the students getting Placements.",
      "remarks": "Minimum 2 per faculty in a sem are mandatory.",
      "max": 20.0
    },
    {
      "no": 16,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "No. of Industries coordinated for arranging in-plant training and Industry Projects.",
      "remarks": "Minimum 2 per faculty in a sem are mandatory.",
      "max": 10.0
    },
    {
      "no": 17,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "No. of students mentoring by the faculty and its impact. (to be completed the course with good CGPA and good Placement, Entrepreneurship )",
      "remarks": "Minimum 10 students mentoring per faculty in a sem is mandatory. Impact of mentoring to be visible.",
      "max": 20.0
    },
    {
      "no": 18,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "(PA- 1.3)",
      "parameter": "Number of certification to be completed by the faculty (NPTEL, Coursera, Edx., Udemy etc.)",
      "remarks": "Minimum 1 per faculty in a sem is mandatory.",
      "max": 20.0
    },
    {
      "no": 19,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "Number of conference /seminars /workshops/FDP to be attended related with their domain with details:",
      "remarks": "Minimum 1 per faculty in a sem is mandatory (Preferably outside the state in reputed institutions).",
      "max": 10.0
    },
    {
      "no": 20,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "Number of Industries/ reputed academic institutions to be visited to deliver the Expert lecture or conducting workshop or Training.",
      "remarks": "Minimum 1 per Prof / Asso.Prof is mandatory in a year. It should improve the perception score of our college.",
      "max": 10.0
    },
    {
      "no": 21,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "Faculty awards for your distinctive contribution.",
      "remarks": "",
      "max": 10.0
    },
    {
      "no": 22,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 2.1)",
      "parameter": "Number of Publications related to the Students projects guided and applied for journals.",
      "remarks": "Minimum 2 per Prof/Asso.Prof and 1 per faculty is mandatory in a semester.",
      "max": 10.0
    },
    {
      "no": 23,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 2.2)",
      "parameter": "Number of proposals submitted for seminar/FDP grant.",
      "remarks": "Minimum 1 per Prof/Asso.Prof and from each FSG are mandatory in a semester.\nProposals approved will get max credit.",
      "max": 10.0
    },
    {
      "no": 24,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "",
      "parameter": "Number of proposals submitted for research funding with details.",
      "remarks": "Minimum 1 per Prof/Asso.Prof and from each FSG are mandatory in a semester.\nProposals approved will get max credit.",
      "max": 15.0
    },
    {
      "no": 25,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 2.2)",
      "parameter": "Number of Consultancy initiatives taken by the faculty.",
      "remarks": "Minimum 1 per Prof/Asso.Prof and from each FSG are mandatory in a semester.\nConsultancy policy will be followed for revenue sharing.",
      "max": 15.0
    },
    {
      "no": 26,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 2.3)",
      "parameter": "Number of Publications related with their domain applied for referred/indexed journals.",
      "remarks": "Minimum 2 per Prof/Asso.Prof and 1 per faculty in a semester is mandatory.\n1st author will get 100% credit, 2nd author will get 50% credit.",
      "max": 20.0
    },
    {
      "no": 27,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 2.1)",
      "parameter": "No. of innovative projects carried out by the final year students and no. of Patents filed under your guidance.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/ FSG is mandatory in a sem.",
      "max": 15.0
    },
    {
      "no": 28,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA- 4.2)",
      "parameter": "No. of EDP/TBI related initiatives taken by the faculty and support for Start ups.",
      "remarks": "Minimum 1 per Dept. is expected in a sem. HoD is responsible for it.",
      "max": 15.0
    },
    {
      "no": 29,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "(PA- 3.1)",
      "parameter": "Number of value added courses/ Training coordinated with details",
      "remarks": "Minimum 1 per Prof / Asso.Prof is expected in a year.",
      "max": 15.0
    },
    {
      "no": 30,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "Industry tie up- initiatives taken by the faculty (MoUs and other activities):",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/faculty with more than 5 yrs. Experience is mandatory in a sem.",
      "max": 15.0
    },
    {
      "no": 31,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "Number of activities out of MoU coordinated and its details",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/faculty with more than 5 yrs. Experience is mandatory in a sem.",
      "max": 20.0
    },
    {
      "no": 32,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "Number of activities from Professional society coordinated.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/faculty with more than 5 yrs. Experience are expected in a sem. It should improve the perception score of our institution",
      "max": 15.0
    },
    {
      "no": 33,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "Number of Core Industries arranged for Placement with your initiatives .",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/ FSG are expected in a sem.",
      "max": 20.0
    },
    {
      "no": 34,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "Any innovations/innovative methods followed in the department related to your assigned responsibilities",
      "remarks": "Minimum 1 per faculty in a sem is expected.",
      "max": 15.0
    },
    {
      "no": 35,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "(PA- 4.1)",
      "parameter": "Institution level activities coordinated.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/ faculty with more than 10 years of Experience is mandatory in a sem. It should improve the perception score of our institution",
      "max": 20.0
    },
    {
      "no": 36,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "Involvement in Promotional activities.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/ faculty with more than 5 years of Experience is mandatory in a sem. It should improve the perception score of our institution",
      "max": 20.0
    },
    {
      "no": 37,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "Involvement in admission related activities.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof/ faculty with more than 5 years of Experience are expected in a sem.",
      "max": 20.0
    },
    {
      "no": 38,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "(PA- 4.3)",
      "parameter": "Involvement in framing of various policies, procedures and other significant contributions.",
      "remarks": "Minimum 1 per Prof./ Asso.Prof / faculty with more than 10 years of Experience are expected in a sem.",
      "max": 20.0
    },
    {
      "no": 39,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "Involvement in social activities,\ninitiatives and support for school activities",
      "remarks": "",
      "max": 20.0
    }
  ]
};
});
