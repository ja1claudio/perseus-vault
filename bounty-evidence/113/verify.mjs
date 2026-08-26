import { createHash } from "node:crypto";

const required = (name) => {
  const value = process.env[`RUNX_INPUT_${name.toUpperCase()}`];
  if (!value) throw new Error(`missing input: ${name}`);
  return value;
};

const publicUrl = required("public_url").replace(/\/$/, "");
const upstreamPr = required("upstream_pr");
const expectedCommit = required("expected_source_commit");
const expectedDigest = required("expected_raw_sha256");
const expectedToolCount = Number(required("expected_tool_count"));
const headers = { "User-Agent": "ja1claudio-perseus-sourcey-audit/1.0" };

const get = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response;
};

const [pageResponse, metadataResponse, rawResponse, renderedResponse, prResponse] =
  await Promise.all([
    get(`${publicUrl}/`),
    get(`${publicUrl}/metadata.json`),
    get(`${publicUrl}/mcp.raw.json`),
    get(`${publicUrl}/mcp.render.json`),
    get("https://api.github.com/repos/Perseus-Computing-LLC/perseus-vault/pulls/1160"),
  ]);

const page = await pageResponse.text();
const metadata = await metadataResponse.json();
const rawBytes = Buffer.from(await rawResponse.arrayBuffer());
const rendered = await renderedResponse.json();
const raw = JSON.parse(rawBytes.toString("utf8"));
const pr = await prResponse.json();
const rawDigest = createHash("sha256").update(rawBytes).digest("hex");
const rawNames = raw.tools.map((tool) => tool.name);
const renderedNames = rendered.tools.map((tool) => tool.name);
const uniqueRawNames = [...new Set(rawNames)];
const uniqueRenderedNames = [...new Set(renderedNames)];
const spotChecks = uniqueRawNames.slice(0, 5).map((name) => ({
  name,
  present_in_live_reference: page.includes(name),
  present_in_rendered_snapshot: renderedNames.includes(name),
}));

const checks = {
  public_url_http_200: pageResponse.status === 200,
  title_matches: page.includes("Perseus Vault - API Reference"),
  source_commit_matches: metadata.source_commit === expectedCommit,
  sourcey_version: metadata.generators?.sourcey === "3.6.5",
  mcp_parser_version: metadata.generators?.mcp_parser === "0.4.1",
  feature_profile: metadata.feature_profile === "--no-default-features",
  raw_sha256_matches: rawDigest === expectedDigest && metadata.raw_snapshot_sha256 === expectedDigest,
  tool_count_matches:
    uniqueRawNames.length === expectedToolCount &&
    uniqueRenderedNames.length === expectedToolCount &&
    metadata.tool_count === expectedToolCount,
  ordered_tool_names_preserved: JSON.stringify(rawNames) === JSON.stringify(renderedNames),
  five_live_spot_checks_pass: spotChecks.every((check) =>
    check.present_in_live_reference && check.present_in_rendered_snapshot),
  upstream_pr_url_matches: pr.html_url === upstreamPr,
  upstream_pr_merged: pr.merged === true,
  upstream_pr_author_matches: pr.user?.login === "ja1claudio",
  upstream_merge_commit_matches: pr.merge_commit_sha === expectedCommit,
};

if (!Object.values(checks).every(Boolean)) {
  throw new Error(JSON.stringify({ checks, spot_checks: spotChecks }));
}

process.stdout.write(`${JSON.stringify({
  audit: {
    status: "passed",
    checked_at: new Date().toISOString(),
    public_url: `${publicUrl}/`,
    upstream_pr: upstreamPr,
    source_commit: metadata.source_commit,
    vault_version: metadata.vault_version,
    sourcey_version: metadata.generators.sourcey,
    mcp_parser_version: metadata.generators.mcp_parser,
    feature_profile: metadata.feature_profile,
    tool_count: metadata.tool_count,
    raw_snapshot_sha256: rawDigest,
    checks,
    spot_checks: spotChecks,
  },
})}\n`);
