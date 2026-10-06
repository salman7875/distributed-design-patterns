vcl 4.1;

import std;

backend default {
    .host = "main-app-service.default.svc.cluster.local";
    .port = "3000";

    .probe = {
        .url = "/health";
        .interval = 5s;
        .timeout = 2s;
        .window = 5;
        .threshold = 3;
    }
}

sub vcl_recv {
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    set req.http.X-Varnish-Proxy = "true";

    if (req.url ~ "^/api/") {
        unset req.http.Cookie;
        unset req.http.Authorization;
    }
}

sub vcl_backend_response {
    # Typo fix: 'berep' must be 'beresp' in vcl_backend_response
    if (beresp.http.Surrogate-Control) {
        set beresp.ttl = std.duration(beresp.http.Surrogate-Control + "s", 1h);
    }

    set beresp.grace = 1h;
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}