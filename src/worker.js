export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirects = {
      "/activities": "/experiences/",
      "/activities/": "/experiences/",
      "/plans": "/pricing/",
      "/plans/": "/pricing/",
      "/free-enquiry": "/enquiry/",
      "/free-enquiry/": "/enquiry/"
    };

    if (redirects[url.pathname]) {
      return Response.redirect(new URL(redirects[url.pathname], url.origin), 301);
    }

    return env.ASSETS.fetch(request);
  }
};
