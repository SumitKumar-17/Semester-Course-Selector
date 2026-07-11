// Department: CS — Semester IX subject allocation
// Each course's "slot" field is the raw code(s) from the allocation sheet, e.g. "B31,B32,B33".
// The leading letter (before the digit) is the real scheduling slot — CS10003 (B31/B32/B33)
// and CS40019 (B31/B32/B33) both live in "Slot B" and clash even though the digit (hours/week) differs.

const COURSES = [
  { code: "CS10003", name: "Programming and Data Structures", faculty: "Saptarshi Ghosh, Satrajit Ghosh, Pawan Goyal, Mainack Mondal", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "NR111,NR112,NR211,NR212" },
  { code: "CS19003", name: "Programming and Data Structures Laboratory", faculty: "Saptarshi Ghosh, Satyabrat Rath, Shamik Sural, Ayan Chaudhury, Chittaranjan Mandal, Jayanta Mukhopadhyay, Monosij Maitra, Partha Pratim Chakrabarti, Sushree Padhan, Soumyajit Dey, Soumya Kanti Ghosh, Utsa Roy, Bidisha Dhara, Pralay Mitra, Ritesh Sarkhel", ltp: "0-0-3", credits: 2, slot: "J,K,L,N,P,X", room: "In PC Lab., In the PC Labs" },
  { code: "CS21201", name: "Discrete Structures", faculty: "Sudeshna Kolay, Animesh Mukherjee", ltp: "3-1-0", credits: 4, slot: "F41,F42,F43,F44", room: "NC122,NC443" },
  { code: "CS21203", name: "Algorithms - I", faculty: "Debasis Samanta, Sudeshna Sarkar, Partha Bhowmick", ltp: "3-1-0", credits: 4, slot: "U41,U42,U43,U44", room: "NC321,NC322,NC323" },
  { code: "CS29203", name: "Algorithms Laboratory", faculty: "Debasis Samanta, Sudeshna Sarkar, Partha Bhowmick", ltp: "0-0-3", credits: 2, slot: "N", room: "" },
  { code: "CS29206", name: "Systems Programming Laboratory", faculty: "Rajat Subhra Chakraborty, Abir Das", ltp: "0-0-3", credits: 2, slot: "P", room: "" },
  { code: "CS31003", name: "Compilers", faculty: "Aritra Hazra, Abhijit Das", ltp: "3-0-0", credits: 3, slot: "D31,D32,D33", room: "NC241,NC242" },
  { code: "CS31005", name: "Algorithms - II", faculty: "Abhranil Chatterjee, Palash Dey", ltp: "3-1-0", credits: 4, slot: "V41,V42,V43,V44", room: "NC231,NC232" },
  { code: "CS31007", name: "Computer Organization & Architecture", faculty: "Debdeep Mukhopadhyay, Sarani Bhattacharya", ltp: "3-1-0", credits: 4, slot: "C41,C42,C43,C44", room: "NC241,NC244" },
  { code: "CS39001", name: "Computer Organization Laboratory", faculty: "Indranil Sengupta, Sarani Bhattacharya, Debdeep Mukhopadhyay, Shuvodip Maitra", ltp: "0-0-6", credits: 4, slot: "J,X41,X42,X43", room: "" },
  { code: "CS39003", name: "Compilers Laboratory", faculty: "Abhijit Das, Aritra Hazra", ltp: "0-0-3", credits: 2, slot: "L", room: "" },
  { code: "CS40019", name: "Image Processing", faculty: "Rajat Subhra Chakraborty", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "CSE-17" },
  { code: "CS47005", name: "Project - Part 1", faculty: "Partha Bhowmick, Saptarshi Ghosh", ltp: "0-0-6", credits: 4, slot: "", room: "" },
  { code: "CS48003", name: "Summer Training", faculty: "Saptarshi Ghosh, Partha Bhowmick", ltp: "0-0-0", credits: 2, slot: "", room: "" },
  { code: "CS57003", name: "Project - Part 1", faculty: "Krothapalli Sreenivasa Rao", ltp: "0-0-18", credits: 12, slot: "", room: "" },
  { code: "CS60005", name: "Foundations of Computing Science", faculty: "Debaditya Roy, Pawan Goyal", ltp: "3-1-0", credits: 4, slot: "C41,C42,C43,C44", room: "NC141,NC141" },
  { code: "CS60007", name: "Algorithm Design and Analysis", faculty: "Partha Pratim Chakrabarti, Sourangshu Bhattacharya", ltp: "4-0-0", credits: 4, slot: "D41,D42,D43,D44", room: "NC234,NC234" },
  { code: "CS60009", name: "Smartphone Computing & Application", faculty: "Bivas Mitra", ltp: "3-0-0", credits: 3, slot: "E31,E32,E33", room: "CSE-32" },
  { code: "CS60014", name: "Quantum Computing & Quantum Information Processing", faculty: "Indranil Sengupta", ltp: "3-1-0", credits: 4, slot: "E41,E42,E43,E44", room: "CSE-17" },
  { code: "CS60017", name: "Social Computing", faculty: "Animesh Mukherjee, Somak Aditya", ltp: "3-0-0", credits: 3, slot: "V31,V32,V33", room: "CSE-12" },
  { code: "CS60018", name: "Statistical Learning Theory", faculty: "Pabitra Mitra", ltp: "3-0-0", credits: 3, slot: "G31,G32,G33", room: "NR213" },
  { code: "CS60021", name: "Scalable Data Mining", faculty: "Sourangshu Bhattacharya, Ritesh Sarkhel", ltp: "3-0-0", credits: 3, slot: "G31,G32,G33", room: "NR413,NR413" },
  { code: "CS60023", name: "Approximation and Online Algorithms", faculty: "Palash Dey, Sudeshna Kolay", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "CSE-32" },
  { code: "CS60025", name: "Algorithmic Game Theory", faculty: "Somindu Chaya Ramanna", ltp: "3-0-0", credits: 3, slot: "V31,V32,V33", room: "CSE-32" },
  { code: "CS60029", name: "Randomized Algorithm Design", faculty: "Abhranil Chatterjee, Somindu Chaya Ramanna", ltp: "3-0-0", credits: 3, slot: "F31,F32,F33", room: "CSE-119" },
  { code: "CS60038", name: "Advances in Operating Systems Design", faculty: "Arobinda Gupta", ltp: "3-0-0", credits: 3, slot: "G31,G32,G33", room: "CSE-17" },
  { code: "CS60045", name: "Artificial Intelligence", faculty: "Chittaranjan Mandal", ltp: "3-0-0", credits: 3, slot: "A31,A32,A33", room: "NR122" },
  { code: "CS60047", name: "Advanced Graph Theory", faculty: "Arobinda Gupta, Bivas Mitra", ltp: "3-1-0", credits: 4, slot: "V41,V42,V43,V44", room: "CSE-17" },
  { code: "CS60050", name: "Machine Learning", faculty: "Ayan Chaudhury, Abir Das", ltp: "3-0-0", credits: 3, slot: "G31,G32,G33", room: "NC321,NC322,NC321,NC322" },
  { code: "CS60055", name: "Ubiquitous Computing", faculty: "Sandip Chakraborty", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "CSE-119" },
  { code: "CS60059", name: "Object Oriented Systems", faculty: "Jibesh Patra", ltp: "3-0-0", credits: 3, slot: "A31,A32,A33", room: "NC344" },
  { code: "CS60065", name: "Cryptography and Network Security", faculty: "Monosij Maitra", ltp: "3-1-0", credits: 4, slot: "V41,V42,V43,V44", room: "CSE-119" },
  { code: "CS60071", name: "Algorithms for Bioinformatics", faculty: "Jayanta Mukhopadhyay", ltp: "3-0-0", credits: 3, slot: "A31,A32,A33", room: "CSE-119" },
  { code: "CS60073", name: "Advanced Machine Learning", faculty: "Debaditya Roy", ltp: "3-0-0", credits: 3, slot: "G31,G32,G33", room: "CSE-119" },
  { code: "CS60075", name: "Natural Language Processing", faculty: "Somak Aditya", ltp: "3-0-0", credits: 3, slot: "F31,F32,F33", room: "NR411" },
  { code: "CS60077", name: "Reinforcement Learning", faculty: "Soumyajit Dey, Pralay Mitra", ltp: "3-0-0", credits: 3, slot: "E31,E32,E33", room: "CSE-119" },
  { code: "CS60081", name: "Usable Security and Privacy", faculty: "Shamik Sural", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "CSE-12" },
  { code: "CS60092", name: "Information Retrieval", faculty: "Niloy Ganguly, Pabitra Mitra", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "NC121,NC121" },
  { code: "CS60111", name: "Geographical Information System", faculty: "Soumya Kanti Ghosh", ltp: "3-0-0", credits: 3, slot: "A31,A32,A33", room: "CSE-12" },
  { code: "CS60113", name: "Advanced Database Systems", faculty: "Sudip Misra, Krothapalli Sreenivasa Rao", ltp: "4-0-0", credits: 4, slot: "V41,V42,V43,V44", room: "ITCLA1" },
  { code: "CS60119", name: "Wireless Adhoc & Sensor Networks", faculty: "Krothapalli Sreenivasa Rao", ltp: "4-0-0", credits: 4, slot: "E41,E42,E43,E44", room: "CSE-12" },
  { code: "CS60203", name: "Design Optimization of Computing Systems", faculty: "Sandip Chakraborty, Mainack Mondal", ltp: "3-0-0", credits: 3, slot: "A31,A32,A33", room: "CSE-17" },
  { code: "CS61061", name: "Data Analytics", faculty: "Abhijnan Chakraborty", ltp: "3-1-0", credits: 4, slot: "F41,F42,F43,F44", room: "NR423" },
  { code: "CS61064", name: "High Performance Parallel Programming", faculty: "Pralay Mitra, Soumyajit Dey", ltp: "3-1-0", credits: 4, slot: "F41,F42,F43,F44", room: "CSE-12" },
  { code: "CS61065", name: "Theory and Applications of Blockchain", faculty: "Jibesh Patra, Satrajit Ghosh", ltp: "3-1-0", credits: 4, slot: "F41,F42,F43,F44", room: "CSE-17" },
  { code: "CS61066", name: "Architecture and Protocols for Internet of Things", faculty: "Sudip Misra", ltp: "3-1-0", credits: 4, slot: "E41,E42,E43,E44", room: "CSE-32" },
  { code: "CS67023", name: "Project - 2", faculty: "Pralay Mitra", ltp: "0-0-0", credits: 16, slot: "", room: "" },
  { code: "CS68021", name: "Summer Internship", faculty: "Pralay Mitra", ltp: "0-0-6", credits: 4, slot: "", room: "" },
  { code: "CS69045", name: "Seminar", faculty: "Abir Das", ltp: "0-0-3", credits: 2, slot: "L", room: "CSE-17" },
  { code: "CS69201", name: "Computing Lab", faculty: "Niloy Ganguly, Abhijnan Chakraborty, Mainack Mondal", ltp: "0-0-6", credits: 4, slot: "J,X41,X42,X43", room: "" },
];

// A lecture slot like "B31,B32,B33" is ONE slot (letter B, met 3x/week) — every
// token shares the same letter. A lab slot like "J,K,L,N,P,X" instead lists
// several ALTERNATIVE slots the section could land in (batch-dependent) — those
// letters differ token to token. slotOptions() returns the distinct letters
// either way; slotLetter() is just the first, used for display/back-compat.

function slotOptions(rawSlot) {
  if (!rawSlot) return [];
  const letters = rawSlot.split(",").map(tok => {
    const m = tok.trim().match(/^[A-Za-z]+/);
    return m ? m[0].toUpperCase() : null;
  }).filter(Boolean);
  return [...new Set(letters)];
}

function slotLetter(rawSlot) {
  const opts = slotOptions(rawSlot);
  return opts.length ? opts[0] : null;
}

const SLOT_COLORS = {
  A: "#E2725B", B: "#4FD1A5", C: "#6C8EF5", D: "#D9A441",
  E: "#B983FF", F: "#F2A65A", G: "#5FC3E4", U: "#E85D9C",
  V: "#8FD14F", J: "#9AA5B1", K: "#7E93A8", L: "#6F8CA6",
  N: "#5D7C9B", P: "#4C6C8F", X: "#3B5C82",
};

function slotColor(letter) {
  return SLOT_COLORS[letter] || "#6B7280";
}
