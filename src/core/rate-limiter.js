const logger = require('./logger');

class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), windowMs);
  }

  /**
   * Check if a client has exceeded their rate limit
   * @param {string} clientId - The client identifier
   * @returns {boolean} - Whether the client is within their limit
   */
  checkLimit(clientId) {
    const now = Date.now();
    let clientData = this.clients.get(clientId);

    // Initialize client data if it doesn't exist
    if (!clientData) {
      clientData = {
        requests: [],
        blocked: false,
        lastWarning: 0
      };
      this.clients.set(clientId, clientData);
    }

    // If client is blocked, check if block period is over
    if (clientData.blocked) {
      const blockAge = now - clientData.blocked;
      if (blockAge > this.windowMs * 2) { // Double window for blocking
        clientData.blocked = false;
        clientData.requests = [];
        logger.info(`Rate limit block removed for client: ${clientId}`);
      } else {
        return false;
      }
    }

    // Remove old requests
    clientData.requests = clientData.requests.filter(
      time => now - time < this.windowMs
    );

    // Add new request
    clientData.requests.push(now);

    // Check if limit is exceeded
    if (clientData.requests.length > this.maxRequests) {
      // Only log warning once per window
      if (now - clientData.lastWarning > this.windowMs) {
        logger.warn(`Rate limit exceeded for client ${clientId}: ${clientData.requests.length} requests in ${this.windowMs}ms`);
        clientData.lastWarning = now;
      }

      // If significantly exceeded, block the client
      if (clientData.requests.length > this.maxRequests * 2) {
        clientData.blocked = now;
        logger.warn(`Client ${clientId} blocked for excessive requests`);
      }

      return false;
    }

    return true;
  }

  /**
   * Remove a client's rate limiting data
   * @param {string} clientId - The client identifier
   */
  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    this.clients.forEach((data, clientId) => {
      // Remove clients with no recent requests
      if (data.requests.length === 0 && (!data.blocked || now - data.blocked > this.windowMs * 2)) {
        this.clients.delete(clientId);
      }
    });
  }

  /**
   * Get client statistics
   * @param {string} clientId - The client identifier
   * @returns {Object} Client statistics
   */
  getClientStats(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData) {
      return null;
    }

    const now = Date.now();
    return {
      requestCount: clientData.requests.length,
      isBlocked: Boolean(clientData.blocked),
      blockAge: clientData.blocked ? now - clientData.blocked : 0,
      oldestRequest: clientData.requests[0] ? now - clientData.requests[0] : 0,
      remainingRequests: Math.max(0, this.maxRequests - clientData.requests.length)
    };
  }

  /**
   * Get overall statistics
   * @returns {Object} Overall statistics
   */
  getStats() {
    const now = Date.now();
    let totalRequests = 0;
    let blockedClients = 0;

    this.clients.forEach(data => {
      totalRequests += data.requests.length;
      if (data.blocked) blockedClients++;
    });

    return {
      activeClients: this.clients.size,
      totalRequests,
      blockedClients,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    };
  }
}

module.exports = RateLimiter;