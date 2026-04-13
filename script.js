async function finalizeProcessing() {
    // Generate ACTUAL mosaic images using the user's uploaded photos
    const standardRes = await createSmartMosaic(800, 800);   // Standard Web Size
    const highRes = await createSmartMosaic(1600, 1600);     // HD Print Size
    const ultraHD = await createSmartMosaic(3200, 3200);     // 4K Ultra Size

    const res240 = document.getElementById('result240p');
    const res480 = document.getElementById('result480p');
    const res4k = document.getElementById('result4k');

    if (res240) res240.src = standardRes;
    if (res480) res480.src = highRes;
    if (res4k) res4k.src = ultraHD;

    // Hide processing, show results
    const procState = document.getElementById('processingState');
    const resState = document.getElementById('resultsState');
    
    if (procState) procState.classList.add('hidden');
    if (resState) resState.classList.remove('hidden');
    
    showToast('Mosaic generated successfully!', 'success');
}

// This replaces the old "Mock" purple generator with a real image blender
function createSmartMosaic(width, height) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 1. Draw the main Target Image as the base
        const targetImg = new Image();
        targetImg.onload = () => {
            ctx.drawImage(targetImg, 0, 0, width, height);

            if (appState.tileImages.length === 0) {
                resolve(canvas.toDataURL('image/png'));
                return;
            }

            // 2. Figure out how many tiles to use based on settings
            let cols = 20; 
            if (appState.mosaicSettings.tileSize === 'small') cols = 40;
            if (appState.mosaicSettings.tileSize === 'large') cols = 10;
            
            const tileW = width / cols;
            const tileH = height / cols;

            // 3. Pre-load all the little tile images
            let tilesLoaded = 0;
            const tileImgElements = [];
            
            appState.tileImages.forEach(tileData => {
                const img = new Image();
                img.onload = () => {
                    tilesLoaded++;
                    // Once all tiles are loaded, draw them onto the canvas
                    if (tilesLoaded === appState.tileImages.length) {
                        drawTilesAndFinish();
                    }
                };
                img.src = tileData.data;
                tileImgElements.push(img);
            });

            function drawTilesAndFinish() {
                // Apply blend mode from your settings
                const blend = appState.mosaicSettings.blendMode;
                if (blend === 'overlay' || blend === 'multiply') {
                     ctx.globalCompositeOperation = blend;
                } else {
                     ctx.globalAlpha = 0.6; // Standard transparency
                }

                // Draw the little tiles in a grid
                let tileIndex = 0;
                for (let y = 0; y < height; y += tileH) {
                    for (let x = 0; x < width; x += tileW) {
                        const tile = tileImgElements[tileIndex % tileImgElements.length];
                        ctx.drawImage(tile, x, y, tileW, tileH);
                        tileIndex++;
                    }
                }

                // Reset canvas settings
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = 'source-over';

                // Lightly draw the target image over the top one more time to restore crisp details
                ctx.globalAlpha = 0.4;
                ctx.drawImage(targetImg, 0, 0, width, height);
                
                // Convert the final canvas to a downloadable image
                resolve(canvas.toDataURL('image/png', 1.0)); 
            }
        };
        targetImg.src = appState.targetImage.data;
    });
}