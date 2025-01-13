// Helper function to create a mock Google Meet page structure
function createMockMeetPage() {
    return `
        <div class="meet-interface">
            <div class="controls-panel">
                <button role="button" aria-label="Turn off microphone">
                    <div class="icon-wrapper">
                        <span class="icon">mic_off</span>
                    </div>
                </button>
                
                <button role="button" aria-label="Turn off camera">
                    <div class="icon-wrapper">
                        <span class="icon">videocam_off</span>
                    </div>
                </button>
                
                <button role="button" aria-label="Raise hand">
                    <div class="icon-wrapper">
                        <span class="icon">pan_tool</span>
                    </div>
                </button>
                
                <button role="button" aria-label="Chat with everyone">
                    <div class="icon-wrapper">
                        <span class="icon">chat</span>
                    </div>
                </button>
            </div>
            
            <div class="chat-panel" style="display: none;">
                <div class="chat-messages"></div>
                <input type="text" aria-label="Send a message to everyone" />
            </div>
        </div>
    `;
}

// Helper function to simulate Meet control interactions
function simulateControlClick(controlType) {
    const selectors = {
        mute: '[aria-label*="microphone"]',
        video: '[aria-label*="camera"]',
        hand: '[aria-label*="Raise hand"]',
        chat: '[aria-label*="Chat"]'
    };

    const button = document.querySelector(selectors[controlType]);
    if (button) {
        button.click();
        return true;
    }
    return false;
}

// Helper function to get control state
function getControlState(controlType) {
    const selectors = {
        mute: '[aria-label*="microphone"]',
        video: '[aria-label*="camera"]',
        hand: '[aria-label*="Raise hand"]',
        chat: '[aria-label*="Chat"]'
    };

    const button = document.querySelector(selectors[controlType]);
    if (!button) return null;

    return {
        mute: button.getAttribute('aria-label').includes('Turn off'),
        video: button.getAttribute('aria-label').includes('Turn off'),
        hand: button.getAttribute('aria-pressed') === 'true',
        chat: document.querySelector('.chat-panel').style.display !== 'none'
    }[controlType];
}

module.exports = {
    createMockMeetPage,
    simulateControlClick,
    getControlState
};