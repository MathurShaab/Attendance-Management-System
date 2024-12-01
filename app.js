let studentData = []; // Store the student data
let categoryCounts = { Gen: 0, Ews: 0, Sc: 0, St: 0 }; // Category counts

// Handle file upload
document.getElementById("file-upload").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      parseCSV(content);
    };
    reader.readAsText(file);
  } else {
    alert("Please upload a valid CSV or TXT file.");
  }
}

// Parse CSV and display student data
function parseCSV(content) {
  const lines = content.split("\n");
  studentData = [];

  lines.forEach((line, index) => {
    if (index > 0 && line.trim() !== "") {
      const columns = line.split(",");
      const student = {
        rollNumber: columns[0].trim(),
        name: columns[1].trim(),
        category: columns[2].trim(),
        attendance: false, // Initially, attendance is false (absent)
      };
      studentData.push(student);
    }
  });
  displayStudents(); // Display student data and update stats
  updateCategoryChart(); // Update chart immediately after data is loaded
}

// Display students and attendance options
function displayStudents() {
  const form = document.getElementById("attendance-form");
  form.innerHTML = ""; // Clear existing students

  studentData.forEach((student, index) => {
    const studentItem = document.createElement("div");
    studentItem.classList.add("student-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `attendance-${index}`;
    checkbox.addEventListener("change", (event) => {
      student.attendance = event.target.checked;
      updateCategoryChart(); // Update chart whenever attendance is changed
    });

    const label = document.createElement("label");
    label.setAttribute("for", `attendance-${index}`);
    label.textContent = `${student.name} (${student.category})`;

    studentItem.appendChild(checkbox);
    studentItem.appendChild(label);
    form.appendChild(studentItem);
  });
}

// Update the category-wise chart based on attendance
function updateCategoryChart() {
  // Count the total, present, and absent students in each category
  const categoryData = { Gen: 0, Ews: 0, Sc: 0, St: 0 };

  studentData.forEach(student => {
    if (student.attendance) {
      categoryData[student.category]++;
    }
  });

  // Prepare data for pie chart
  const pieData = {
    labels: ['General', 'EWS', 'SC', 'ST'],
    datasets: [{
      data: [
        categoryData['Gen'],
        categoryData['Ews'],
        categoryData['Sc'],
        categoryData['St'],
      ],
      backgroundColor: ['#FFB74D', '#FF7043', '#388E3C', '#0288D1'],
    }]
  };

  // Update the chart if it already exists
  if (window.categoryChart) {
    window.categoryChart.data = pieData;
    window.categoryChart.update();
  } else {
    window.categoryChart = new Chart(document.getElementById('category-chart'), {
      type: 'pie',
      data: pieData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { callbacks: { label: function (tooltipItem) { return tooltipItem.raw + ' students'; } } }
        }
      }
    });
  }
}

// Save Attendance to CSV
document.getElementById("save-attendance").addEventListener("click", saveAttendance);

function saveAttendance() {
  if (studentData.length === 0) {
    alert("No student data available to save attendance.");
    return;
  }

  // Count the number of present students in each category
  const presentCount = {
    Gen: 0,
    Ews: 0,
    Sc: 0,
    St: 0
  };

  studentData.forEach(student => {
    if (student.attendance) {
      presentCount[student.category]++;
    }
  });

  // Generate CSV content
  const csvContent = "Roll Number,Name,Category,Attendance\n" + studentData.map(student => {
    return `${student.rollNumber},${student.name},${student.category},${student.attendance ? "Present" : "Absent"}`;
  }).join("\n");

  // Create a metadata section with the total present student count per category
  const metadata = `Total Present Students by Category:
  General (Gen): ${presentCount.Gen}
  EWS (Ews): ${presentCount.Ews}
  SC (Sc): ${presentCount.Sc}
  ST (St): ${presentCount.St}\n\n`;

  // Combine the metadata and the student CSV content
  const csvWithMetadata = metadata + csvContent;

  const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0]; // Extract the date part

// Create the file with the current date in its name
const blob = new Blob([csvWithMetadata], { type: "text/csv" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = `attendance_${formattedDate}.csv`; // File name with the date
link.click();
}
