import time
import logging
from collections import defaultdict
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

# Sliding-window rate limit store in-memory: { client_ip: [(timestamp, endpoint_key), ...] }
# IP -> list of timestamps
_RATE_LIMIT_STORE = defaultdict(list)

# Rate limits: (max_requests, window_seconds)
RATE_LIMIT_RULES = {
    'auth': {
        'endpoints': ['/api/customer/login', '/api/customer/signup', '/api/admin/login'],
        'limit': 10,
        'window': 60,
        'label': 'Authentication'
    },
    'orders': {
        'endpoints': ['/api/orders/create'],
        'limit': 6,
        'window': 60,
        'label': 'Order Placement'
    },
    'heavy': {
        'endpoints': ['/api/scrape-metadata', '/api/upload-images'],
        'limit': 15,
        'window': 60,
        'label': 'Product Fetcher & Uploads'
    },
    'general': {
        'endpoints': ['/api/'],
        'limit': 120,
        'window': 60,
        'label': 'General Catalog'
    }
}

def get_client_ip(request):
    """Accurately extracts client IP including Cloudflare and reverse proxy headers"""
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        return cf_ip.strip()
    
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    
    return request.META.get('REMOTE_ADDR', '127.0.0.1').strip()

class SecurityAndRateLimitMiddleware(MiddlewareMixin):
    """
    1. Sliding-window rate limiting per IP across sensitive and general endpoints.
    2. Strips raw internal error messages to ensure zero sensitive stacktrace leakage.
    3. Injects modern HTTP security headers on all responses.
    """

    def process_request(self, request):
        path = request.path_info

        # Only rate-limit API endpoints
        if not path.startswith('/api/'):
            return None

        client_ip = get_client_ip(request)
        now = time.time()

        # Find matching rule
        matched_rule = None
        for rule_key in ['auth', 'orders', 'heavy', 'general']:
            rule = RATE_LIMIT_RULES[rule_key]
            if any(path.startswith(ep) for ep in rule['endpoints']):
                matched_rule = (rule_key, rule)
                break

        if matched_rule:
            rule_key, rule = matched_rule
            limit = rule['limit']
            window = rule['window']
            store_key = f"{client_ip}:{rule_key}"

            # Filter out timestamps older than current window
            active_timestamps = [t for t in _RATE_LIMIT_STORE[store_key] if now - t < window]
            
            if len(active_timestamps) >= limit:
                # Rate limit exceeded
                retry_after = int(window - (now - active_timestamps[0])) + 1
                response = JsonResponse({
                    "success": False,
                    "error_type": "RATE_LIMIT_EXCEEDED",
                    "message": f"Too many {rule['label']} requests. For security, please pause for a moment.",
                    "retry_after_seconds": max(1, retry_after)
                }, status=429)
                response['Retry-After'] = str(max(1, retry_after))
                return response

            # Record this request timestamp
            active_timestamps.append(now)
            _RATE_LIMIT_STORE[store_key] = active_timestamps

        return None

    def process_exception(self, request, exception):
        """Catches all unhandled exceptions on /api/ and formats a clean, safe response"""
        logger.error(f"Unhandled exception on {request.path}: {str(exception)}", exc_info=True)

        if request.path.startswith('/api/'):
            return JsonResponse({
                "success": False,
                "error_type": "SERVER_ERROR",
                "message": "We encountered a temporary processing issue. Please refresh or try again in a few moments."
            }, status=500)
        return None

    def process_response(self, request, response):
        """Enforce standard security headers"""
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        return response
