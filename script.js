// Wait for the HTML to fully load before running ANY script
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Safely grab all our elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const generateBtn = document.getElementById('generate-btn');
    const previewCanvas = document.getElementById('preview-canvas');
    
    // Setup Canvas Context (needed for drawing the image later)
    const ctx = previewCanvas ? previewCanvas.getContext('2d') : null;

    // 2. Tab Switching Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the target tab ID from the clicked button
            const targetId = button.getAttribute('data-target');

            // Remove 'active' class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Hide all tab content
            tabContents.forEach(content => content.classList.add('hidden'));

            // Add 'active' to the clicked button
            button.classList.add('active');
            // Show the target content area safely
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            } else {
                console.error(`Could not find tab content with ID: ${targetId}`);
            }
        });
    });

    // 3. Generate Button Logic Placeholder
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            console.log("Generate button clicked! Starting mosaic processing...");
            // We will add the actual image processing logic here next
        });
    } else {
         console.warn("Generate button not found in the DOM.");
    }
});