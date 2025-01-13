import WebSocket from 'ws';
import OpenAI from 'openai';
import require$$1 from 'path';
import require$$2 from 'os';
import require$$3 from 'crypto';

class WebSocketManager {
    constructor(port, pluginUUID, registerEvent, info) {
        this.pluginUUID = pluginUUID;
        this.ws = new WebSocket(`ws://127.0.0.1:${port}`);
        this.ws.on('open', () => {
            this.register(registerEvent, info);
        });
    }
    register(event, info) {
        this.ws.send(JSON.stringify({
            event: event,
            uuid: this.pluginUUID
        }));
    }
    send(event, context, payload = {}) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                action: event,
                event: 'sendToPlugin',
                context: context,
                payload: payload
            }));
        }
    }
    showAlert(context) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'showAlert',
                context: context
            }));
        }
    }
    showOk(context) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'showOk',
                context: context
            }));
        }
    }
    setTitle(context, title) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'setTitle',
                context: context,
                payload: {
                    title: title
                }
            }));
        }
    }
    setState(context, state) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'setState',
                context: context,
                payload: {
                    state: state
                }
            }));
        }
    }
    onMessage(callback) {
        this.ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            callback(message);
        });
    }
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var main$1 = {exports: {}};

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: _nodeResolve_empty
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

var name = "dotenv";
var version$1 = "16.4.7";
var description = "Loads environment variables from .env file";
var main = "lib/main.js";
var types = "lib/main.d.ts";
var exports = {
	".": {
		types: "./lib/main.d.ts",
		require: "./lib/main.js",
		"default": "./lib/main.js"
	},
	"./config": "./config.js",
	"./config.js": "./config.js",
	"./lib/env-options": "./lib/env-options.js",
	"./lib/env-options.js": "./lib/env-options.js",
	"./lib/cli-options": "./lib/cli-options.js",
	"./lib/cli-options.js": "./lib/cli-options.js",
	"./package.json": "./package.json"
};
var scripts = {
	"dts-check": "tsc --project tests/types/tsconfig.json",
	lint: "standard",
	pretest: "npm run lint && npm run dts-check",
	test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
	"test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
	prerelease: "npm test",
	release: "standard-version"
};
var repository = {
	type: "git",
	url: "git://github.com/motdotla/dotenv.git"
};
var funding = "https://dotenvx.com";
var keywords = [
	"dotenv",
	"env",
	".env",
	"environment",
	"variables",
	"config",
	"settings"
];
var readmeFilename = "README.md";
var license = "BSD-2-Clause";
var devDependencies = {
	"@types/node": "^18.11.3",
	decache: "^4.6.2",
	sinon: "^14.0.1",
	standard: "^17.0.0",
	"standard-version": "^9.5.0",
	tap: "^19.2.0",
	typescript: "^4.8.4"
};
var engines = {
	node: ">=12"
};
var browser = {
	fs: false
};
var require$$4 = {
	name: name,
	version: version$1,
	description: description,
	main: main,
	types: types,
	exports: exports,
	scripts: scripts,
	repository: repository,
	funding: funding,
	keywords: keywords,
	readmeFilename: readmeFilename,
	license: license,
	devDependencies: devDependencies,
	engines: engines,
	browser: browser
};

const fs = require$$0;
const path = require$$1;
const os = require$$2;
const crypto = require$$3;
const packageJson = require$$4;

const version = packageJson.version;

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

// Parse src into an Object
function parse (src) {
  const obj = {};

  // Convert buffer to string
  let lines = src.toString();

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n');

  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];

    // Default undefined or null to empty string
    let value = (match[2] || '');

    // Remove whitespace
    value = value.trim();

    // Check if double quoted
    const maybeQuote = value[0];

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n');
      value = value.replace(/\\r/g, '\r');
    }

    // Add to object
    obj[key] = value;
  }

  return obj
}

function _parseVault (options) {
  const vaultPath = _vaultPath(options);

  // Parse .env.vault
  const result = DotenvModule.configDotenv({ path: vaultPath });
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = 'MISSING_DATA';
    throw err
  }

  // handle scenario for comma separated keys - for use with key rotation
  // example: DOTENV_KEY="dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod"
  const keys = _dotenvKey(options).split(',');
  const length = keys.length;

  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      // Get full key
      const key = keys[i].trim();

      // Get instructions for decrypt
      const attrs = _instructions(result, key);

      // Decrypt
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);

      break
    } catch (error) {
      // last key
      if (i + 1 >= length) {
        throw error
      }
      // try next key
    }
  }

  // Parse decrypted .env string
  return DotenvModule.parse(decrypted)
}

function _log (message) {
  console.log(`[dotenv@${version}][INFO] ${message}`);
}

function _warn (message) {
  console.log(`[dotenv@${version}][WARN] ${message}`);
}

function _debug (message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}

function _dotenvKey (options) {
  // prioritize developer directly setting options.DOTENV_KEY
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY
  }

  // secondary infra already contains a DOTENV_KEY environment variable
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY
  }

  // fallback to empty string
  return ''
}

function _instructions (result, dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development');
      err.code = 'INVALID_DOTENV_KEY';
      throw err
    }

    throw error
  }

  // Get decrypt key
  const key = uri.password;
  if (!key) {
    const err = new Error('INVALID_DOTENV_KEY: Missing key part');
    err.code = 'INVALID_DOTENV_KEY';
    throw err
  }

  // Get environment
  const environment = uri.searchParams.get('environment');
  if (!environment) {
    const err = new Error('INVALID_DOTENV_KEY: Missing environment part');
    err.code = 'INVALID_DOTENV_KEY';
    throw err
  }

  // Get ciphertext payload
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey]; // DOTENV_VAULT_PRODUCTION
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT';
    throw err
  }

  return { ciphertext, key }
}

function _vaultPath (options) {
  let possibleVaultPath = null;

  if (options && options.path && options.path.length > 0) {
    if (Array.isArray(options.path)) {
      for (const filepath of options.path) {
        if (fs.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options.path.endsWith('.vault') ? options.path : `${options.path}.vault`;
    }
  } else {
    possibleVaultPath = path.resolve(process.cwd(), '.env.vault');
  }

  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath
  }

  return null
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

function _configVault (options) {
  _log('Loading env from encrypted .env.vault');

  const parsed = DotenvModule._parseVault(options);

  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }

  DotenvModule.populate(processEnv, parsed, options);

  return { parsed }
}

function configDotenv (options) {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding = 'utf8';
  const debug = Boolean(options && options.debug);

  if (options && options.encoding) {
    encoding = options.encoding;
  } else {
    if (debug) {
      _debug('No encoding is specified. UTF-8 is used by default');
    }
  }

  let optionPaths = [dotenvPath]; // default, look for .env
  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [_resolveHome(options.path)];
    } else {
      optionPaths = []; // reset default
      for (const filepath of options.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }

  // Build the parsed data in a temporary object (because we need to return it).  Once we have the final
  // parsed data, we will combine it with process.env (or options.processEnv if provided).
  let lastError;
  const parsedAll = {};
  for (const path of optionPaths) {
    try {
      // Specifying an encoding returns a string instead of a buffer
      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }));

      DotenvModule.populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) {
        _debug(`Failed to load ${path} ${e.message}`);
      }
      lastError = e;
    }
  }

  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }

  DotenvModule.populate(processEnv, parsedAll, options);

  if (lastError) {
    return { parsed: parsedAll, error: lastError }
  } else {
    return { parsed: parsedAll }
  }
}

// Populates process.env from .env file
function config (options) {
  // fallback to original dotenv if DOTENV_KEY is not set
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options)
  }

  const vaultPath = _vaultPath(options);

  // dotenvKey exists but .env.vault file does not exist
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);

    return DotenvModule.configDotenv(options)
  }

  return DotenvModule._configVault(options)
}

function decrypt (encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), 'hex');
  let ciphertext = Buffer.from(encrypted, 'base64');

  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);

  try {
    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === 'Invalid key length';
    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data';

    if (isRange || invalidKeyLength) {
      const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)');
      err.code = 'INVALID_DOTENV_KEY';
      throw err
    } else if (decryptionFailed) {
      const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY');
      err.code = 'DECRYPTION_FAILED';
      throw err
    } else {
      throw error
    }
  }
}

// Populate process.env with parsed values
function populate (processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug);
  const override = Boolean(options && options.override);

  if (typeof parsed !== 'object') {
    const err = new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate');
    err.code = 'OBJECT_REQUIRED';
    throw err
  }

  // Set process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
      }

      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
    }
  }
}

const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};

main$1.exports.configDotenv = DotenvModule.configDotenv;
main$1.exports._configVault = DotenvModule._configVault;
main$1.exports._parseVault = DotenvModule._parseVault;
main$1.exports.config = DotenvModule.config;
main$1.exports.decrypt = DotenvModule.decrypt;
main$1.exports.parse = DotenvModule.parse;
main$1.exports.populate = DotenvModule.populate;

main$1.exports = DotenvModule;

var mainExports = main$1.exports;
var dotenv = /*@__PURE__*/getDefaultExportFromCjs(mainExports);

dotenv.config();
const TEMPLATES = {
    text: {
        systemPrompt: "You are a creative writer and content creator.",
        userPromptTemplate: "{prompt}"
    },
    image: {
        systemPrompt: "Create detailed image descriptions.",
        userPromptTemplate: "Create a detailed, vivid image of: {prompt}"
    },
    tweet: {
        systemPrompt: "You are a social media expert who creates engaging tweets within 280 characters.",
        userPromptTemplate: "Create an engaging tweet about: {prompt}"
    },
    blog: {
        systemPrompt: "You are a professional blog writer who creates well-structured, engaging blog posts.",
        userPromptTemplate: "Write a blog post about: {prompt}\n\nMake it engaging and include a clear structure with headings."
    },
    code: {
        systemPrompt: "You are a senior software developer who writes clean, well-documented code.",
        userPromptTemplate: "Write code for: {prompt}\n\nInclude comments and explain any complex parts."
    },
    email: {
        systemPrompt: "You are a professional email writer who creates clear, concise, and effective emails.",
        userPromptTemplate: "Write an email about: {prompt}\n\nMake it professional and to the point."
    },
    social: {
        systemPrompt: "You are a social media manager who creates engaging content for various platforms.",
        userPromptTemplate: "Create a social media post about: {prompt}\n\nMake it engaging and shareable."
    }
};
class OpenAIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    getPrompt(type, userPrompt) {
        const template = TEMPLATES[type];
        const formattedUserPrompt = template.userPromptTemplate.replace('{prompt}', userPrompt);
        return [
            { role: 'system', content: template.systemPrompt },
            { role: 'user', content: formattedUserPrompt }
        ];
    }
    async generateContent(prompt, type = 'text') {
        try {
            if (type === 'image') {
                const image = await this.client.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                });
                return image.data[0]?.url || 'No image generated';
            }
            const messages = this.getPrompt(type, prompt);
            const completion = await this.client.chat.completions.create({
                messages,
                model: 'gpt-4-turbo-preview',
                temperature: type === 'code' ? 0.2 : 0.7, // Lower temperature for code generation
                max_tokens: type === 'tweet' ? 100 : 1000,
            });
            return completion.choices[0]?.message?.content || 'No content generated';
        }
        catch (error) {
            console.error('Error generating content:', error);
            throw new Error('Failed to generate content');
        }
    }
}

class AIContentCreatorPlugin {
    constructor() {
        this.outputWindow = null;
        // Get connection parameters from environment
        const args = process.argv;
        const port = args[2];
        const pluginUUID = args[4];
        const registerEvent = args[6];
        const info = args[8];
        this.contexts = new Map();
        // Initialize WebSocket connection
        this.ws = new WebSocketManager(parseInt(port), pluginUUID, registerEvent, info);
        // Initialize OpenAI service
        this.openai = new OpenAIService();
        // Set up message handling
        this.ws.onMessage(this.handleMessage.bind(this));
        // Initialize output window
        this.createOutputWindow();
    }
    createOutputWindow() {
        const width = 600;
        const height = 800;
        const left = screen.width - width;
        const top = (screen.height - height) / 2;
        this.outputWindow = window.open('output.html', 'AI Content Output', `width=${width},height=${height},left=${left},top=${top}`);
    }
    async handleMessage(message) {
        switch (message.event) {
            case 'keyDown':
                await this.handleKeyDown(message.context, message.action);
                break;
            case 'willAppear':
                this.contexts.set(message.context, {
                    prompt: message.payload?.settings?.prompt || this.getDefaultPrompt(message.action)
                });
                break;
            case 'didReceiveSettings':
                this.contexts.set(message.context, {
                    prompt: message.payload?.settings?.prompt || this.getDefaultPrompt(message.action)
                });
                break;
        }
    }
    getDefaultPrompt(action) {
        const defaults = {
            'com.elgato.ai-content-creator.text': 'Generate a creative story',
            'com.elgato.ai-content-creator.tweet': 'Write an engaging tweet about technology',
            'com.elgato.ai-content-creator.blog': 'Write a blog post about AI',
            'com.elgato.ai-content-creator.code': 'Write a Hello World program',
            'com.elgato.ai-content-creator.image': 'A futuristic cityscape at night'
        };
        return defaults[action] || 'Generate content';
    }
    getContentType(action) {
        const types = {
            'com.elgato.ai-content-creator.text': 'text',
            'com.elgato.ai-content-creator.tweet': 'tweet',
            'com.elgato.ai-content-creator.blog': 'blog',
            'com.elgato.ai-content-creator.code': 'code',
            'com.elgato.ai-content-creator.image': 'image'
        };
        return types[action] || 'text';
    }
    async handleKeyDown(context, action) {
        try {
            const settings = this.contexts.get(context);
            if (!settings)
                return;
            this.ws.setTitle(context, '...');
            const contentType = this.getContentType(action);
            const content = await this.openai.generateContent(settings.prompt, contentType);
            // Display content in output window
            if (this.outputWindow) {
                this.outputWindow.postMessage({ content, type: contentType }, '*');
            }
            this.ws.showOk(context);
            this.ws.setTitle(context, 'Done!');
            setTimeout(() => {
                this.ws.setTitle(context, '');
            }, 2000);
        }
        catch (error) {
            console.error('Error handling key down:', error);
            this.ws.showAlert(context);
            this.ws.setTitle(context, 'Error');
        }
    }
}
// Start the plugin
new AIContentCreatorPlugin();
//# sourceMappingURL=plugin.js.map
