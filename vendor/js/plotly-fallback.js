/*
 * Plotly.js Fallback for Fractal Generator
 * Provides basic functionality when CDN is not accessible
 */

// Simple Plotly fallback that creates placeholder divs
window.Plotly = {
    newPlot: function(elementId, data, layout, config) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #2b3e50 0%, #34495e 100%);
                    border: 2px dashed #375a7f;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-family: 'Lato', sans-serif;
                    font-size: 1.2rem;
                    text-align: center;
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                ">
                    <div>
                        <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📊</div>
                        <div style="font-weight: bold; margin-bottom: 0.5rem;">${layout && layout.title ? layout.title : 'Fractal Visualization'}</div>
                        <div style="opacity: 0.7; font-size: 0.9rem;">Graph will render here when WebAssembly algorithms are integrated</div>
                        <div style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(55, 90, 127, 0.3); border-radius: 4px; font-size: 0.8rem;">
                            Placeholder for ${elementId.replace('_', ' ').replace('-', ' ')}
                        </div>
                    </div>
                    <div style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        width: 40px;
                        height: 40px;
                        border: 2px solid rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        opacity: 0.1;
                    "></div>
                    <div style="
                        position: absolute;
                        bottom: 10px;
                        left: 10px;
                        width: 60px;
                        height: 60px;
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        border-radius: 50%;
                        opacity: 0.1;
                    "></div>
                </div>
            `;
        }
        return Promise.resolve();
    },
    
    react: function(elementId, data, layout, config) {
        return this.newPlot(elementId, data, layout, config);
    },
    
    redraw: function(elementId) {
        // Placeholder for redraw functionality
        return Promise.resolve();
    }
};

// Bootstrap tab functionality fallback
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab functionality if Bootstrap is not loaded
    if (typeof bootstrap === 'undefined') {
        initializeTabFunctionality();
        initializeAccordionFunctionality();
    }
});

function initializeTabFunctionality() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);
            
            // Remove active from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active to clicked tab and target pane
            this.classList.add('active');
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });
}

function initializeAccordionFunctionality() {
    const accordionButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            const targetCollapse = document.querySelector(targetId);
            
            if (targetCollapse) {
                const isCollapsed = !targetCollapse.classList.contains('show');
                
                if (isCollapsed) {
                    targetCollapse.classList.add('show');
                    this.classList.remove('collapsed');
                } else {
                    targetCollapse.classList.remove('show');
                    this.classList.add('collapsed');
                }
            }
        });
    });
}