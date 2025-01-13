// Store references to DOM elements
const elements = {
    connectionStatus: document.getElementById('connection_status'),
    statusDot: document.querySelector('.status-dot'),
    statusText: document.querySelector('.status-text'),
    muteOnJoin: document.getElementById('muteOnJoin'),
    videoOffOnJoin: document.getElementById('videoOffOnJoin'),
    muteShortcut: document.getElementById('muteShortcut'),
    videoShortcut: document.getElementById('videoShortcut'),
    autoReconnect: document.getElementById('autoReconnect'),
    reconnectDelay: document.getElementById('reconnectDelay'),
    version: document.getElementById('version'),
    debugInfo: document.getElementById('debugInfo'),
    resetButton: document.getElementById('resetButton'),
    testButton: document.getElementById('testButton')
};

// Default settings
const DEFAULT_SETTINGS = {
    muteOnJoin: true,
    videoOffOnJoin: false,
    muteShortcut: 'ctrl+d',
    videoShortcut: 'ctrl+e',
    autoReconnect: true,
    reconnectDelay: 5000
};

// Global state
let globalSettings = { ...DEFAULT_SETTINGS };
let websocketStatus = 'disconnected';
let pluginUUID = null;
let actionInfo = null;
let connection = null;

// Initialize the Property Inspector
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
    pluginUUID = inPluginUUID;
    actionInfo = JSON.parse(inActionInfo);

    // Connect to Stream Deck
    connection = new WebSocket('ws://127.0.0.1:' + inPort);

    // WebSocket event handlers
    connection.onopen = () => {
        // Register plugin with Stream Deck
        registerPlugin(inRegisterEvent);
        
        // Get current settings
        requestSettings();
        
        // Update connection status
        updateConnectionStatus('connected');
    };

    connection.onclose = () => {
        updateConnectionStatus('disconnected');
    };

    connection.onerror = (error) => {
        console.error('WebSocket Error:', error);
        updateConnectionStatus('error');
    };

    connection.onmessage = (message) => {
        const data = JSON.parse(message.data);
        handleMessage(data);
    };

    // Set up event listeners for form elements
    setupEventListeners();
}

// Register the plugin with Stream Deck
function registerPlugin(inRegisterEvent) {
    const json = {
        event: inRegisterEvent,
        uuid: pluginUUID
    };
    connection.send(JSON.stringify(json));
}

// Request current settings from the plugin
function requestSettings() {
    const json = {
        event: 'getSettings',
        context: pluginUUID
    };
    connection.send(JSON.stringify(json));
}

// Handle incoming messages
function handleMessage(data) {
    switch (data.event) {
        case 'didReceiveSettings':
            handleSettings(data.payload?.settings);
            break;
        
        case 'websocketStatusUpdate':
            handleWebsocketStatus(data.payload);
            break;
        
        case 'connectionStatusUpdate':
            handleConnectionStatus(data.payload);
            break;
    }
}

// Update UI with current settings
function handleSettings(settings) {
    if (!settings) return;

    globalSettings = { ...DEFAULT_SETTINGS, ...settings };

    // Update form elements
    elements.muteOnJoin.checked = globalSettings.muteOnJoin;
    elements.videoOffOnJoin.checked = globalSettings.videoOffOnJoin;
    elements.muteShortcut.value = globalSettings.muteShortcut;
    elements.videoShortcut.value = globalSettings.videoShortcut;
    elements.autoReconnect.checked = globalSettings.autoReconnect;
    elements.reconnectDelay.value = globalSettings.reconnectDelay;

    // Update version info
    if (settings.version) {
        elements.version.textContent = settings.version;
    }
}

// Update WebSocket connection status display
function updateConnectionStatus(status) {
    websocketStatus = status;
    
    elements.statusDot.className = 'status-dot ' + status;
    
    switch (status) {
        case 'connected':
            elements.statusText.textContent = 'Connected';
            break;
        case 'disconnected':
            elements.statusText.textContent = 'Disconnected';
            break;
        case 'connecting':
            elements.statusText.textContent = 'Connecting...';
            break;
        case 'error':
            elements.statusText.textContent = 'Connection Error';
            break;
    }

    updateDebugInfo();
}

// Update debug information display
function updateDebugInfo() {
    const debugInfo = {
        status: websocketStatus,
        version: globalSettings.version,
        lastUpdate: new Date().toISOString()
    };
    elements.debugInfo.value = JSON.stringify(debugInfo, null, 2);
}

// Save settings to the plugin
function saveSettings() {
    if (!connection) return;

    const json = {
        event: 'setSettings',
        context: pluginUUID,
        payload: globalSettings
    };
    
    connection.send(JSON.stringify(json));
    updateDebugInfo();
}

// Set up event listeners for form elements
function setupEventListeners() {
    // Checkbox handlers
    elements.muteOnJoin.addEventListener('change', (e) => {
        globalSettings.muteOnJoin = e.target.checked;
        saveSettings();
    });

    elements.videoOffOnJoin.addEventListener('change', (e) => {
        globalSettings.videoOffOnJoin = e.target.checked;
        saveSettings();
    });

    elements.autoReconnect.addEventListener('change', (e) => {
        globalSettings.autoReconnect = e.target.checked;
        saveSettings();
    });

    // Input handlers with debouncing
    let debounceTimeout;
    const debounceDelay = 500;

    elements.muteShortcut.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            globalSettings.muteShortcut = e.target.value;
            saveSettings();
        }, debounceDelay);
    });

    elements.videoShortcut.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            globalSettings.videoShortcut = e.target.value;
            saveSettings();
        }, debounceDelay);
    });

    // Select handler
    elements.reconnectDelay.addEventListener('change', (e) => {
        globalSettings.reconnectDelay = parseInt(e.target.value);
        saveSettings();
    });

    // Button handlers
    elements.resetButton.addEventListener('click', () => {
        globalSettings = { ...DEFAULT_SETTINGS };
        handleSettings(globalSettings);
        saveSettings();
    });

    elements.testButton.addEventListener('click', async () => {
        elements.testButton.disabled = true;
        try {
            const json = {
                event: 'testConnection',
                context: pluginUUID
            };
            connection.send(JSON.stringify(json));
        } finally {
            setTimeout(() => {
                elements.testButton.disabled = false;
            }, 2000);
        }
    });
}

// Initialize inspector when loaded
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus('connecting');
});