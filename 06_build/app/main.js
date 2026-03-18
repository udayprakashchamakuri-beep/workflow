const plannerForm = document.querySelector("#planner-form");
const syllabusFileInput = document.querySelector("#syllabus-file");
const fileLabel = document.querySelector("#file-label");
const sampleButton = document.querySelector("#sample-button");
const courseNameInput = document.querySelector("#course-name");
const examDateInput = document.querySelector("#exam-date");
const studyHoursInput = document.querySelector("#study-hours");
const focusStyleInput = document.querySelector("#focus-style");
const syllabusNotesInput = document.querySelector("#syllabus-notes");
const planSummary = document.querySelector("#plan-summary");
const planList = document.querySelector("#plan-list");
const planBadge = document.querySelector("#plan-badge");

const sampleState = {
  courseName: "Intro to Biology",
  examDate: "2026-04-25",
  studyHours: "8",
  focusStyle: "steady",
  notes: "Assignment 1 due April 9. Midterm on April 25. Review cells, genetics, and lab reports. Weekly lab every Thursday."
};

const planTemplates = {
  steady: [
    {
      title: "Read and highlight key concepts",
      tag: "Light start",
      detail: "Break the uploaded syllabus into topics and mark the first deadline-driven unit."
    },
    {
      title: "Two focused revision blocks",
      tag: "Balanced week",
      detail: "Schedule revision on your strongest study days with one lighter recap session before the lab."
    },
    {
      title: "Weekend checkpoint",
      tag: "Stay on track",
      detail: "Reserve one short review block to check progress and adjust the following week."
    }
  ],
  sprint: [
    {
      title: "Deadline-first study sprint",
      tag: "Urgent mode",
      detail: "Pull the nearest assignment to the front of the week and move lower-pressure review later."
    },
    {
      title: "Two high-energy work sessions",
      tag: "Exam prep",
      detail: "Group the toughest topics into longer sessions close to your best attention window."
    },
    {
      title: "Recovery recap",
      tag: "Catch breath",
      detail: "Leave one short session for recap so the plan stays realistic under pressure."
    }
  ],
  deep: [
    {
      title: "Deep work block for hard topics",
      tag: "Long focus",
      detail: "Turn the heaviest unit into one uninterrupted study session with prep notes and a recap."
    },
    {
      title: "Concept consolidation",
      tag: "Retention",
      detail: "Use shorter follow-up sessions to revisit the hardest ideas before the exam date gets close."
    },
    {
      title: "Reflection and next steps",
      tag: "Weekly reset",
      detail: "Review what felt difficult and suggest the next study sequence for the following week."
    }
  ]
};

function updateFileLabel() {
  const file = syllabusFileInput.files[0];
  if (!file) {
    fileLabel.textContent = "PDF, DOCX, or TXT. We will show the file name here.";
    return;
  }
  fileLabel.textContent = `${file.name} selected. Ready for the first planning pass.`;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function addTextParagraph(parent, text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  parent.appendChild(paragraph);
}

function addLabeledValueParagraph(parent, prefix, value) {
  const paragraph = document.createElement("p");
  paragraph.appendChild(document.createTextNode(prefix));
  const strong = document.createElement("strong");
  strong.textContent = value;
  paragraph.appendChild(strong);
  parent.appendChild(paragraph);
}

function buildPlan() {
  const courseName = courseNameInput.value.trim() || "your course";
  const examDate = examDateInput.value || "not set yet";
  const studyHours = studyHoursInput.value || "8";
  const focusStyle = focusStyleInput.value;
  const notes = syllabusNotesInput.value.trim();
  const template = planTemplates[focusStyle];

  planBadge.textContent = "Preview generated";
  planBadge.classList.remove("muted");

  clearElement(planSummary);
  addLabeledValueParagraph(planSummary, "We generated a first-week preview for ", courseName);
  addTextParagraph(
    planSummary,
    `The plan is shaped around ${studyHours} study hours per week, a ${focusStyle} focus style, and an exam date of ${examDate}.`
  );
  addTextParagraph(
    planSummary,
    notes
      ? `Key syllabus note captured: "${notes.slice(0, 110)}${notes.length > 110 ? "..." : ""}"`
      : "Add more syllabus notes later to make the AI plan smarter."
  );

  clearElement(planList);
  template.forEach((item, index) => {
    const planItem = document.createElement("article");
    planItem.className = "plan-item";

    const header = document.createElement("header");
    const title = document.createElement("strong");
    title.textContent = `Session ${index + 1}: ${item.title}`;
    const tag = document.createElement("span");
    tag.className = "plan-tag";
    tag.textContent = item.tag;
    header.appendChild(title);
    header.appendChild(tag);

    const detail = document.createElement("p");
    detail.textContent = item.detail;

    planItem.appendChild(header);
    planItem.appendChild(detail);
    planList.appendChild(planItem);
  });
}

function loadSample() {
  courseNameInput.value = sampleState.courseName;
  examDateInput.value = sampleState.examDate;
  studyHoursInput.value = sampleState.studyHours;
  focusStyleInput.value = sampleState.focusStyle;
  syllabusNotesInput.value = sampleState.notes;
  fileLabel.textContent = "Sample syllabus loaded from the built-in demo data.";
  buildPlan();
}

syllabusFileInput.addEventListener("change", updateFileLabel);
sampleButton.addEventListener("click", loadSample);

plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  buildPlan();
});
