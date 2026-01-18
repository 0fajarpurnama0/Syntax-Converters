// --- 1. The Conversion Registry (Expandable) ---
const converters = {
    // Format: "source-target": function(inputString)
    
    'json-yaml': (input) => {
        const jsonObj = JSON.parse(input);
        // jsyaml is loaded globally via the script tag in HTML
        return jsyaml.dump(jsonObj);
    },

    'yaml-json': (input) => {
        const obj = jsyaml.load(input);
        return JSON.stringify(obj, null, 2); // Indent with 2 spaces
    },
    
    // Future expansion examples:
    // 'csv-json': (input) => { ... },
    // 'json-xml': (input) => { ... },
};


// --- 2. DOM Elements ---
const sourceSelect = document.getElementById('sourceLang');
const targetSelect = document.getElementById('targetLang');
const inputArea = document.getElementById('inputArea');
const outputArea = document.getElementById('outputArea');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swapBtn');
const statusMsg = document.getElementById('statusMsg');

// --- 3. Core Logic ---

function performConversion() {
    const source = sourceSelect.value;
    const target = targetSelect.value;
    const code = inputArea.value.trim();
    const conversionKey = `${source}-${target}`;

    // Clear previous status
    statusMsg.textContent = '';
    outputArea.value = '';

    if (!code) {
        statusMsg.textContent = "Please enter some code to convert.";
        return;
    }

    if (source === target) {
        outputArea.value = code; // No conversion needed
        return;
    }

    try {
        if (converters[conversionKey]) {
            const result = converters[conversionKey](code);
            outputArea.value = result;
        } else {
            statusMsg.textContent = `Converter for ${source} to ${target} is not yet implemented.`;
        }
    } catch (err) {
        console.error(err);
        
        // Check if it is a specific YAML error to give better feedback
        if (err.reason && err.mark) {
            statusMsg.textContent = `YAML Error: ${err.reason} at line ${err.mark.line + 1}`;
            // Optional: Highlight the specific line in the editor if you add advanced UI later
        } else {
            statusMsg.textContent = `Error: ${err.message}`;
        }
    }
}

// --- 4. Event Listeners ---

convertBtn.addEventListener('click', performConversion);

// Allow swapping source and target
swapBtn.addEventListener('click', () => {
    const temp = sourceSelect.value;
    sourceSelect.value = targetSelect.value;
    targetSelect.value = temp;
    
    // Swap content as well for convenience
    const tempCode = inputArea.value;
    inputArea.value = outputArea.value;
    outputArea.value = tempCode;
});

// --- New DOM Elements ---
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// --- 5. New Features Logic ---

// COPY TO CLIPBOARD
copyBtn.addEventListener('click', async () => {
    if (!outputArea.value) return;
    
    try {
        await navigator.clipboard.writeText(outputArea.value);
        
        // Visual feedback
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "✅ Copied!";
        setTimeout(() => copyBtn.innerText = originalText, 2000);
    } catch (err) {
        statusMsg.textContent = "Failed to copy: " + err;
    }
});

// DOWNLOAD FILE
downloadBtn.addEventListener('click', () => {
    if (!outputArea.value) return;
    
    const target = targetSelect.value;
    const blob = new Blob([outputArea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${target}`; // e.g., converted.yaml
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// UPLOAD FILE
uploadBtn.addEventListener('click', () => {
    fileInput.click(); // Trigger the hidden file input
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        inputArea.value = e.target.result;
        // Optional: Auto-detect conversion based on file extension could go here
    };
    reader.readAsText(file);
});