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
      "parameter": "'U'n'i'v'e'r's'i't'y' 'E'x'a'm' ' '-' 'P'a's's' 'p'e'r'c'e'n't'a'g'e' 'p'r'o'd'u'c'e'd'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '9'0'%' 'e'x'p'e'c't'e'd'.'",
      "max": 20.0
    },
    {
      "no": 2,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' ' 'o'f' '‘'S'’' 'G'r'a'd'e's' ' 'p'r'o'd'u'c'e'd' 'i'n' 't'h'e'i'r' 's'u'b'j'e'c't'",
      "remarks": "'M'i'n'i'm'u'm' ' '1'0'%' 'o'f' 't'h'e' 's't'u'd'e'n't's' 'a'r'e' 'm'a'n'd'a't'o'r'y' 'i'n' 'a' 's'u'b'j'e'c't'.'",
      "max": 25.0
    },
    {
      "no": 3,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'B'l'e'n'd'e'd' 'L'e'a'r'n'i'n'g' 'a'p'p'r'o'a'c'h' 'p'r'a'c't'i'c'e'd'\n'('D'o'c'u'm'e'n't'a'r'y' ' 'e'v'i'd'e'n'c'e' 't'o' 'b'e' 's'u'b'm'i't't'e'd')'",
      "remarks": "'G'o'o'g'l'e' 'C'l'a's's'r'o'o'm'\n'R'o'l'e' 'p'l'a'y'\n'G'r'o'u'p' 'D'i's'c'u's's'i'o'n'\n'Q'u'i'z'\n'C'h'a'r't' 'P'r'e's'e'n't'a't'i'o'n'\n'H'o't' 's'e'a't'\n'A'n'y' 'o't'h'e'r's'-'S'p'e'c'i'f'y'",
      "max": 15.0
    },
    {
      "no": 4,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "(PA-  1.2)",
      "parameter": "'N'o'.' 'o'f' 'a's's'i'g'n'm'e'n't's' 'g'i'v'e'n' 't'o' 'm'a'k'e' 't'h'e' 's't'u'd'e'n't's' 't'o' 't'h'i'n'k' 'a'n'd' 'a'n'a'l'y's'e' '('m'e'n't'i'o'n' 't'h'e' 't'o'p'i'c's')'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' 'p'e'r' 's'u'b'j'e'c't' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 10.0
    },
    {
      "no": 5,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 'S'p'e'c'i'a'l' 'L'e'c't'u'r'e's' 'd'e'l'i'v'e'r'e'd' ' 'a'n'd' 'T'o'p'i'c's' 'o'f' 't'h'e' 'l'e'c't'u'r'e'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' 'p'e'r' 's'u'b'j'e'c't' 'a'r'e' ' 'e'x'p'e'c't'e'd'.'",
      "max": 15.0
    },
    {
      "no": 6,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 'I'n'd'u's't'r'i'a'l' ' 'v'i's'i't' 'a'r'r'a'n'g'e'd' ' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e'i'r' 's'u'b'j'e'c't'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'i's' 'm'a'n'd'a't'o'r'y'.'",
      "max": 5.0
    },
    {
      "no": 7,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 'G'u'e's't'/'E'x'p'e'r't' 'L'e'c't'u'r'e's' ' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e'i'r' 's'u'b'j'e'c't' ' 'o'r' 'd'o'm'a'i'n's' ' 'c'o'n'd'u'c't'e'd'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'a'r'e' ' 'e'x'p'e'c't'e'd'.'",
      "max": 5.0
    },
    {
      "no": 8,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'E'-'C'o'n't'e'n't' 'o'r' 'V'i'd'e'o' 'L'e'c't'u'r'e's' 'd'e'v'e'l'o'p'e'd' ' 'a'n'd' ' 'h'o's't'e'd' 'i'n' 'i'n's't'i't'u't'e' 'w'e'b's'i't'e'/'Y'o'u'T'u'b'e'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' 'p'e'r' 'f'a'c'u'l't'y' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 15.0
    },
    {
      "no": 9,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 'm'i'n'i' 'p'r'o'j'e'c't's' 'g'u'i'd'e'd' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e' ' 's'u'b'j'e'c't's' 'h'a'n'd'l'e'd' ' 'b'y' 't'h'e' 'f'a'c'u'l't'y'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '3' ' 'p'e'r' 'f'a'c'u'l't'y' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 20.0
    },
    {
      "no": 10,
      "sectionId": "sec_1",
      "sectionIndex": 0,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 'F'i'n'a'l' 'y'e'a'r' 'P'r'o'j'e'c't's' 'w'i't'h' 'i'n'n'o'v'a't'i'o'n' 'g'u'i'd'e'd' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e'i'r' 'd'o'm'a'i'n'.'",
      "remarks": "'M'i'n'i'm'u'm' '2' ' 'p'e'r' 'f'a'c'u'l't'y' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 20.0
    },
    {
      "no": 11,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "(PA-  1.2",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'I'n't'e'r'n'a'l' 'w'o'r'k's'h'o'p's' ' 'c'o'n'd'u'c't'e'd' ' 'w'i't'h' 'd'e't'a'i'l's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'S'p'l'.' 'g'r'o'u'p' 'f'o'r' 'a' 'c'l'a's's' 'i's' 'm'a'n'd'a't'o'r'y'.' 'I'n'd'i'v'i'd'u'a'l' 'f'a'c'u'l't'y' 't'a'k'e'n' 'm'o'r'e' 'e'f'f'o'r't's' ' 'w'i'l'l' 'g'e't' 'm'a'x'.' 'c'r'e'd'i't'.'",
      "max": 10.0
    },
    {
      "no": 12,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'w'o'r'k's'h'o'p's' ' 'b'y' 'E'x't'e'r'n'a'l' 'E'x'p'e'r't's' 'c'o'o'r'd'i'n'a't'e'd' 'w'i't'h' 'd'e't'a'i'l's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'S'p'l'.' 'g'r'o'u'p' 'f'o'r' 'a' 'c'l'a's's' 'i's' 'm'a'n'd'a't'o'r'y'.' 'I'n'd'i'v'i'd'u'a'l' 'f'a'c'u'l't'y' 't'a'k'e'n' 'm'o'r'e' 'e'f'f'o'r't' 'w'i'l'l' 'g'e't' 'm'a'x'.' 'c'r'e'd'i't'.'",
      "max": 10.0
    },
    {
      "no": 13,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' ' 'O'n'l'i'n'e' 'c'o'u'r's'e's'/'C'e'r't'i'f'i'c'a't'i'o'n' 'c'o'u'r's'e's' ' 'r'e'l'a't'e'd' 't'o' ' 't'h'e'i'r' 'd'o'm'a'i'n' 'f'a'c'i'l'i't'a't'e'd' ' 'f'o'r' 't'h'e' 's't'u'd'e'n't's' 'w'i't'h' 'd'e't'a'i'l's'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'i's' 'm'a'n'd'a't'o'r'y'.'",
      "max": 10.0
    },
    {
      "no": 14,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' ' 's't'u'd'e'n't's' ' 'g'u'i'd'e'd' 'f'o'r' 'p'a'r't'i'c'i'p'a't'i'o'n' '/' 'a'c'h'i'e'v'e'm'e'n't's' ' 'i'n' ' 't'e'c'h'n'i'c'a'l' 'c'o'm'p'e't'i't'i'o'n's' '('o'r')' ' 'N'o'.' 'o'f' 'c'o'm'p'e't'i't'i'o'n's' 'i'n' 'w'h'i'c'h' 'y'o'u' 'a'r'e' 'g'o'i'n'g' 't'o' 'b'e' 'i'n'v'o'l'v'e'd' 'i'n' 'p'r'o'v'i'd'i'n'g' 'g'u'i'd'a'n'c'e' 't'o' 't'h'e' 's't'u'd'e'n't's'.' '('n'o't' 'l'i'm'i't'e'd' 't'o' 'S'y'm'p'o's'i'u'm' 'o'n'l'y')'",
      "remarks": "'M'i'n'i'm'u'm' ' '5' ' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'a'r'e' ' 'e'x'p'e'c't'e'd'.'",
      "max": 20.0
    },
    {
      "no": 15,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'u'm'b'e'r' ' 'a'n'd' 'd'e't'a'i'l's' 'o'f' ' 'P'l'a'c'e'm'e'n't' 'r'e'l'a't'e'd' 'a'c't'i'v'i't'i'e's'/'d'r'e'a'm's' 'r'e'l'a't'e'd' '/' 'p'l'a'c'e'm'e'n't' 'a's's'i's't'a'n'c'e',' ' ' ' 'i'n' 'w'h'i'c'h' 'f'a'c'u'l't'y' 'i'n'v'o'l'v'e'd' 'f'o'r' 'm'a'k'i'n'g' 't'h'e' 's't'u'd'e'n't's' 'g'e't't'i'n'g' ' 'P'l'a'c'e'm'e'n't's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 20.0
    },
    {
      "no": 16,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'o'.' 'o'f' ' 'I'n'd'u's't'r'i'e's' 'c'o'o'r'd'i'n'a't'e'd' ' 'f'o'r' 'a'r'r'a'n'g'i'n'g' 'i'n'-'p'l'a'n't' 't'r'a'i'n'i'n'g' 'a'n'd' ' 'I'n'd'u's't'r'y' 'P'r'o'j'e'c't's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'a'r'e' ' 'm'a'n'd'a't'o'r'y'.'",
      "max": 10.0
    },
    {
      "no": 17,
      "sectionId": "sec_2",
      "sectionIndex": 1,
      "code": "",
      "parameter": "'N'o'.' 'o'f' 's't'u'd'e'n't's' 'm'e'n't'o'r'i'n'g' ' 'b'y' 't'h'e' 'f'a'c'u'l't'y' 'a'n'd' 'i't's' 'i'm'p'a'c't'.' '('t'o' 'b'e' 'c'o'm'p'l'e't'e'd' 't'h'e' 'c'o'u'r's'e' 'w'i't'h' 'g'o'o'd' 'C'G'P'A' 'a'n'd' 'g'o'o'd' 'P'l'a'c'e'm'e'n't',' 'E'n't'r'e'p'r'e'n'e'u'r's'h'i'p' ')'",
      "remarks": "'M'i'n'i'm'u'm' ' '1'0' ' 's't'u'd'e'n't's' 'm'e'n't'o'r'i'n'g' ' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'i's' ' 'm'a'n'd'a't'o'r'y'.' 'I'm'p'a'c't' 'o'f' 'm'e'n't'o'r'i'n'g' 't'o' 'b'e' 'v'i's'i'b'l'e'.'",
      "max": 20.0
    },
    {
      "no": 18,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "(PA-  1.3)",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'c'e'r't'i'f'i'c'a't'i'o'n' 't'o' 'b'e' 'c'o'm'p'l'e't'e'd' 'b'y' 't'h'e' 'f'a'c'u'l't'y' ' '('N'P'T'E'L',' 'C'o'u'r's'e'r'a',' 'E'd'x'.',' ' 'U'd'e'm'y' ' 'e't'c'.')'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'i's' 'm'a'n'd'a't'o'r'y'.'",
      "max": 20.0
    },
    {
      "no": 19,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' ' 'c'o'n'f'e'r'e'n'c'e' '/'s'e'm'i'n'a'r's' '/'w'o'r'k's'h'o'p's'/'F'D'P' ' 't'o' 'b'e' 'a't't'e'n'd'e'd' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e'i'r' 'd'o'm'a'i'n' 'w'i't'h' 'd'e't'a'i'l's':'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'i's' ' 'm'a'n'd'a't'o'r'y' '('P'r'e'f'e'r'a'b'l'y' 'o'u't's'i'd'e' 't'h'e' 's't'a't'e' 'i'n' 'r'e'p'u't'e'd' 'i'n's't'i't'u't'i'o'n's')'.'",
      "max": 10.0
    },
    {
      "no": 20,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'I'n'd'u's't'r'i'e's'/' 'r'e'p'u't'e'd' 'a'c'a'd'e'm'i'c' 'i'n's't'i't'u't'i'o'n's' 't'o' 'b'e' 'v'i's'i't'e'd' 't'o' 'd'e'l'i'v'e'r' 't'h'e' 'E'x'p'e'r't' 'l'e'c't'u'r'e' 'o'r' 'c'o'n'd'u'c't'i'n'g' 'w'o'r'k's'h'o'p' 'o'r' 'T'r'a'i'n'i'n'g'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' ' 'p'e'r' 'P'r'o'f' '/' 'A's's'o'.'P'r'o'f' ' ' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 'y'e'a'r'.' 'I't' 's'h'o'u'l'd' 'i'm'p'r'o'v'e' 't'h'e' 'p'e'r'c'e'p't'i'o'n' 's'c'o'r'e' 'o'f' 'o'u'r' 'c'o'l'l'e'g'e'.'",
      "max": 10.0
    },
    {
      "no": 21,
      "sectionId": "sec_3",
      "sectionIndex": 2,
      "code": "",
      "parameter": "'F'a'c'u'l't'y' 'a'w'a'r'd's' 'f'o'r' 'y'o'u'r' 'd'i's't'i'n'c't'i'v'e' 'c'o'n't'r'i'b'u't'i'o'n'.'",
      "remarks": "'",
      "max": 10.0
    },
    {
      "no": 22,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  2.1)",
      "parameter": "'N'u'm'b'e'r' ' 'o'f' ' 'P'u'b'l'i'c'a't'i'o'n's' ' 'r'e'l'a't'e'd' 't'o' 't'h'e' 'S't'u'd'e'n't's' 'p'r'o'j'e'c't's' 'g'u'i'd'e'd' ' 'a'n'd' 'a'p'p'l'i'e'd' ' 'f'o'r' 'j'o'u'r'n'a'l's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' ' 'p'e'r' 'P'r'o'f'/'A's's'o'.'P'r'o'f' ' ' 'a'n'd' ' '1' 'p'e'r' 'f'a'c'u'l't'y' 'i's' 'm'a'n'd'a't'o'r'y' 'i'n' 'a' 's'e'm'e's't'e'r'.'",
      "max": 10.0
    },
    {
      "no": 23,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  2.2)",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'p'r'o'p'o's'a'l's' 's'u'b'm'i't't'e'd' 'f'o'r' 's'e'm'i'n'a'r'/'F'D'P' 'g'r'a'n't'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' ' 'p'e'r' 'P'r'o'f'/'A's's'o'.'P'r'o'f' ' ' 'a'n'd' 'f'r'o'm' 'e'a'c'h' 'F'S'G' 'a'r'e' ' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'e's't'e'r'.'\n'P'r'o'p'o's'a'l's' 'a'p'p'r'o'v'e'd' 'w'i'l'l' 'g'e't' 'm'a'x' 'c'r'e'd'i't'.'",
      "max": 10.0
    },
    {
      "no": 24,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'p'r'o'p'o's'a'l's' 's'u'b'm'i't't'e'd' 'f'o'r' 'r'e's'e'a'r'c'h' 'f'u'n'd'i'n'g' 'w'i't'h' 'd'e't'a'i'l's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' ' 'p'e'r' 'P'r'o'f'/'A's's'o'.'P'r'o'f' ' ' 'a'n'd' 'f'r'o'm' 'e'a'c'h' 'F'S'G' 'a'r'e' ' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'e's't'e'r'.'\n'P'r'o'p'o's'a'l's' 'a'p'p'r'o'v'e'd' 'w'i'l'l' 'g'e't' 'm'a'x' 'c'r'e'd'i't'.'",
      "max": 15.0
    },
    {
      "no": 25,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  2.2)",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'C'o'n's'u'l't'a'n'c'y' 'i'n'i't'i'a't'i'v'e's' 't'a'k'e'n' 'b'y' 't'h'e' 'f'a'c'u'l't'y'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' ' 'p'e'r' 'P'r'o'f'/'A's's'o'.'P'r'o'f' ' ' 'a'n'd' 'f'r'o'm' 'e'a'c'h' 'F'S'G' 'a'r'e' ' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'e's't'e'r'.'\n'C'o'n's'u'l't'a'n'c'y' 'p'o'l'i'c'y' 'w'i'l'l' 'b'e' 'f'o'l'l'o'w'e'd' 'f'o'r' 'r'e'v'e'n'u'e' 's'h'a'r'i'n'g'.'",
      "max": 15.0
    },
    {
      "no": 26,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  2.3)",
      "parameter": "'N'u'm'b'e'r' ' 'o'f' ' 'P'u'b'l'i'c'a't'i'o'n's' ' 'r'e'l'a't'e'd' 'w'i't'h' 't'h'e'i'r' 'd'o'm'a'i'n' ' 'a'p'p'l'i'e'd' ' 'f'o'r' ' 'r'e'f'e'r'r'e'd'/'i'n'd'e'x'e'd' ' ' 'j'o'u'r'n'a'l's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '2' ' ' 'p'e'r' 'P'r'o'f'/'A's's'o'.'P'r'o'f' ' ' 'a'n'd' ' '1' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm'e's't'e'r' 'i's' 'm'a'n'd'a't'o'r'y'.'\n'1's't' 'a'u't'h'o'r' 'w'i'l'l' 'g'e't' '1'0'0'%' 'c'r'e'd'i't',' '2'n'd' ' 'a'u't'h'o'r' 'w'i'l'l' 'g'e't' '5'0'%' 'c'r'e'd'i't'.'",
      "max": 20.0
    },
    {
      "no": 27,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  2.1)",
      "parameter": "'N'o'.' 'o'f' 'i'n'n'o'v'a't'i'v'e' 'p'r'o'j'e'c't's' ' 'c'a'r'r'i'e'd' 'o'u't' 'b'y' 't'h'e' 'f'i'n'a'l' 'y'e'a'r' 's't'u'd'e'n't's' 'a'n'd' 'n'o'.' 'o'f' 'P'a't'e'n't's' 'f'i'l'e'd' 'u'n'd'e'r' 'y'o'u'r' 'g'u'i'd'a'n'c'e'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/' 'F'S'G' ' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'.'",
      "max": 15.0
    },
    {
      "no": 28,
      "sectionId": "sec_4",
      "sectionIndex": 3,
      "code": "(PA-  4.2)",
      "parameter": "'N'o'.' 'o'f' 'E'D'P'/'T'B'I' ' 'r'e'l'a't'e'd' 'i'n'i't'i'a't'i'v'e's' 't'a'k'e'n' 'b'y' 't'h'e' 'f'a'c'u'l't'y' 'a'n'd' 's'u'p'p'o'r't' 'f'o'r' 'S't'a'r't' 'u'p's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'D'e'p't'.' 'i's' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 's'e'm'.' 'H'o'D' 'i's' 'r'e's'p'o'n's'i'b'l'e' 'f'o'r' 'i't'.'",
      "max": 15.0
    },
    {
      "no": 29,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "(PA-  3.1)",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'v'a'l'u'e' 'a'd'd'e'd' 'c'o'u'r's'e's'/' 'T'r'a'i'n'i'n'g' ' 'c'o'o'r'd'i'n'a't'e'd' 'w'i't'h' 'd'e't'a'i'l's'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' ' 'p'e'r' 'P'r'o'f' '/' 'A's's'o'.'P'r'o'f' ' ' 'i's' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 'y'e'a'r'.'",
      "max": 15.0
    },
    {
      "no": 30,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "'I'n'd'u's't'r'y' ' 't'i'e' 'u'p'-' 'i'n'i't'i'a't'i'v'e's' ' 't'a'k'e'n' 'b'y' 't'h'e' 'f'a'c'u'l't'y' ' '('M'o'U's' 'a'n'd' 'o't'h'e'r' 'a'c't'i'v'i't'i'e's')':'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '5' 'y'r's'.' 'E'x'p'e'r'i'e'n'c'e' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'.'",
      "max": 15.0
    },
    {
      "no": 31,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'a'c't'i'v'i't'i'e's' 'o'u't' 'o'f' 'M'o'U' ' 'c'o'o'r'd'i'n'a't'e'd' 'a'n'd' 'i't's' 'd'e't'a'i'l's'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '5' 'y'r's'.' 'E'x'p'e'r'i'e'n'c'e' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'.'",
      "max": 20.0
    },
    {
      "no": 32,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'a'c't'i'v'i't'i'e's' 'f'r'o'm' 'P'r'o'f'e's's'i'o'n'a'l' 's'o'c'i'e't'y' 'c'o'o'r'd'i'n'a't'e'd'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '5' 'y'r's'.' 'E'x'p'e'r'i'e'n'c'e' 'a'r'e' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 's'e'm'.' 'I't' 's'h'o'u'l'd' 'i'm'p'r'o'v'e' 't'h'e' 'p'e'r'c'e'p't'i'o'n' 's'c'o'r'e' 'o'f' 'o'u'r' 'i'n's't'i't'u't'i'o'n'",
      "max": 15.0
    },
    {
      "no": 33,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "'N'u'm'b'e'r' 'o'f' 'C'o'r'e' 'I'n'd'u's't'r'i'e's' 'a'r'r'a'n'g'e'd' 'f'o'r' 'P'l'a'c'e'm'e'n't' 'w'i't'h' 'y'o'u'r' 'i'n'i't'i'a't'i'v'e's' '.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/' 'F'S'G' ' 'a'r'e' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 's'e'm'.'",
      "max": 20.0
    },
    {
      "no": 34,
      "sectionId": "sec_5",
      "sectionIndex": 4,
      "code": "",
      "parameter": "'A'n'y' 'i'n'n'o'v'a't'i'o'n's'/'i'n'n'o'v'a't'i'v'e' 'm'e't'h'o'd's' ' 'f'o'l'l'o'w'e'd' 'i'n' 't'h'e' 'd'e'p'a'r't'm'e'n't' 'r'e'l'a't'e'd' 't'o' 'y'o'u'r' 'a's's'i'g'n'e'd' 'r'e's'p'o'n's'i'b'i'l'i't'i'e's'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' 'f'a'c'u'l't'y' 'i'n' 'a' 's'e'm' ' 'i's' 'e'x'p'e'c't'e'd'.'",
      "max": 15.0
    },
    {
      "no": 35,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "(PA-  4.1)",
      "parameter": "'I'n's't'i't'u't'i'o'n' 'l'e'v'e'l' 'a'c't'i'v'i't'i'e's' 'c'o'o'r'd'i'n'a't'e'd'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/' 'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '1'0' 'y'e'a'r's' 'o'f' 'E'x'p'e'r'i'e'n'c'e' ' ' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'.' 'I't' 's'h'o'u'l'd' 'i'm'p'r'o'v'e' 't'h'e' 'p'e'r'c'e'p't'i'o'n' 's'c'o'r'e' 'o'f' 'o'u'r' 'i'n's't'i't'u't'i'o'n'",
      "max": 20.0
    },
    {
      "no": 36,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "'I'n'v'o'l'v'e'm'e'n't' 'i'n' 'P'r'o'm'o't'i'o'n'a'l' 'a'c't'i'v'i't'i'e's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/' 'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '5' ' 'y'e'a'r's' 'o'f' 'E'x'p'e'r'i'e'n'c'e' ' ' 'i's' 'm'a'n'd'a't'o'r'y' ' 'i'n' 'a' 's'e'm'.' 'I't' 's'h'o'u'l'd' 'i'm'p'r'o'v'e' 't'h'e' 'p'e'r'c'e'p't'i'o'n' 's'c'o'r'e' 'o'f' 'o'u'r' 'i'n's't'i't'u't'i'o'n'",
      "max": 20.0
    },
    {
      "no": 37,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "'I'n'v'o'l'v'e'm'e'n't' 'i'n' 'a'd'm'i's's'i'o'n' 'r'e'l'a't'e'd' 'a'c't'i'v'i't'i'e's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f'/' 'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '5' ' 'y'e'a'r's' 'o'f' 'E'x'p'e'r'i'e'n'c'e' ' ' 'a'r'e' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 's'e'm'.'",
      "max": 20.0
    },
    {
      "no": 38,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "(PA-  4.3)",
      "parameter": "'I'n'v'o'l'v'e'm'e'n't' 'i'n' 'f'r'a'm'i'n'g' 'o'f' 'v'a'r'i'o'u's' 'p'o'l'i'c'i'e's',' 'p'r'o'c'e'd'u'r'e's' 'a'n'd' 'o't'h'e'r' 's'i'g'n'i'f'i'c'a'n't' 'c'o'n't'r'i'b'u't'i'o'n's'.'",
      "remarks": "'M'i'n'i'm'u'm' ' '1' ' 'p'e'r' ' 'P'r'o'f'.'/' 'A's's'o'.'P'r'o'f' '/' 'f'a'c'u'l't'y' 'w'i't'h' 'm'o'r'e' 't'h'a'n' '1'0' ' 'y'e'a'r's' 'o'f' 'E'x'p'e'r'i'e'n'c'e' ' ' 'a'r'e' ' 'e'x'p'e'c't'e'd' 'i'n' 'a' 's'e'm'.'",
      "max": 20.0
    },
    {
      "no": 39,
      "sectionId": "sec_6",
      "sectionIndex": 5,
      "code": "",
      "parameter": "'I'n'v'o'l'v'e'm'e'n't' 'i'n' 's'o'c'i'a'l' 'a'c't'i'v'i't'i'e's','\n'i'n'i't'i'a't'i'v'e's' 'a'n'd' 's'u'p'p'o'r't' 'f'o'r' 's'c'h'o'o'l' 'a'c't'i'v'i't'i'e's'",
      "remarks": "'",
      "max": 20.0
    }
  ]
};
});
