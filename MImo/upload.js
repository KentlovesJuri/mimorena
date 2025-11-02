document.getElementById("processBtn").addEventListener("click", () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Please choose a file first.");
    return;
  }

  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "txt") readTextFile(file);
  else if (ext === "pdf") readPDF(file);
  else if (ext === "docx") readDOCX(file);
  else alert("Unsupported file type. Please upload a .txt, .pdf, or .docx file.");
});

// ===== READ .TXT FILE =====
function readTextFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => processTextToQuestions(e.target.result);
  reader.readAsText(file);
}

// ===== READ .PDF FILE =====
function readPDF(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const typedArray = new Uint8Array(e.target.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;
    let text = "";
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + " ";
    }
    processTextToQuestions(text);
  };
  reader.readAsArrayBuffer(file);
}

// ===== READ .DOCX FILE =====
function readDOCX(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const arrayBuffer = e.target.result;
    const result = await mammoth.extractRawText({ arrayBuffer });
    processTextToQuestions(result.value);
  };
  reader.readAsArrayBuffer(file);
}

// ===== CONVERT TEXT TO QUESTIONS =====
function processTextToQuestions(text) {
  const sentences = text.split(/[.?!]/).filter(s => s.trim().length > 10);
  const generatedQuestions = sentences.slice(0, 4).map((s, i) => {
    const words = s.split(" ").filter(w => w.length > 3);
    const correct = words[Math.floor(Math.random() * words.length)] || "Answer";
    const options = [
      correct,
      words[Math.floor(Math.random() * words.length)] || "Choice 1",
      words[Math.floor(Math.random() * words.length)] || "Choice 2",
      words[Math.floor(Math.random() * words.length)] || "Choice 3"
    ];
    shuffleArray(options); // Randomize order

    return {
      text: "Question " + (i + 1) + ": " + s.trim(),
      options: options,
      answer: correct
    };
  });

  if (generatedQuestions.length === 0) {
    alert("No readable text found!");
    return;
  }

  localStorage.setItem("generatedQuestions", JSON.stringify(generatedQuestions));
  alert("Questions generated! Redirecting to Arena...");
  window.location.href = "Arena_options.html";
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
