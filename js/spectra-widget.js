// SPECTRA Floating Chat Widget
// Add this script to your website to show the SPECTRA chat popup

(function() {
    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'spectra-widget';
    widget.innerHTML = `
        <style>
            #spectra-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                z-index: 9999;
            }

            #spectra-widget * {
                box-sizing: border-box;
            }

            .spectra-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0d7a6e 0%, #1a4d8f 100%);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
            }

            .spectra-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            }

            .spectra-btn.active {
                display: none;
            }

            .spectra-popup {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 380px;
                max-height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 40px rgba(0,0,0,0.16);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }

            .spectra-popup.open {
                display: flex;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .spectra-header {
                background: linear-gradient(135deg, #0d7a6e 0%, #1a4d8f 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .spectra-header h3 {
                margin: 0;
                font-size: 1.1em;
            }

            .spectra-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .spectra-close:hover {
                opacity: 0.8;
            }

            .spectra-content {
                padding: 20px;
                flex: 1;
                overflow-y: auto;
                font-size: 14px;
                line-height: 1.5;
                color: #333;
            }

            .spectra-content h4 {
                color: #0d7a6e;
                margin-top: 0;
                margin-bottom: 10px;
            }

            .spectra-content p {
                margin-bottom: 15px;
            }

            .spectra-cta {
                padding: 15px 20px;
                border-top: 1px solid #eee;
                background: #f8f9fa;
            }

            .spectra-cta a {
                display: block;
                background: linear-gradient(135deg, #0d7a6e 0%, #1a4d8f 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                text-decoration: none;
                text-align: center;
                font-weight: 600;
                transition: opacity 0.2s ease;
            }

            .spectra-cta a:hover {
                opacity: 0.9;
            }

            @media (max-width: 480px) {
                .spectra-popup {
                    width: calc(100% - 20px);
                    right: 10px;
                    bottom: 80px;
                    max-height: 70vh;
                }
            }
        </style>

        <button class="spectra-btn" id="spectra-toggle" title="Chat with SPECTRA">
            💬
        </button>

        <div class="spectra-popup" id="spectra-popup">
            <div class="spectra-header">
                <h3>SPECTRA</h3>
                <button class="spectra-close" id="spectra-close">✕</button>
            </div>
            <div class="spectra-content">
                <h4>Free AI Support for Autism Families</h4>
                <p>Get 24/7 help with:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Meltdown strategies</li>
                    <li>IEP preparation</li>
                    <li>Behavior support</li>
                    <li>Caregiver resources</li>
                    <li>Finding local services</li>
                </ul>
                <p><strong>Completely free. No waitlist. Always available.</strong></p>
            </div>
            <div class="spectra-cta">
                <a href="https://spectra.grscorp.us" target="_blank">Start Free Now</a>
            </div>
        </div>
    `;

    // Add to page when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(widget);
            setupEventListeners();
        });
    } else {
        document.body.appendChild(widget);
        setupEventListeners();
    }

    function setupEventListeners() {
        const toggleBtn = document.getElementById('spectra-toggle');
        const closeBtn = document.getElementById('spectra-close');
        const popup = document.getElementById('spectra-popup');

        toggleBtn.addEventListener('click', function() {
            popup.classList.toggle('open');
        });

        closeBtn.addEventListener('click', function() {
            popup.classList.remove('open');
        });

        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!widget.contains(e.target)) {
                popup.classList.remove('open');
            }
        });
    }
})();
