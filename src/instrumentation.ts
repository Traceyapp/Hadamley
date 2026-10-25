/** Runs once when a server instance starts: loads the site's data from Supabase before any page is served. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadSiteData } = await import("./instrumentation-node");
    await loadSiteData();
  }
}
