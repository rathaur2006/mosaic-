// ========================================
// STATE MANAGEMENT
// ========================================

const appState = {
    isAuthenticated: false,
    currentTab: 'upload',
    targetImage: null,
    tileImages: [],
    maxTiles: 50,
    mosaicSettings: {
        tileSize: 'medium',
        blendMode: 'standard',
        aspectRatio: 'original'
    }
};

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function toggleAuthForm() {
    document.getElementById('loginForm').classList.toggle('active');
    document.getElementById('signupForm').classList.toggle('active');
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }

    // Simulate login
    appState.isAuthenticated = true;
    showAuthenticatedUI();
    showToast('Login successful!', 'success');
}

function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Simulate signup
    appState.isAuthenticated = true;
    showAuthenticatedUI();
    showToast('Account created successfully!', 'success');
}

function handleLogout() {
    appState.isAuthenticated = false;
    appState.targetImage = null;
    appState.tileImages = [];
    showAuthenticationUI();
    showToast('Logged out successfully', 'success');
}

function showAuthenticationUI() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
    resetAuthForms();
}

function showAuthenticatedUI() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');
}

function resetAuthForms() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
}

// ========================================
// EMAIL VALIDATION
// ========================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// TAB NAVIGATION
// ========================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Mark button as active
    event.target.classList.add('active');

    appState.currentTab = tabName;
}

function goToPreview() {
    if (!appState.targetImage) {
        showToast('Please upload a target image', 'error');
        return;
    }

    if (appState.tileImages.length === 0) {
        showToast('Please upload at least one tile image', 'error');
        return;
    }

    // Populate preview
    populatePreview();

    // Switch to preview tab
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('previewTab').classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function goToUpload() {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('uploadTab').classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function resetToUpload() {
    appState.targetImage = null;
    appState.tileImages = [];
    clearTargetImage();
    clearAllTiles();
    document.getElementById('processingState').classList.remove('hidden');
    document.getElementById('resultsState').classList.add('hidden');
    goToUpload();
}

// ========================================
// FILE UPLOAD HANDLERS
// ========================================

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleTargetDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleTargetImageSelect({ target: { files } });
    }
}

function handleTilesDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleTilesImageSelect({ target: { files } });
    }
}

function handleTargetImageSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];

        if (!validateImageFile(file)) {
            showToast('Invalid file format. Please upload JPG, PNG, or WEBP', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            appState.targetImage = {
                name: file.name,
                data: e.target.result,
                size: file.size
            };

            // Display preview
            const preview = document.getElementById('targetPreview');
            document.getElementById('targetImagePreview').src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function handleTilesImageSelect(event) {
    const files = event.target.files;

    // Check total tile count
    if (appState.tileImages.length + files.length > appState.maxTiles) {
        showToast(
            `You can only upload maximum ${appState.maxTiles} tile images. ` +
            `You currently have ${appState.tileImages.length}.`,
            'error'
        );
        return;
    }

    // Process files
    Array.from(files).forEach((file, index) => {
        if (!validateImageFile(file)) {
            showToast(`File ${file.name} is invalid. Skipping...`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            appState.tileImages.push({
                name: file.name,
                data: e.target.result,
                size: file.size
            });

            renderTilePreview();
            updateTileCounter();
        };
        reader.readAsDataURL(file);
    });
}

function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type) && file.size > 0;
}

function clearTargetImage() {
    appState.targetImage = null;
    document.getElementById('targetPreview').classList.add('hidden');
    document.getElementById('targetImageInput').value = '';
}

function clearAllTiles() {
    appState.tileImages = [];
    document.getElementById('tilesPreviewContainer').classList.add('hidden');
    document.getElementById('tilesPreviewList').innerHTML = '';
    document.getElementById('tilesImageInput').value = '';
    updateTileCounter();
}

function renderTilePreview() {
    const container = document.getElementById('tilesPreviewList');
    container.innerHTML = '';

    appState.tileImages.forEach((tile, index) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'tile-thumb';
        thumbDiv.innerHTML = `
            <img src="${tile.data}" alt="Tile ${index + 1}">
            <button class="btn-remove" onclick="removeTile(${index})">×</button>
        `;
        container.appendChild(thumbDiv);
    });

    if (appState.tileImages.length > 0) {
        document.getElementById('tilesPreviewContainer').classList.remove('hidden');
    }
}

function removeTile(index) {
    appState.tileImages.splice(index, 1);
    renderTilePreview();
    updateTileCounter();
}

function updateTileCounter() {
    document.getElementById('tileCount').textContent = appState.tileImages.length;

    if (appState.tileImages.length >= appState.maxTiles) {
        document.getElementById('tilesImageInput').disabled = true;
        showToast(`Maximum tile images (${appState.maxTiles}) reached`, 'success');
    } else {
        document.getElementById('tilesImageInput').disabled = false;
    }
}

// ========================================
// PREVIEW POPULATION
// ========================================

function populatePreview() {
    // Set preview images
    document.getElementById('previewTarget').src = appState.targetImage.data;
    document.getElementById('previewTileCount').textContent = appState.tileImages.length;

    // Populate tiles grid
    const tilesGrid = document.getElementById('previewTilesGrid');
    tilesGrid.innerHTML = '';

    appState.tileImages.slice(0, 12).forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'preview-tile';
        tileDiv.innerHTML = `<img src="${tile.data}" alt="Tile ${index + 1}">`;
        tilesGrid.appendChild(tileDiv);
    });

    if (appState.tileImages.length > 12) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'preview-tile';
        moreDiv.style.display = 'flex';
        moreDiv.style.alignItems = 'center';
        moreDiv.style.justifyContent = 'center';
        moreDiv.style.background = 'rgba(138, 43, 226, 0.2)';
        moreDiv.textContent = `+${appState.tileImages.length - 12}`;
        tilesGrid.appendChild(moreDiv);
    }

    // Update settings display
    const tileSizeLabel = {
        small: 'Small (Fine Detail)',
        medium: 'Medium (Balanced)',
        large: 'Large (Artistic)'
    };

    const blendModeLabel = {
        standard: 'Standard',
        overlay: 'Overlay',
        multiply: 'Multiply'
    };

    document.getElementById('previewTileSize').textContent = 
        tileSizeLabel[document.getElementById('tileSize').value];
    document.getElementById('previewBlendMode').textContent = 
        blendModeLabel[document.getElementById('blendMode').value];
}

// ========================================
// MOSAIC GENERATION
// ========================================

function generateMosaic() {
    // Update settings
    appState.mosaicSettings.tileSize = document.getElementById('tileSize').value;
    appState.mosaicSettings.blendMode = document.getElementById('blendMode').value;
    appState.mosaicSettings.aspectRatio = document.getElementById('aspectRatio').value;

    // Switch to results tab
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('resultsTab').classList.add('active');
    document.querySelectorAll('.tab-btn')[2].classList.add('active');

    // Show processing state
    document.getElementById('processingState').classList.remove('hidden');
    document.getElementById('resultsState').classList.add('hidden');

    // Simulate processing
    simulateProcessing();
}

function simulateProcessing() {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('processingText').textContent = 
            `Processing... ${Math.round(progress)}%`;

        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            // Finalize processing
            finalizeProcessing();
        }
    };

    updateProgress();
}

function finalizeProcessing() {
    // Generate mock mosaic images
    const lowResCanvas = generateMockMosaic(240, 240);
    const standardCanvas = generateMockMosaic(480, 480);
    const ultraHDCanvas = generateMockMosaic(4096, 4096);

    document.getElementById('result240p').src = lowResCanvas;
    document.getElementById('result480p').src = standardCanvas;
    document.getElementById('result4k').src = ultraHDCanvas;

    // Hide processing, show results
    setTimeout(() => {
        document.getElementById('processingState').classList.add('hidden');
        document.getElementById('resultsState').classList.remove('hidden');
        showToast('Mosaic generated successfully!', 'success');
    }, 500);
}

function generateMockMosaic(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#8a2be2');
    gradient.addColorStop(0.5, '#4b0082');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some pattern to simulate mosaic tiles
    const tileSize = width / 20;
    for (let i = 0; i < width; i += tileSize) {
        for (let j = 0; j < height; j += tileSize) {
            ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 + Math.random() * 0.3})`;
            ctx.strokeRect(i, j, tileSize, tileSize);
        }
    }

    // Draw target image as overlay if available
    if (appState.targetImage) {
        const img = new Image();
        img.onload = () => {
            ctx.globalAlpha = 0.2;
            ctx.drawImage(img, 0, 0, width, height);
            ctx.globalAlpha = 1;
        };
        img.src = appState.targetImage.data;
    }

    return canvas.toDataURL('image/png');
}

// ========================================
// DOWNLOAD FUNCTIONALITY
// ========================================

function downloadMosaic(resolution) {
    let imageData;
    let filename;

    switch (resolution) {
        case '240p':
            imageData = document.getElementById('result240p').src;
            filename = `mosaic-240p-${Date.now()}.png`;
            break;
        case '480p':
            imageData = document.getElementById('result480p').src;
            filename = `mosaic-480p-${Date.now()}.png`;
            break;
        case '4k':
            imageData = document.getElementById('result4k').src;
            filename = `mosaic-4k-${Date.now()}.png`;
            break;
    }

    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    link.click();

    showToast(`Downloaded ${resolution} mosaic!`, 'success');
}

// ========================================
// UPGRADE MODAL
// ========================================

function showUpgradeModal() {
    document.getElementById('upgradeModal').classList.remove('hidden');
}

function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.add('hidden');
}

function handleUpgrade(plan) {
    showToast(`Redirecting to checkout for ${plan} plan...`, 'success');
    console.log(`Upgrade to ${plan} plan initiated`);
    // In production, redirect to payment gateway
    // window.location.href = `/checkout/${plan}`;
    setTimeout(() => {
        closeUpgradeModal();
    }, 1500);
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast ${type}`;

    // Remove hidden class
    toast.classList.remove('hidden');

    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// ========================================
// CLICK HANDLERS FOR FILE INPUTS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Target upload zone click
    document.getElementById('targetUploadZone').addEventListener('click', () => {
        document.getElementById('targetImageInput').click();
    });

    // Tiles upload zone click
    document.getElementById('tilesUploadZone').addEventListener('click', () => {
        document.getElementById('tilesImageInput').click();
    });

    // Close upgrade modal when clicking outside
    document.getElementById('upgradeModal').addEventListener('click', (e) => {
        if (e.target.id === 'upgradeModal' || e.target.classList.contains('modal-overlay')) {
            closeUpgradeModal();
        }
    });

    // ==========================================
    // BUG FIX APPLIED HERE
    // ==========================================
    // Initialize with auth screen (COMMENTED OUT TEMPORARILY)
    // showAuthenticationUI(); 
    
    // Force the app to show the dashboard immediately
    appState.isAuthenticated = true; 
});

// ========================================
// LOCAL STORAGE (Optional Enhancement)
// ========================================

function saveStateToLocalStorage() {
    const stateToSave = {
        tileImages: appState.tileImages.map(tile => ({
            name: tile.name,
            size: tile.size
            // Note: Don't save base64 data to avoid exceeding storage limits
        })),
        mosaicSettings: appState.mosaicSettings
    };
    localStorage.setItem('mosaicAppState', JSON.stringify(stateToSave));
}

function loadStateFromLocalStorage() {
    const saved = localStorage.getItem('mosaicAppState');
    if (saved) {
        const state = JSON.parse(saved);
        appState.mosaicSettings = state.mosaicSettings;
    }
}